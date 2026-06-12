// import cors from 'cors';
// import express from 'express';
// import fs from 'fs';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import rateLimit from 'express-rate-limit';
// import { env } from './config/env.js';
// import routes from './routes/index.js';
// import { notFound } from './middleware/notFound.js';
// import { errorHandler } from './middleware/errorHandler.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// // When running behind a proxy (Vercel, Heroku, etc.) enable trust proxy
// app.set('trust proxy', 1);

// // Security
// app.use(helmet({ contentSecurityPolicy: false }));

// // CORS - support comma-separated whitelist and allow credentials
// const allowedOrigins = (env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

// // Log configured CORS origins for diagnostics
// console.log('Configured CORS origins:', allowedOrigins.length ? allowedOrigins : ['<none - allow all>']);

// // Allow Vercel preview and production subdomains (e.g. preproute-frontend-indol.vercel.app)
// const vercelFrontendOriginRE = /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i;

// const corsOptions = {
//   origin: (incomingOrigin, callback) => {
//     // allow non-browser requests (e.g., curl, server-side)
//     if (!incomingOrigin) return callback(null, true);

//     // allow when no origins configured (development) or wildcard present
//     if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) return callback(null, true);

//     if (allowedOrigins.includes(incomingOrigin) || vercelFrontendOriginRE.test(incomingOrigin)) {
//       return callback(null, true);
//     }

//     // don't throw an error here (that becomes a 500). Return false so CORS simply blocks the origin.
//     console.warn(`Blocked CORS request from origin: ${incomingOrigin}`);
//     return callback(null, false);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// };

// app.use((req, res, next) => {
//   const incomingOrigin = req.headers.origin;
//   if (incomingOrigin && (allowedOrigins.includes(incomingOrigin) || vercelFrontendOriginRE.test(incomingOrigin) || allowedOrigins.includes('*'))) {
//     res.setHeader('Access-Control-Allow-Origin', incomingOrigin);
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
//   }
//   next();
// });

// app.use(cors(corsOptions));

// // Ensure preflight requests return the correct CORS headers
// app.options('*', cors(corsOptions));

// app.use(express.json({ limit: '2mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Rate limiting
// app.use(rateLimit({ 
//   windowMs: 15 * 60 * 1000, 
//   max: 1000,
//   message: 'Too many requests from this IP, please try again later.'
// }));

// // Logging
// if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

// // Health check endpoint
// app.get('/health', (_req, res) => res.json({ success: true, message: 'API is healthy' }));

// // Root route
// app.get('/', (_req, res) => res.json({ 
//   success: true, 
//   message: 'Preproute API is running',
//   version: '1.0.0',
//   endpoints: {
//     health: '/health',
//     api: '/api',
//     docs: 'https://github.com/your-repo'
//   }
// }));

// // API routes
// app.use('/api', routes);

// // Serve React frontend in production (if same server)
// const distPath = path.join(__dirname, '../../frontend/dist');
// if (env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
//   app.use(express.static(distPath));
//   app.get('*', (_req, res) => {
//     res.sendFile(path.join(distPath, 'index.html'));
//   });
// } else {
//   app.use(notFound);
// }

// app.use(errorHandler);

// export default app; 

import cors from 'cors';
import express from 'express';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { allowedOrigins, corsOptions } from './config/cors.js';

import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

console.log(
  'Configured CORS origins:',
  allowedOrigins.length ? allowedOrigins : ['<none>']
);

app.use(cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => req.method === 'OPTIONS'
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy'
  });
});

app.get('/debug/server', (_req, res) => {
  const mongoUri = env.MONGODB_URI || '';

  res.json({
    success: true,
    message: 'Backend debug route working',
    nodeEnv: env.NODE_ENV,
    hasMongoUri: Boolean(env.MONGODB_URI),
    mongoUriStartsCorrectly:
      mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'),
    hasJwtSecret: Boolean(env.JWT_SECRET),
    corsOrigin: env.CORS_ORIGIN
  });
});

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Preproute API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      debug: '/debug/server',
      api: '/api'
    }
  });
});

app.use('/api', routes);

const distPath = path.join(__dirname, '../../frontend/dist');

if (env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

export default app;