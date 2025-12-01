const jwt = require('jsonwebtoken');

/**
 * PUBLIC_INTERFACE
 * signJwt
 * Signs a JWT payload with HS256 using the JWT_SECRET environment variable.
 * @param {object} payload - The payload to sign
 * @param {string|number} expiresIn - Expiration time (e.g., '1h', '15m')
 * @returns {string} Signed JWT token
 */
function signJwt(payload, expiresIn = '1h') {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn });
}

/**
 * PUBLIC_INTERFACE
 * verifyJwt
 * Verifies a JWT token using the JWT_SECRET environment variable.
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, secret, { algorithms: ['HS256'] });
}

module.exports = {
  signJwt,
  verifyJwt,
};
