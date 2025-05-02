const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Environment variables for email and SMTP credentials
const emailUser = process.env.EMAIL_USER_FORM;
const emailPass = process.env.EMAIL_PASS_FORM;

// List of recipient email addresses
const recipientEmails = [
  "tech3@imperiorailing.com",
  "tech1@imperiorailing.com",
];

// Join the recipient emails into a comma-separated string
const recipients = recipientEmails.join(",");

const subject = "MongoDB Export CSV Files";

// Get the list of CSV file paths passed as arguments
const files = process.argv.slice(2); // All files passed as arguments

// Log the files being passed for debugging
console.log("Files to be attached:", files);

// Check if the files exist and log results
files.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`File exists: ${file}`);
  } else {
    console.error(`File does not exist: ${file}`);
  }
});

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or other email services, like 'smtp.mailtrap.io'
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Prepare attachments from passed file paths
const attachments = files.map((file) => ({
  filename: path.basename(file),
  path: path.resolve(process.cwd(), file), // Use the current working directory to resolve paths
}));

// Log the mail options to debug the attachment configuration
console.log("Mail Options:", {
  from: emailUser,
  to: recipients,
  subject: subject,
  text: "Please find attached the exported MongoDB data in CSV format.",
  attachments: attachments,
});

// Email options
const mailOptions = {
  from: emailUser,
  to: recipients, // Multiple recipients
  subject: subject,
  text: "Please find attached the exported MongoDB data in CSV format.",
  attachments: attachments, // Attach the files dynamically
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
