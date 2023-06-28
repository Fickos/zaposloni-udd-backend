const fs = require('fs');

const axios = require('axios');
const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const logger = require('../logger');
require('../entityFactory');
const config = require('../config');
const { JobApplication } = require('../entityFactory/models');
const { indexDocument, search } = require('../elastic');
const { extractTextFromPDF } = require('../utils/pdf.utils');
const { mapClientQueryToElasticsearchQuery } = require('../utils/mapper.utils');

router.get('/', async (req, res, next) => {
    try {
        const result = await JobApplication.find();
        
        logger.info('Returning all job applications');
        res.status(200).send(result);
    } catch (e) {
        logger.error(e);
        res.status(400).send();
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await JobApplication.findById(id);
        
        logger.info('Returning one job application');
        res.status(200).send(result);
    } catch (e) {
        logger.error(`Job application with ID: ${id} not found`);
        res.status(404).send({ message: "not_found" });
    }
});

router.post('/', 
    upload.fields([
        { name: 'cv', maxCount: 1 },
        { name: 'coverLetter', maxCount: 1 },
    ]),
    async (req, res, next) => {
    try {
        const cv = req.files?.['cv']?.[0];
        const coverLetter = req.files?.['coverLetter']?.[0];
        req.body = JSON.parse(req.body.jsonData);

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.address}&key=${config.GOOGLE_API_KEY}`;

        const response = await axios.get(url);

        const lat = response.data?.results?.[0]?.geometry?.location?.lat ?? 45.014566;
        const lon = response.data?.results?.[0]?.geometry?.location?.lng ?? 19.805530;

        req.body.location = { lat, lon }; 

        if (cv) {
            const cvBuffer = fs.readFileSync(cv.path);
            const cvContent = await extractTextFromPDF(cvBuffer);
            
            await indexDocument('cv_with_geo', cv.filename ?? '', cvContent, cv.originalname, req.body);
        }

        if (coverLetter) {
            const coverLetterBuffer = fs.readFileSync(coverLetter.path);
            const coverLetterContent = await extractTextFromPDF(coverLetterBuffer);
            
            await indexDocument('cover_letter_index2', coverLetter.filename ?? '', coverLetterContent, coverLetter.originalname, req.body);
        }
        
        const newJobApplication = new JobApplication(req.body);
        
        const result = await newJobApplication.save();
        
        logger.info('Created Job application: ');
        logger.info(result);

        res.status(201).send({ message: "created", result });

    } catch (e) {
        console.error(e);
        res.status(400).send({ message: "bad_request" });
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const jobId = req.params.id;
        const { name, surname, email, resume, coverLetter } = req.body;
        const updatedJobApplication = await JobApplication.updateOne(
            { _id: jobId },
            { $set: { name, surname, email, resume, coverLetter } }
        );
        
        if (updatedJobApplication.n === 0) {
            return res.status(404).json({ message: 'not_found' });
        }

        logger.info(`Job application with ID: ${jobId} updated successfuly`);
        return res.status(200).send(updatedJobApplication);
    } catch (e) {
        logger.error(e);
        res.status(400).send({ message: "bad_request" });
    }
});

router.post('/search', async (req, res, next) => {
    const paramsList = [
        "name",
        "surname",
        "education",
    ];
    const results = { };
    const searchBody = { query: { match : {} }};

    for (let p of paramsList) {
        if (req.body?.[p]) {
            searchBody.query.match[p] = req.body?.[p];
        }
    }

    if (req.body?.cvContent) {
        searchBody.query.match.content = req.body?.cvContent;
        logger.info('Search body', searchBody);

        const result = await search('cv_with_geo', searchBody);
        results.cv = result;
    }

    if (req.body?.coverLetterContent) {
        searchBody.query.match.content = req.body?.coverLetterContent;
        logger.info('Search body', searchBody);

        const result = await search('cover_letter_index2', searchBody);
        results.cl = result;
    }

    if (!req.body?.cvContent && !req.body?.coverLetterContent) {
        logger.info('Search body', searchBody);
        
        const result = await search('cover_letter_index2', searchBody);
        results.cv = result;
    }

    res.status(200).send(results);
});

router.post('/boolean-search', async (req, res, next) => {
    logger.info('Received boolean query: ', req.body);
    // TO DO FIX MAPPER TO THE BOOLEAN QUERY FROM CLIENT SIDE
    // const boolQueryBody = mapClientQueryToElasticsearchQuery(req.body);

    // EXAMPLE -> (Hello && world) || (Hi && !world);
    // const boolQueryBody = {
    //     query: {
    //         bool: {
    //             should: [
    //               {
    //                 bool: {
    //                   must: [
    //                     { match: { content: 'Hello' } },
    //                     { match: { content: 'world' } }
    //                   ]
    //                 }
    //               },
    //               {
    //                 bool: {
    //                   must: [
    //                     { match: { content: 'Hi' } },
    //                     { bool: { must_not: { match: { content: 'world' } } } }
    //                   ]
    //                 }
    //               }
    //             ]
    //           }
    //     }
    // }
    // console.log(JSON.stringify(boolQueryBody));
    const result = await search('cv_with_geo', boolQueryBody);

    res.status(200).send(result);

});

router.post('/geo-search', async (req, res, next) => {
    const { lat, lon, radius } = req.body;
    
    const geoQueryBody = {
        query: {
            geo_distance: {
                distance: `${radius}km`,
                location: {
                    lat: lat, lon: lon
                }
            }
        }
    };

    const result = await search('cv_with_geo', geoQueryBody);

    res.status(200).send(result);
});

module.exports = router;
