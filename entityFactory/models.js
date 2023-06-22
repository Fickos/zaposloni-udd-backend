const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  resume: String,
  coverLetter: String,
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = { JobApplication };
