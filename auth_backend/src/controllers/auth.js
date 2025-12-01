const { signJwt } = require('../utils/jwt');
const authService = require('../services/auth');

class AuthController {
  /**
   * PUBLIC_INTERFACE
   * login
   * Handles login by validating email/password and returning an otpToken.
   * Request body: { email: string, password: string }
   * Response: { requiresOtp: true, otpToken: string } or 401
   */
  login(req, res) {
    const { email, password } = req.body;
    const result = authService.authenticateUser(email, password);
    if (!result) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.status(200).json(result);
  }

  /**
   * PUBLIC_INTERFACE
   * verifyOtp
   * Verifies OTP and returns a signed JWT token on success.
   * Request body: { email: string, otp: string, otpToken: string }
   * Response: { token: string } or 400/401
   */
  verifyOtp(req, res) {
    const { email, otp, otpToken } = req.body;
    const verifiedEmail = authService.verifyOtp(email, otp, otpToken);
    if (!verifiedEmail) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }
    const token = signJwt({ sub: verifiedEmail });
    return res.status(200).json({ token });
  }

  /**
   * PUBLIC_INTERFACE
   * forgotPassword
   * Generates a password reset token for the user and logs it to server console.
   * Request body: { email: string }
   * Response: { message: string }
   */
  forgotPassword(req, res) {
    const { email } = req.body;
    const token = authService.createPasswordReset(email);
    // Respond generically to avoid user enumeration
    if (!token) {
      return res.status(200).json({ message: 'If the email exists, a reset token has been generated.' });
    }
    return res.status(200).json({ message: 'If the email exists, a reset token has been generated.' });
  }

  /**
   * PUBLIC_INTERFACE
   * resetPassword
   * Resets password using a previously issued token.
   * Request body: { token: string, password: string }
   * Response: { message: string } 200 on success or 400 on failure
   */
  resetPassword(req, res) {
    const { token, password } = req.body;
    const ok = authService.resetPassword(token, password);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    return res.status(200).json({ message: 'Password has been reset successfully' });
  }
}

module.exports = new AuthController();
