import { env } from './env.js';

export const allowedOrigins = (env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const preprouteFrontendRegex =
  /^https:\/\/preproute-frontend-[a-z0-9-]+(?:-bellamkondaramyas-projects)?\.vercel\.app$/i;

export function isAllowedOrigin(origin) {
  if (!origin) return true;

  if (allowedOrigins.includes('*')) return true;

  if (allowedOrigins.includes(origin)) return true;

  if (preprouteFrontendRegex.test(origin)) return true;

  return false;
}

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(null, false);
  },

  credentials: false,

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],

  optionsSuccessStatus: 204
};

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,Accept,Origin,X-Requested-With'
  );
}