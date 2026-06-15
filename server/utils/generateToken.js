const crypto = require("crypto");

/**
 * Generate a cryptographically secure random token
 */
const generateShareToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = generateShareToken;
