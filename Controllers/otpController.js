// Controller for OTP operations
const otpService = require("../Service/otpService");
const emailService = require("../Service/emailService");

// In-memory store for OTPs (use a database in production)
const otpStore = {};

/**
 * Send OTP to user's email
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate a 6-digit OTP
    const otp = otpService.generateOTP();

    // Store OTP with 15-minute expiration
    otpStore[email] = otp;
    console.log(`OTP for ${email}:`, otp);

    // Send email with OTP
    await emailService.sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/**
 * Verify OTP submitted by user
 */
exports.verifyOTP = (req, res) => {
  try {
    const { email, otp: enteredOtp } = req.body;

    if (!email || !enteredOtp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const storedOtp = otpStore[email];

    if (!storedOtp) {
      return res.status(400).json({ message: "No OTP sent or expired" });
    }

    if (String(enteredOtp) === String(storedOtp)) {
      delete otpStore[email];
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};
