import Product from '../models/Product.js';
import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';
import { getFileUrl } from '../middleware/upload.js';

/**
 * Get all products (with pagination, search, and filtration)
 * GET /api/products
 */
export const getProducts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    printType,
    sort,
    isAdminView, // set true by admin panel queries to view inactive products
  } = req.query;

  const queryObj = {};

  // Default filter for active products for public users
  if (isAdminView !== 'true') {
    queryObj.isActive = true;
  }

  // 1. Search filter (partial match on name/description or text index)
  if (search) {
    queryObj.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  // 2. Category filter
  if (category) {
    queryObj.category = category;
  }

  // 3. Price range filter
  if (minPrice || maxPrice) {
    queryObj.price = {};
    if (minPrice) queryObj.price.$gte = Number(minPrice);
    if (maxPrice) queryObj.price.$lte = Number(maxPrice);
  }

  // 4. Print Type filter
  if (printType) {
    queryObj.printTypes = printType;
  }

  // ── Pagination Calculation ─────────────────────────
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  // ── Sort Configuration ──────────────────────────────
  let sortObj = { createdAt: -1 }; // default newest
  if (sort) {
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'name_asc') sortObj = { name: 1 };
    else if (sort === 'name_desc') sortObj = { name: -1 };
  }

  // Execute query with populate category
  const products = await Product.find(queryObj)
    .populate('category', 'name slug')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  const total = await Product.countDocuments(queryObj);

  sendSuccess(
    res,
    {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    },
    'Products retrieved successfully'
  );
});

/**
 * Get single product details
 * GET /api/products/:id
 */
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  sendSuccess(res, product, 'Product details retrieved successfully');
});

/**
 * Create a new merchandise product
 * POST /api/products
 * Access: Admin only
 */
export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    category,
    price,
    availableSizes,
    availableColors,
    stockQuantity,
    sku,
    printTypes,
    isFeatured,
    isActive,
    tags,
  } = req.body;

  // 1. Verify category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError('Invalid category reference. Category does not exist.', 400);
  }

  // 2. Verify SKU is unique
  const skuExists = await Product.findOne({ sku: sku.toUpperCase().trim() });
  if (skuExists) {
    throw new AppError(`Product with SKU "${sku.toUpperCase().trim()}" already exists`, 409);
  }

  // 3. Process uploaded files if any
  const images = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach((file, index) => {
      images.push({
        url: getFileUrl(req, file.filename),
        alt: `${name} Image ${index + 1}`,
        isPrimary: index === 0, // make first image primary
      });
    });
  } else if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
    // support manual JSON array URLs seeding
    req.body.imageUrls.forEach((url, index) => {
      images.push({
        url,
        alt: `${name} Image ${index + 1}`,
        isPrimary: index === 0,
      });
    });
  }

  // Parse arrays if they are strings (sent via multipart/form-data)
  const sizesParsed = typeof availableSizes === 'string' ? JSON.parse(availableSizes) : availableSizes;
  const colorsParsed = typeof availableColors === 'string' ? JSON.parse(availableColors) : availableColors;
  const printTypesParsed = typeof printTypes === 'string' ? JSON.parse(printTypes) : printTypes;
  const tagsParsed = typeof tags === 'string' ? JSON.parse(tags) : tags;

  const product = await Product.create({
    name,
    description,
    category,
    price: Number(price),
    availableSizes: sizesParsed || [],
    availableColors: colorsParsed || [],
    stockQuantity: Number(stockQuantity),
    sku: sku.toUpperCase().trim(),
    printTypes: printTypesParsed || [],
    images,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isActive: isActive === 'true' || isActive === true || isActive === undefined,
    tags: tagsParsed || [],
  });

  sendSuccess(res, product, 'Merchandise product created successfully', 201);
});

/**
 * Update an existing product
 * PUT /api/products/:id
 * Access: Admin only
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    category,
    price,
    availableSizes,
    availableColors,
    stockQuantity,
    sku,
    printTypes,
    isFeatured,
    isActive,
    tags,
    existingImages, // client lists images to retain
  } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // 1. Verify category exists if modified
  if (category && category !== product.category.toString()) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new AppError('Invalid category reference.', 400);
    }
    product.category = category;
  }

  // 2. Verify SKU is unique if modified
  if (sku && sku.toUpperCase().trim() !== product.sku) {
    const skuExists = await Product.findOne({ sku: sku.toUpperCase().trim() });
    if (skuExists) {
      throw new AppError(`Product with SKU "${sku.toUpperCase().trim()}" already exists`, 409);
    }
    product.sku = sku.toUpperCase().trim();
  }

  // 3. Process new files
  let images = [];
  
  // Re-append existing image objects retained
  if (existingImages) {
    const parsedExisting = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
    images = [...parsedExisting];
  } else {
    // If not specified, keep product's previous images
    images = [...product.images];
  }

  if (req.files && req.files.length > 0) {
    req.files.forEach((file, index) => {
      images.push({
        url: getFileUrl(req, file.filename),
        alt: `${name || product.name} Upload ${index + 1}`,
        isPrimary: images.length === 0, // primary if list was empty
      });
    });
  }

  // Update base properties
  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
  
  if (availableSizes) {
    product.availableSizes = typeof availableSizes === 'string' ? JSON.parse(availableSizes) : availableSizes;
  }
  if (availableColors) {
    product.availableColors = typeof availableColors === 'string' ? JSON.parse(availableColors) : availableColors;
  }
  if (printTypes) {
    product.printTypes = typeof printTypes === 'string' ? JSON.parse(printTypes) : printTypes;
  }
  if (tags) {
    product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
  }

  if (isFeatured !== undefined) {
    product.isFeatured = isFeatured === 'true' || isFeatured === true;
  }
  if (isActive !== undefined) {
    product.isActive = isActive === 'true' || isActive === true;
  }

  product.images = images;

  await product.save();
  sendSuccess(res, product, 'Product updated successfully');
});

/**
 * Delete a product
 * DELETE /api/products/:id
 * Access: Admin only
 */
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  await product.deleteOne();
  sendSuccess(res, null, 'Product deleted successfully');
});
