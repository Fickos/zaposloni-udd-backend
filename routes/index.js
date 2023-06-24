const fs = require('fs');

const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const logger = require('../logger');
require('../entityFactory');
const { JobApplication } = require('../entityFactory/models');
const { indexDocument } = require('../elastic');

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

        if (cv) {
            console.log(cv);
            const cvBuffer = fs.readFileSync(cv.path);
            console.log(cv.originalname);
            await indexDocument('cv_index', cvBuffer, cv.originalname);
        }

        if (coverLetter) {
            const coverLetterBuffer = fs.readFileSync(coverLetter.path);
            console.log(coverLetter.originalname);
            await indexDocument('cover_letter_index', coverLetterBuffer, coverLetter.originalname);
        }
        
        req.body = JSON.parse(req.body.jsonData);
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

module.exports = router;
