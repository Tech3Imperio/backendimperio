const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  location: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  highestQualification: { type: String, required: true },
  skills: { type: String, required: true },
  portfolioLink: { type: String, required: false },
  companyName: { type: String, required: false },
  designation: { type: String, required: false },
  experienceYears: { type: String, required: true },
  coverLetter: { type: String, required: false },
  position: { type: String, required: true },
  jobType: { type: String, required: true },
  resume: { type: String, required: true }, // The path of the uploaded resume
});

const JobApplication = mongoose.model("Jobapplications", jobApplicationSchema);

module.exports = JobApplication;
