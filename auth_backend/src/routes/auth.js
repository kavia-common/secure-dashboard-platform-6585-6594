const express = require('express');
const authController = require('../controllers/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: demo@example.com
 *         password:
 *           type: string
 *           example: Password123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         requiresOtp:
 *           type: boolean
 *           example: true
 *         otpToken:
 *           type: string
 *           example: c0ffee0123abcd
 *     VerifyOtpRequest:
 *       type: object
 *       required: [email, otp, otpToken]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: demo@example.com
 *         otp:
 *           type: string
 *           example: "123456"
 *         otpToken:
 *           type: string
 *           example: c0ffee0123abcd
 *     VerifyOtpResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     ForgotPasswordRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: demo@example.com
 *     GenericMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: If the email exists, a reset token has been generated.
 *     ResetPasswordRequest:
 *       type: object
 *       required: [token, password]
 *       properties:
 *         token:
 *           type: string
 *           example: c0ffee0123abcd
 *         password:
 *           type: string
 *           example: NewStrongPassword!234
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Initiate login and get OTP token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: OTP required response with otpToken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(['email', 'password']), authController.login.bind(authController));

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and obtain JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: JWT token on success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyOtpResponse'
 *       401:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', validate(['email', 'otp', 'otpToken']), authController.verifyOtp.bind(authController));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset token (logged to server console)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Generic message indicating the reset flow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessage'
 */
router.post('/forgot-password', validate(['email']), authController.forgotPassword.bind(authController));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessage'
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', validate(['token', 'password']), authController.resetPassword.bind(authController));

module.exports = router;
