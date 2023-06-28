const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  address: String,
  lat: Number,
  lon: Number,
  resume: String,
  coverLetter: String,
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = { JobApplication };
