const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const JobApplication = require("../Models/jobapplication");

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up Multer storage for file uploads (resumes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Specify the directory to store the uploaded file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to create a unique filename
  },
});

// Configure Multer to handle single file uploads (resume)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 2MB
}).single("resume"); // "resume" should match the key in the form data for file upload

// Controller function to handle form submission and send email
exports.submitApplication = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        status: "error",
        message: `Error uploading file: ${err.message}`,
      });
    } else if (err) {
      console.error("Error uploading file:", err);
      return res.status(500).json({
        status: "error",
        message: "An unexpected error occurred while uploading the file.",
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ status: "error", message: "No resume uploaded" });
    }

    const {
      name,
      surname,
      location,
      mobile,
      email,
      highestQualification,
      skills,
      portfolioLink,
      companyName,
      designation,
      experienceYears,
      coverLetter,
      position,
      jobType,
    } = req.body;

    try {
      const newApplication = new JobApplication({
        name,
        surname,
        location,
        mobile,
        email,
        highestQualification,
        skills,
        portfolioLink,
        companyName,
        designation,
        experienceYears,
        coverLetter,
        position,
        jobType,
        resume: req.file.path,
      });

      await newApplication.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "tech3@imperiorailing.com",
        subject: `New Job Application for ${position} - ${jobType}`,
        text: `
          A new job application has been received for the ${position} position. The details are as follows:

          Name: ${name} ${surname}
          Email: ${email}
          Position: ${position}
          Job Type: ${jobType}

          You can view the resume here: ${req.file.path}
        `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        status: "success",
        message: "Job application submitted successfully.",
      });
    } catch (error) {
      console.error("Error processing application:", error);
      res.status(500).json({
        status: "error",
        message: "Server error occurred while submitting job application.",
      });
    }
  });
};
