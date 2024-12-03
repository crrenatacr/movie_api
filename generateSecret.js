const crypto = require('crypto');

/**
 * Generates a random secret key using the crypto module.
 * 
 * @function
 * @returns {string} A randomly generated secret key in hexadecimal format.
 */
const secret = crypto.randomBytes(64).toString('hex');

console.log(secret);
