import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';

// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper to generate and send token response
const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  sendSuccess(res, { token, user }, message, statusCode);
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email address is already in use', 409);
  }

  // Create new user (role defaults to 'customer')
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  createSendToken(user, 201, res, 'User registered successfully'); // Wait, standard is 201 Created
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  createSendToken(user, 200, res, 'Login successful');
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res, next) => {
  // req.user is already populated by protect middleware
  sendSuccess(res, { user: req.user }, 'User profile retrieved successfully');
});
