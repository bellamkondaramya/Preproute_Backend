import { env } from '../config/env.js';

export function errorHandler(error, req, res, _next) {
  console.error('❌ ERROR HANDLER:', {
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl || req.url,
    details: error.details || null
  });

  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    details: error.details || null,
    path: req.originalUrl || req.url,
    stack: env.NODE_ENV === 'production' ? undefined : error.stack
  });
}