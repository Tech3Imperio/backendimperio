const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Environment variables for email and SMTP credentials
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const recipientEmail = "tech3@imperiorailing.com"; // Replace with HR's email address
const subject = "MongoDB Export CSV File";

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or other email services, like 'smtp.mailtrap.io'
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Email options
const mailOptions = {
  from: emailUser,
  to: recipientEmail,
  subject: subject,
  text: "Please find attached the exported MongoDB data in CSV format.",
  attachments: [
    {
      filename: "output.csv",
      path: path.resolve(__dirname, "output.csv"),
    },
  ],
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
