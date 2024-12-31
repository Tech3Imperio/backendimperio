const express = require("express");
const { enquiryformsubmission } = require("../Controllers/contact"); // Import your controller

const router = express.Router();

// Route for handling dealer registration (inquiry) form submission
router.post("/enquiry", enquiryformsubmission);

module.exports = router;
