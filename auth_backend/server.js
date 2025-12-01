'use strict';

/**
 * Minimal Express Auth Backend with permissive CORS handling suited for preview.
 * Binds to 0.0.0.0:3001 and exposes /health plus auth endpoints stubbed or existing app routes can be mounted below.
 * If you already have a backend server, adjust to include the CORS middleware shown here.
 */

// PUBLIC_INTERFACE
/**
 * startServer
 * Starts the Express server on the configured port (default 3001).
 */
const express = require('express');

const app = express();

// CORS middleware: reflect Origin and allow credentials and common headers
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-backend', ts: new Date().toISOString() });
});

// If real implementation exists elsewhere, you can proxy/mount here.
// This stub can be replaced by the project's real routes.

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth backend listening on http://${HOST}:${PORT}`);
});

module.exports = app;
