// const nodemailer = require("nodemailer");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const JobApplication = require("../Models/jobapplication");

// // Ensure the uploads directory exists
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// // Set up Multer storage for file uploads (resumes)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadsDir); // Specify the directory to store the uploaded file
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to create a unique filename
//   },
// });

// // Configure Multer to handle single file uploads (resume)
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 2MB
// }).single("resume"); // "resume" should match the key in the form data for file upload

// // Controller function to handle form submission and send email
// exports.submitApplication = (req, res) => {
//   upload(req, res, async (err) => {
//     if (err instanceof multer.MulterError) {
//       console.error("Multer error:", err);
//       return res.status(400).json({
//         status: "error",
//         message: `Error uploading file: ${err.message}`,
//       });
//     } else if (err) {
//       console.error("Error uploading file:", err);
//       return res.status(500).json({
//         status: "error",
//         message: "An unexpected error occurred while uploading the file.",
//       });
//     }

//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ status: "error", message: "No resume uploaded" });
//     }

//     const {
//       name,
//       surname,
//       location,
//       mobile,
//       email,
//       highestQualification,
//       skills,
//       portfolioLink,
//       companyName,
//       designation,
//       experienceYears,
//       coverLetter,
//       position,
//       jobType,
//     } = req.body;

//     try {
//       const newApplication = new JobApplication({
//         name,
//         surname,
//         location,
//         mobile,
//         email,
//         highestQualification,
//         skills,
//         portfolioLink,
//         companyName,
//         designation,
//         experienceYears,
//         coverLetter,
//         position,
//         jobType,
//         resume: req.file.path,
//       });

//       await newApplication.save();

//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//       });

//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: "tech3@imperiorailing.com",
//         subject: `New Job Application for ${position} - ${jobType}`,
//         text: `
//           A new job application has been received for the ${position} position. The details are as follows:

//           Name: ${name} ${surname}
//           Email: ${email}
//           Position: ${position}
//           Job Type: ${jobType}

//           You can view the resume here: ${req.file.path}
//         `,
//       };

//       await transporter.sendMail(mailOptions);

//       res.status(200).json({
//         status: "success",
//         message: "Job application submitted successfully.",
//       });
//     } catch (error) {
//       console.error("Error processing application:", error);
//       res.status(500).json({
//         status: "error",
//         message: "Server error occurred while submitting job application.",
//       });
//     }
//   });
// };

const cloudinary = require("cloudinary").v2; // Import Cloudinary
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const JobApplication = require("../Models/jobapplication");
const { Readable } = require("stream"); // Used for streaming the file to Cloudinary

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer to use memory storage (store file in memory)
const storage = multer.memoryStorage(); // Store files in memory (RAM)

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
}).single("resume"); // "resume" should match the key in the form data for file upload

// Helper function to upload the resume file to Cloudinary
const uploadResumeToCloudinary = async (fileBuffer, fileName) => {
  try {
    // Upload the file directly from memory to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw", // PDF files are raw files (not images)
          folder: "resumes", // Store file in the "resumes" folder
          public_id: fileName, // You can use the file name or any custom naming scheme
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );

      // Pipe the file buffer to Cloudinary
      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null); // End the stream
      stream.pipe(uploadStream);
    });

    return result.secure_url; // Return the secure URL of the uploaded file
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Error uploading file to Cloudinary");
  }
};

// Controller function to handle job application form submission
exports.submitApplication = (req, res) => {
  // Handle file upload via Multer
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

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No resume uploaded",
      });
    }

    // Extract form data from the request body
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
      // Upload the resume file to Cloudinary and get the secure URL
      const resumeUrl = await uploadResumeToCloudinary(
        req.file.buffer,
        req.file.originalname
      );

      // Create a new job application document in the database
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
        resume: resumeUrl, // Save the Cloudinary URL of the resume
      });

      // Save the application to MongoDB
      await newApplication.save();

      // Set up email transporter (for notifications)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Define the email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "tech3@imperiorailing.com", // Recipient email address
        subject: `New Job Application for ${position} - ${jobType}`,
        text: `
          A new job application has been received for the ${position} position. The details are as follows:
          
          Name: ${name} ${surname}
          Email: ${email}
          Position: ${position}
          Job Type: ${jobType}
          
          You can view the resume here: ${resumeUrl}
        `,
      };

      // Send the email notification
      await transporter.sendMail(mailOptions);

      // Respond with success
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
