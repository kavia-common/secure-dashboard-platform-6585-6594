# Auth Backend - Removed

This repository previously contained an Express-based `auth_backend` for authentication flows (login with OTP, verify OTP, forgot/reset password).

As per the new architecture decision, the backend has been removed. The frontend now runs entirely without a backend by using an in-memory mock service that simulates the following endpoints:
- POST /auth/login
- POST /auth/verify-otp
- POST /auth/forgot-password
- POST /auth/reset-password

See the frontend README for details on toggling between the mock service and a future live backend.

To reintroduce a backend in the future:
1. Restore or create a backend service implementing the endpoints above.
2. Update the frontend environment to disable mock mode and point `apiBaseUrl` to the backend URL.
3. Remove or bypass the mock provider wiring in the Angular app.
