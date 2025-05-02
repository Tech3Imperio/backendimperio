// Rate limiter to prevent abuse
const rateLimit = require("express-rate-limit");

// Create a rate limiter for OTP requests
// Limits to 5 requests per 15 minutes per IP
exports.otpLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message:
      "Too many OTP requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
