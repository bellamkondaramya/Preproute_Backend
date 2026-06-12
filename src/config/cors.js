import { env } from './env.js';

export const allowedOrigins = (env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Allows:
// https://preproute-frontend-indol.vercel.app
// https://preproute-frontend-drab.vercel.app
// https://preproute-frontend-6xbltk9c0-bellamkondaramyas-projects.vercel.app
// https://preproute-frontend-i72qzap2w-bellamkondaramyas-projects.vercel.app
const preprouteFrontendVercelRegex =
  /^https:\/\/preproute-frontend-[a-z0-9-]+(?:-bellamkondaramyas-projects)?\.vercel\.app$/i;

export function isAllowedOrigin(origin) {
  // Allow curl, Postman, server-to-server requests
  if (!origin) return true;

  // Explicit wildcard
  if (allowedOrigins.includes('*')) return true;

  // Exact match from env
  if (allowedOrigins.includes(origin)) return true;

  // Allow your Vercel frontend production + preview URLs
  if (preprouteFrontendVercelRegex.test(origin)) return true;

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

  credentials: true,

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
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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