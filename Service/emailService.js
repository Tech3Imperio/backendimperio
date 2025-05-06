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
      from: `"Imperio Railing Systems" <${process.env.EMAIL_USER_FORM}>`,
      to: email,
      subject: "Your Email Verification Code - Imperio Railing Systems",
      text: `Dear Customer,
              Thank you for requesting a quotation with Imperio Railing Systems.
              To proceed, please verify your email address using the One-Time Password (OTP) below:
              Verification Code: ${otp}
              This code is valid for 15 minutes.
              If you did not initiate this request, please ignore this email.
              Best regards,
              Imperio Railing Systems`,
      html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E0E0E0; border-radius: 5px;">
                    <h2 style="color: #333;">Email Verification for Quotation Request</h2>
                    <p>Dear Customer,</p>
                    <p>Thank you for your interest in <strong>Imperio Railing Systems</strong>.</p>
                    <p>To verify your email address and proceed with generating your quotation, please use the following One-Time Password (OTP):</p>
                    <div style="background-color: #F5F5F5; padding: 10px; text-align: center; font-size: 26px; letter-spacing: 6px; font-weight: bold; margin: 20px 0;">
                      ${otp}
                    </div>
                    <p>This code is valid for the next <strong>15 minutes</strong>.</p>
                    <p style="color: #777; font-size: 12px; margin-top: 20px;">If you did not request this code, please disregard this message. No further action is required.</p>
                    <p style="margin-top: 30px;">Best regards,<br><strong>Team Imperio</strong></p>
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
