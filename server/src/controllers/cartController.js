import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';
import { getFileUrl } from '../middleware/upload.js';
import { calculateCartTotals } from '../utils/cartCalculator.js';

/**
 * Get current user's shopping cart
 * GET /api/cart
 */
export const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name sku price images printTypes stockQuantity isActive',
  });

  // Create empty cart if not already present
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Calculate pricing values using utility
  const totals = calculateCartTotals(cart.items);

  res.status(200).json({
    status: 'success',
    data: {
      _id: cart._id,
      user: cart.user,
      items: cart.items,
      ...totals,
    },
  });
});

/**
 * Add an item to the shopping cart with customizations
 * POST /api/cart
 */
export const addToCart = asyncHandler(async (req, res, next) => {
  const { product: productId, size, color, quantity = 1, printLocation, designImage } = req.body;

  // 1. Validate quantity
  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    throw new AppError('Quantity must be a positive integer greater than 0', 400);
  }

  // 2. Verify product exists in database and is active
  const productObj = await Product.findById(productId);
  if (!productObj || !productObj.isActive) {
    throw new AppError('Product not found or is currently inactive', 404);
  }

  // 3. Size validation
  if (!productObj.availableSizes.includes(size)) {
    throw new AppError(`Size "${size}" is invalid for this product. Available: ${productObj.availableSizes.join(', ')}`, 400);
  }

  // 4. Color validation (verify matching color name)
  const isColorValid = productObj.availableColors.some(
    (c) => c.name.toLowerCase() === color.toLowerCase()
  );
  if (!isColorValid) {
    const availableColorNames = productObj.availableColors.map((c) => c.name).join(', ');
    throw new AppError(`Color "${color}" is invalid for this product. Available: ${availableColorNames}`, 400);
  }

  // 5. Verify quantity does not exceed inventory stock
  if (qty > productObj.stockQuantity) {
    throw new AppError(`Requested quantity exceeds available stock (${productObj.stockQuantity} remaining)`, 400);
  }

  // Find or create user's cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Normalize image string
  const finalDesignImage = designImage || '';

  // 6. Check if exact matching customization item already exists
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color.toLowerCase() === color.toLowerCase() &&
      item.printLocation === printLocation &&
      item.designImage === finalDesignImage
  );

  if (existingItemIndex > -1) {
    // Increment quantity
    const newQty = cart.items[existingItemIndex].quantity + qty;
    if (newQty > productObj.stockQuantity) {
      throw new AppError(`Cannot add more. Total in cart (${newQty}) exceeds available stock`, 400);
    }
    cart.items[existingItemIndex].quantity = newQty;
    // Update unit price in case product price has changed
    cart.items[existingItemIndex].unitPrice = productObj.price;
  } else {
    // Add new custom item row
    cart.items.push({
      product: productId,
      size,
      color,
      quantity: qty,
      printLocation,
      designImage: finalDesignImage,
      unitPrice: productObj.price,
    });
  }

  await cart.save();

  // Populate product details for response return
  await cart.populate({
    path: 'items.product',
    select: 'name sku price images printTypes stockQuantity isActive',
  });

  const totals = calculateCartTotals(cart.items);

  res.status(200).json({
    status: 'success',
    message: 'Item added to shopping cart successfully',
    data: {
      _id: cart._id,
      user: cart.user,
      items: cart.items,
      ...totals,
    },
  });
});

/**
 * Update cart item quantity
 * PUT /api/cart/:itemId
 */
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    throw new AppError('Quantity must be a positive integer greater than 0', 400);
  }

  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Locate the item
  const item = cart.items.id(itemId);
  if (!item) {
    throw new AppError('Cart line item not found', 404);
  }

  // Verify stock levels on product
  const productObj = await Product.findById(item.product);
  if (productObj && qty > productObj.stockQuantity) {
    throw new AppError(`Requested quantity exceeds available stock (${productObj.stockQuantity} remaining)`, 400);
  }

  // Apply new quantity
  item.quantity = qty;
  await cart.save();

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name sku price images printTypes stockQuantity isActive',
  });

  const totals = calculateCartTotals(cart.items);

  res.status(200).json({
    status: 'success',
    message: 'Cart item updated successfully',
    data: {
      _id: cart._id,
      user: cart.user,
      items: cart.items,
      ...totals,
    },
  });
});

/**
 * Remove an item from the shopping cart
 * DELETE /api/cart/:itemId
 */
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Filter out the item
  const initialLength = cart.items.length;
  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

  if (cart.items.length === initialLength) {
    throw new AppError('Cart line item not found', 404);
  }

  await cart.save();

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name sku price images printTypes stockQuantity isActive',
  });

  const totals = calculateCartTotals(cart.items);

  res.status(200).json({
    status: 'success',
    message: 'Item removed from cart successfully',
    data: {
      _id: cart._id,
      user: cart.user,
      items: cart.items,
      ...totals,
    },
  });
});

/**
 * Handle custom print design uploading
 * POST /api/cart/upload
 */
export const uploadDesign = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new AppError('No image artwork file uploaded', 400);
  }

  const fileUrl = getFileUrl(req, req.file.filename);

  res.status(200).json({
    status: 'success',
    message: 'Artwork uploaded successfully',
    url: fileUrl,
  });
});
