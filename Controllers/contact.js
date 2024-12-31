const EnquiryForm = require("../Models/contact"); // Assuming your model is `contact` for storing user inquiries.
const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use a service like Gmail, or configure your own SMTP server
    auth: {
      user: process.env.EMAIL_USER, // Replace with your email
      pass: process.env.EMAIL_PASS, // Replace with your email password (or use environment variables)
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: to, // Receiver email (admin)
    subject: subject, // Subject of the email
    html: htmlContent, // HTML content of the email
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to: ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error; // Handle error accordingly
  }
};

const enquiryformsubmission = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      source,
      pinCode,
      city,
      state,
      location,
    } = req.body;

    if (
      !fullName ||
      !phoneNumber ||
      !email ||
      !source ||
      !pinCode ||
      !city ||
      !state ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save the inquiry data to the database (or you can change this to save it to a form or different model)
    const newEnquiry = await EnquiryForm.create({
      fullName,
      phoneNumber,
      email,
      source,
      pinCode,
      city,
      state,
      location,
    });

    // Prepare HTML content for the admin email notification
    const htmlContent = `
      <p>A new inquiry has been submitted:</p>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Phone:</strong> ${phoneNumber}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Source:</strong> ${source}</p>
      <p><strong>Pin Code:</strong> ${pinCode}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>Location:</strong> ${location}</p>
    `;

    // Send email to admin with the inquiry details
    await sendEmail(
      "tech3@imperiorailing.com", // Admin's email
      "New User Inquiry",
      htmlContent
    );

    // Respond with a success message
    return res.status(201).json({
      message: "Dealer inquiry submitted successfully.",
      enquiry: newEnquiry,
    });
  } catch (error) {
    console.error("Error during inquiry submission:", error);
    return res.status(500).json({
      message:
        "There was an error submitting your inquiry. Please try again later.",
    });
  }
};

module.exports = {
  enquiryformsubmission,
};
