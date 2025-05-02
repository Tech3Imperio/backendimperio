// Service for sending emails
const nodemailer = require("nodemailer");

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 */
exports.sendOTPEmail = async (email, otp) => {
  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can use other services like SendGrid, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USER_FORM,
        pass: process.env.EMAIL_PASSWORD_FORM,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Imperio Railing" <${process.env.EMAIL_USER_FORM}>`,
      to: email,
      subject: "Email Verification Code",
      text: `Your verification code is: ${otp}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Please use the following code to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p style="color: #777; font-size: 12px; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
