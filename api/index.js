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

export default async function handler(req, res) {
  console.log(
    'Vercel function request:',
    req.method,
    req.url,
    'origin:',
    req.headers.origin
  );

  // Set CORS headers before DB connection
  setCorsHeaders(req, res);

  // Preflight request should not connect to DB
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in Vercel function:', err);

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');

    return res.end(
      JSON.stringify({
        success: false,
        message: 'Database connection error'
      })
    );
  }

  return app(req, res);
}