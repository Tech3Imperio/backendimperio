const { S3, PutObjectCommand } = require("@aws-sdk/client-s3"); // Import S3 client and PutObjectCommand from AWS SDK v3
const multer = require("multer");
const JobApplication = require("../Models/apllicationjob");
const nodemailer = require("nodemailer");

// Set up AWS S3 with SDK v3
const s3 = new S3({
  region: process.env.AWS_REGION, // AWS Region from .env
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS Access Key from .env
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Access Key from .env
  },
});

// Set up Multer for file upload (in memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
}).single("resume");

// Helper function to upload resume to S3
const uploadResumeToS3 = async (fileBuffer, fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Your S3 Bucket name from .env
    Key: `resumes/${fileName}`, // Use backticks for template literals
    Body: fileBuffer,
    ContentType: "application/pdf", // Assuming the file is a PDF
  };

  try {
    const result = await s3.send(new PutObjectCommand(params)); // Use PutObjectCommand instead of upload
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error); // Log the full error
    throw new Error("Error uploading file to S3");
  }
};

// Controller to handle job application submission
exports.submitApplication = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err.message); // Log multer error
      return res.status(400).json({ status: "error", message: err.message });
    }

    if (!req.file) {
      console.error("No file uploaded"); // Log missing file error
      return res
        .status(400)
        .json({ status: "error", message: "No file uploaded" });
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
      // Upload resume to S3 and get the URL
      const resumeUrl = await uploadResumeToS3(
        req.file.buffer,
        req.file.originalname
      );

      // Create a new job application in MongoDB
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
        resume: resumeUrl, // URL of the uploaded resume
      });

      console.log("Saving application data:", newApplication); // Log the application data

      await newApplication.save();

      // Set up email transporter (for notifications)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Your email from .env
          pass: process.env.EMAIL_PASS, // Your email password from .env
        },
      });

      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "tech3@imperiorailing.com, tech1@imperiorailing.com, hr@imperiorailing.com", // Your recipient email address
        subject: `New Job Application for ${position} - ${jobType}`,
        text: `
          A new job application has been received for the ${position} position.

          Name: ${name} ${surname}
          Email: ${email}
          Phone: ${mobile}
          Position: ${position}
          Resume URL: ${resumeUrl}
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Error sending email:", emailError); // Log email sending error
      }

      // Respond with success
      res.status(200).json({
        status: "success",
        message: "Job application submitted successfully.",
      });
    } catch (error) {
      console.error("Error during application submission:", error); // Log general error
      res.status(500).json({
        status: "error",
        message: error.message || "An error occurred",
      });
    }
  });
};
// const { S3, PutObjectCommand } = require("@aws-sdk/client-s3"); // Import S3 client and PutObjectCommand from AWS SDK v3
// const multer = require("multer");
// const JobApplication = require("../Models/apllicationjob");
// const nodemailer = require("nodemailer");

// // Set up AWS S3 with SDK v3
// const s3 = new S3({
//   region: process.env.AWS_REGION, // AWS Region from .env
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS Access Key from .env
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Access Key from .env
//   },
// });

// // Set up Multer for file upload (in memory storage)
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
// }).single("resume");

// // Helper function to upload resume to S3 with URL encoding of the filename
// const uploadResumeToS3 = async (fileBuffer, fileName) => {
//   const encodedFileName = encodeURIComponent(fileName); // URL encode the resume filename

//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME, // Your S3 Bucket name from .env
//     Key: `resumes/${encodedFileName}`, // Use the encoded filename
//     Body: fileBuffer,
//     ContentType: "application/pdf", // Assuming the file is a PDF
//   };

//   try {
//     const result = await s3.send(new PutObjectCommand(params)); // Use PutObjectCommand instead of upload
//     return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`; // Return the S3 URL
//   } catch (error) {
//     console.error("Error uploading file to S3:", error); // Log the full error
//     throw new Error("Error uploading file to S3");
//   }
// };

// // Controller to handle job application submission
// exports.submitApplication = (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error("Multer error:", err.message); // Log multer error
//       return res.status(400).json({ status: "error", message: err.message });
//     }

//     if (!req.file) {
//       console.error("No file uploaded"); // Log missing file error
//       return res
//         .status(400)
//         .json({ status: "error", message: "No file uploaded" });
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
//       // Upload resume to S3 and get the URL
//       const resumeUrl = await uploadResumeToS3(
//         req.file.buffer,
//         req.file.originalname
//       );

//       // Create a new job application in MongoDB
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
//         resume: resumeUrl, // URL of the uploaded resume
//       });

//       console.log("Saving application data:", newApplication); // Log the application data

//       await newApplication.save();

//       // Set up email transporter (for notifications)
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER, // Your email from .env
//           pass: process.env.EMAIL_PASS, // Your email password from .env
//         },
//       });

//       // Send email notification
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: "tech3@imperiorailing.com, tech1@imperiorailing.com, hr@imperiorailing.com", // List of recipient email addresses
//         subject: `New Job Application for ${position} - ${jobType}`,
//         text: `
//           A new job application has been received for the ${position} position.

//           Name: ${name} ${surname}
//           Email: ${email}
//           Phone: ${mobile}
//           Position: ${position}
//           Resume URL: ${resumeUrl}  // The URL with the encoded filename
//         `,
//       };

//       try {
//         await transporter.sendMail(mailOptions);
//       } catch (emailError) {
//         console.error("Error sending email:", emailError); // Log email sending error
//       }

//       // Respond with success
//       res.status(200).json({
//         status: "success",
//         message: "Job application submitted successfully.",
//       });
//     } catch (error) {
//       console.error("Error during application submission:", error); // Log general error
//       res.status(500).json({
//         status: "error",
//         message: error.message || "An error occurred",
//       });
//     }
//   });
// };
