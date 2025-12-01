const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

// Initialize express app
const app = express();

/**
 * CORS configuration:
 * - CORS_ORIGIN can be:
 *   - a single origin string (default http://localhost:3000)
 *   - a comma-separated list of origins
 *   - '*' to reflect the request origin (useful for dev with credentials)
 */
const rawOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
let corsOrigin;
if (rawOrigin === '*') {
  // Reflect request origin for all requests (compatible with credentials: true)
  corsOrigin = (origin, callback) => callback(null, true);
} else if (rawOrigin.includes(',')) {
  const whitelist = rawOrigin.split(',').map(o => o.trim());
  corsOrigin = function (origin, callback) {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  };
} else {
  corsOrigin = rawOrigin;
}

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle preflight explicitly to ensure smooth CORS with credentials
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  if (typeof corsOrigin === 'function') {
    // reflect request origin in preflight
    const origin = req.get('Origin');
    if (origin) res.header('Access-Control-Allow-Origin', origin);
  } else if (typeof corsOrigin === 'string') {
    res.header('Access-Control-Allow-Origin', corsOrigin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.sendStatus(204);
});

app.set('trust proxy', true);

// Swagger docs with dynamic server URL
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');           // may or may not include port
  let protocol = req.protocol;          // http or https

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');
  
  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', routes);
app.use('/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

module.exports = app;
