import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

/**
 * Run after express-validator chains.
 * Throws an AppError with 422 if any field fails validation.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = {};
    errors.array().forEach(({ path, msg }) => {
      formatted[path] = msg;
    });
    throw new AppError('Validation failed', 422, formatted);
  }
  next();
};
