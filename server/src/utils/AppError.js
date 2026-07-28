/**
 * Custom application error class.
 * Allows controllers to throw typed errors that the global error handler processes.
 *
 * Usage:
 *   throw new AppError('Product not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // distinguish from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
