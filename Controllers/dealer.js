// const Dealer = require("../Models/dealers");
// // const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // Your Gmail email
//     pass: process.env.EMAIL_PASS, // Your Gmail app password
//   },
// });

// // Function to send email notification
// const sendEmailNotification = async (formData) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: "tech3@imperiorailing.com", // Receiver's email
//     subject: "Dealer registered",
//     text: `new dealer register:\n
//       username: ${formData.username}
//       phone: ${formData.phone}
//       gst: ${formData.gst}
//       Phone: ${formData.phone}
//       email: ${formData.email}
//       password: ${formData.password}
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully");
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };

// const dealerRegisterationHandeler = async (req, res) => {
//   try {
//     const { username, phone, gst, email, password } = req.body;

//     const emailExists = await Dealer.findOne({ email: email });
//     if (emailExists) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const dealerRegitered = await Dealer.create({
//       username,
//       phone,
//       gst,
//       email,
//       password,
//     });
//     await sendEmailNotification(req.body);
//     return res.status(201).json({
//       dealerRegitered,
//       message: "Deler created....",
//       token: await dealerRegitered.generateToken(),
//       userId: await dealerRegitered._id.toString(),
//     });
//   } catch (error) {
//     console.log("dealer regi error=", error);
//   }
// };

// const logindealers = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const dealerExists = await Dealer.findOne({ email: email });
//     if (!dealerExists) {
//       return res.status(400).json({ message: "dealer alredy exists" });
//     }

//     const dealercredential = await dealerExists.CheckPassword(password);

//     if (dealercredential) {
//       return res.status(200).json({
//         msg: "dealers is login successfully...",
//         token: await dealerExists.generateToken(),
//         userId: await dealerExists._id.toString(),
//       });
//     } else {
//       return res.status(400).json({ msg: "Incorrect Credential" });
//     }
//   } catch (error) {
//     console.log("dealer login error=", error);
//   }
// };

// module.exports = { dealerRegisterationHandeler, logindealers };

const Dealer = require("../Models/dealers");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Admin's Gmail account
    pass: process.env.EMAIL_PASS, // App-specific password
  },
});

// Centralized function to send an email
const sendEmail = async (to, subject, text, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

// Handle new dealer registration
const dealerRegistrationHandler = async (req, res) => {
  try {
    const { username, phone, gst, email, password } = req.body;

    // Check if the email already exists
    const phoneExists = await Dealer.findOne({ phone });
    const emailExists = await Dealer.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: `Email already exists` });
    } else if (phoneExists) {
      return res.status(400).json({ message: `Phone number already exists` });
    }

    // Register the dealer
    const dealerRegistered = await Dealer.create({
      username,
      phone,
      gst,
      email,
      password,
      isAdmin: false, // Default to false when registering
    });

    // Prepare HTML content for the admin email notification
    const htmlContent = `
      <p>A new dealer has registered:</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>GST:</strong> ${gst}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please choose an action:</p>

      <!-- Accept Button: Opens an API endpoint to accept the dealer -->
      <a href="https://imperiorailing.com/dealer-authorization/${email}" 
         style="background-color: green; color: white; padding: 10px; text-decoration: none;">Accept</a>

      <!-- Reject Button: Opens an API endpoint to reject the dealer -->
      <a href="https://imperiorailing.com/dealer-authorization/${email}" 
         style="background-color: red; color: white; padding: 10px; text-decoration: none;">Reject</a>
    `;

    // Send the email to admin
    await sendEmail(
      "tech3@imperiorailing.com", // Admin's email
      "Dealer registration request",
      "",
      htmlContent
    );

    // Send the response back to the client
    return res.status(201).json({
      dealerRegistered,
      message: "Dealer created successfully, awaiting approval",
    });
  } catch (error) {
    console.log("dealer registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept dealer registration
const acceptDealerRegistration = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Find the dealer by email
    const dealer = await Dealer.findOne({ email });

    if (!dealer) {
      return res
        .status(404)
        .json({ message: `Dealer with email ${email} not found.` });
    }

    // Update the isAdmin field to true to accept the dealer
    dealer.isAdmin = true;
    await dealer.save(); // Save the updated dealer document to the database

    console.log(`Dealer with email: ${email} accepted.`);
    return res
      .status(200)
      .json({ message: `Dealer ${email} accepted successfully!` });
  } catch (error) {
    console.error("Error accepting dealer:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Decline dealer registration
const declineDealerRegistration = async (req, res) => {
  try {
    const { email } = req.params;

    const dealer = await Dealer.findOne({ email });
    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

    // Send rejection email to the dealer
    const rejectionContent = `
      <p>Dear ${dealer.username},</p>
      <p>We regret to inform you that your dealer request has been rejected.</p>
      <p>Best regards,<br/>Imperio Railing Team</p>
    `;
    await sendEmail(
      dealer.email,
      "Dealer Request Rejected",
      "",
      rejectionContent
    );

    // Send email to the admin confirming the rejection
    await sendEmail(
      "tech3@imperiorailing.com",
      "Dealer Rejected",
      `Dealer ${dealer.username} has been rejected.`,
      ""
    );

    res.status(200).json({ message: "Dealer rejected successfully" });
  } catch (error) {
    console.error("Error rejecting dealer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginDealers = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check if dealer exists by email
    const dealerExists = await Dealer.findOne({ phone });
    if (!dealerExists) {
      return res.status(400).json({ message: "Dealer not found" });
    }

    // Check if the dealer is accepted (i.e., isAdmin is true)
    if (!dealerExists.isAdmin) {
      return res.status(400).json({
        message:
          "Your dealer request has been rejected. Please contact the admin.",
      });
    }

    // Verify password
    const dealerCredential = await dealerExists.CheckPassword(password);

    if (dealerCredential) {
      return res.status(200).json({
        msg: "Dealer logged in successfully",
        token: await dealerExists.generateToken(),
        userId: await dealerExists._id.toString(),
      });
    } else {
      return res.status(400).json({ msg: "Incorrect credentials" });
    }
  } catch (error) {
    console.log("Dealer login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  dealerRegistrationHandler,
  acceptDealerRegistration,
  declineDealerRegistration,
  loginDealers,
};
