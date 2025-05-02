// Service for OTP generation and validation
const crypto = require("crypto");

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
exports.generateOTP = () => {
  // Generate a random number between 100000 and 999999
  return crypto.randomInt(100000, 999999).toString();
};
