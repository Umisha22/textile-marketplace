export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.stack || err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res
      .status(409)
      .json({ message: `${field} already exists. Please use a different value.` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier provided.' });
  }

  const status = err.statusCode || 500;
  return res.status(status).json({
    message: err.message || 'Something went wrong on the server.',
  });
}
