const express = require('express');
const router = express.Router();

const logger = require('../logger');
require('../entityFactory');
const { JobApplication } = require('../entityFactory/models');

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

router.post('/', async (req, res, next) => {
    try {
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