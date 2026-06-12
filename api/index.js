// import app from '../src/app.js';
// import { connectDB } from '../src/config/db.js';

// export default async (req, res) => {
//   console.log('Vercel function request:', req.method, req.url, 'origin:', req.headers.origin);
//   try {
//     await connectDB();
//   } catch (err) {
//     console.error('Database connection error in Vercel function:', err);
//     res.statusCode = 500;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ success: false, message: 'Database connection error' }));
//     return;
//   }

//   const result = app(req, res);
//   if (!res.getHeader('Access-Control-Allow-Origin')) {
//     console.warn('No CORS header set for request origin:', req.headers.origin);
//   }
//   return result;
// };

import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { setCorsHeaders } from '../src/config/cors.js';

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  console.log(
    'Vercel function request:',
    req.method,
    req.url,
    'origin:',
    req.headers.origin
  );

  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = req.url || '';

  const skipDb =
    url === '/' ||
    url === '/health' ||
    url.startsWith('/health?') ||
    url === '/debug/server' ||
    url.startsWith('/debug/server?');

  if (skipDb) {
    try {
      return app(req, res);
    } catch (err) {
      console.error('❌ Serverless debug/health error:', err);

      return sendJson(res, 500, {
        success: false,
        message: 'Serverless debug/health error',
        error: err.message
      });
    }
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Database connection error in Vercel function:', err);

    return sendJson(res, 500, {
      success: false,
      message: 'Database connection error',
      error: err.message
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('❌ Unhandled serverless function error:', err);

    return sendJson(res, 500, {
      success: false,
      message: 'Serverless function error',
      error: err.message
    });
  }
}