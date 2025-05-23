// Routes for OTP functionality
const express = require("express");
const otpController = require("../Controllers/otpController");
const { otpLimiter } = require("../Middleware/rateLimiter"); // Import rate limiter middleware
const router = express.Router();

// Route to send OTP
router.post("/send-otp", otpController.sendOTP);

// Route to verify OTP
router.post("/verify-otp", otpController.verifyOTP);

module.exports = router;
