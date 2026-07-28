import Category from '../models/Category.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';

/**
 * Get all categories
 * GET /api/categories
 */
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 });
  sendSuccess(res, categories, 'Categories retrieved successfully');
});

/**
 * Get single category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  sendSuccess(res, category, 'Category retrieved successfully');
});

/**
 * Create a new category
 * POST /api/categories
 * Access: Admin only
 */
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  // Check if name already exists
  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  if (existing) {
    throw new AppError('Category name already exists', 409);
  }

  const category = await Category.create({ name, description });
  sendSuccess(res, category, 'Category created successfully', 201);
});

/**
 * Update an existing category
 * PUT /api/categories/:id
 * Access: Admin only
 */
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // If renaming, ensure name isn't taken by another category
  if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      throw new AppError('Category name already exists', 409);
    }
    category.name = name;
  }

  if (description !== undefined) {
    category.description = description;
  }

  await category.save();
  sendSuccess(res, category, 'Category updated successfully');
});

/**
 * Delete a category
 * DELETE /api/categories/:id
 * Access: Admin only
 */
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Prevent deletion if products reference this category
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new AppError(`Cannot delete category. It is referenced by ${productCount} products.`, 400);
  }

  await category.deleteOne();
  sendSuccess(res, null, 'Category deleted successfully');
});
