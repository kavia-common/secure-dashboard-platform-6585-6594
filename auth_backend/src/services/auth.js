const crypto = require('crypto');

// In-memory stores (for demo only; replace with persistent storage in production)
const users = new Map(); // email -> { email, password }
const pendingOtps = new Map(); // otpToken -> { email, otp, expiresAt }
const resetTokens = new Map(); // token -> { email, expiresAt }

// Seed demo user
users.set('demo@example.com', { email: 'demo@example.com', password: 'Password123' });

// Helper to generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to generate random token
function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

// TTL helpers
function ttlFromNow(seconds) {
  return new Date(Date.now() + seconds * 1000);
}

function isExpired(expiresAt) {
  return new Date() > expiresAt;
}

/**
 * PUBLIC_INTERFACE
 * authenticateUser
 * Validates email/password, generates an OTP and returns an otpToken to proceed.
 * @param {string} email
 * @param {string} password
 * @returns {{requiresOtp: boolean, otpToken: string}|null}
 */
function authenticateUser(email, password) {
  const rec = users.get(email);
  if (!rec || rec.password !== password) {
    return null;
  }
  const otp = generateOtp();
  const otpToken = generateToken();
  const expiresAt = ttlFromNow(5 * 60); // 5 minutes
  pendingOtps.set(otpToken, { email, otp, expiresAt });

  // For demo purposes, log OTP to the console
  console.log(`[AUTH] OTP for ${email}: ${otp} (expires in 5m), otpToken=${otpToken}`);

  return { requiresOtp: true, otpToken };
}

/**
 * PUBLIC_INTERFACE
 * verifyOtp
 * Verifies the OTP associated with otpToken and email.
 * @param {string} email
 * @param {string} otp
 * @param {string} otpToken
 * @returns {string|null} email if success; null otherwise
 */
function verifyOtp(email, otp, otpToken) {
  const rec = pendingOtps.get(otpToken);
  if (!rec) return null;
  if (rec.email !== email) return null;
  if (isExpired(rec.expiresAt)) {
    pendingOtps.delete(otpToken);
    return null;
  }
  if (rec.otp !== otp) {
    return null;
  }
  // Success: consume OTP
  pendingOtps.delete(otpToken);
  return email;
}

/**
 * PUBLIC_INTERFACE
 * createPasswordReset
 * Generates a password reset token for an email if the user exists.
 * @param {string} email
 * @returns {string|null} token if user exists else null
 */
function createPasswordReset(email) {
  if (!users.has(email)) return null;
  const token = generateToken();
  const expiresAt = ttlFromNow(15 * 60); // 15 minutes
  resetTokens.set(token, { email, expiresAt });

  // For demo purposes, log reset token to the console
  console.log(`[AUTH] Password reset token for ${email}: ${token} (expires in 15m)`);

  return token;
}

/**
 * PUBLIC_INTERFACE
 * resetPassword
 * Resets password using a valid reset token.
 * @param {string} token
 * @param {string} newPassword
 * @returns {boolean} success
 */
function resetPassword(token, newPassword) {
  const rec = resetTokens.get(token);
  if (!rec) return false;
  if (isExpired(rec.expiresAt)) {
    resetTokens.delete(token);
    return false;
  }
  const user = users.get(rec.email);
  if (!user) {
    resetTokens.delete(token);
    return false;
  }
  user.password = newPassword;
  users.set(rec.email, user);
  resetTokens.delete(token);
  return true;
}

module.exports = {
  users,
  pendingOtps,
  resetTokens,
  authenticateUser,
  verifyOtp,
  createPasswordReset,
  resetPassword,
};
