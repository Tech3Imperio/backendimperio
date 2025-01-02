const express = require("express");
const router = express.Router();
const applicationController = require("../Controllers/jobapplication");

// Route to handle application form submission
router.post("/apply", applicationController.submitApplication);

module.exports = router;
