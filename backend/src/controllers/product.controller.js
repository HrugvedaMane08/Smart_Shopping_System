import Product from '../models/Product.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getIO } from '../socket/socket.js';

// @desc Get all products (with search, filter, pagination)
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { rfidUid: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// @desc Get single product
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  res.status(200).json({ success: true, data: { product } });
});

// @desc Create product (Manager only)
export const createProduct = asyncHandler(async (req, res) => {
  const { name, category, price, stockQuantity, minimumStock, rfidUid, image, description } =
    req.body;

  if (!name || !category || price === undefined || !rfidUid) {
    throw new ApiError(400, 'Name, category, price and RFID UID are required');
  }

  const existingRfid = await Product.findOne({ rfidUid: rfidUid.toUpperCase() });
  if (existingRfid) {
    throw new ApiError(409, 'This RFID UID is already assigned to another product');
  }

  const product = await Product.create({
    name,
    category,
    price,
    stockQuantity: stockQuantity || 0,
    minimumStock: minimumStock || 5,
    rfidUid: rfidUid.toUpperCase(),
    image,
    description,
  });

  // Notify managers in real-time
  try {
    getIO().to('managers').emit('inventoryUpdated', { type: 'CREATED', product });
  } catch (e) {
    // socket not critical for this response
  }

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  });
});

// @desc Update product (Manager only)
export const updateProduct = asyncHandler(async (req, res) => {
  const { rfidUid } = req.body;

  if (rfidUid) {
    const existingRfid = await Product.findOne({
      rfidUid: rfidUid.toUpperCase(),
      _id: { $ne: req.params.id },
    });
    if (existingRfid) {
      throw new ApiError(409, 'This RFID UID is already assigned to another product');
    }
    req.body.rfidUid = rfidUid.toUpperCase();
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) throw new ApiError(404, 'Product not found');

  try {
    getIO().to('managers').emit('inventoryUpdated', { type: 'UPDATED', product });

    // If stock is now low/out, emit alert
    if (product.status === 'LOW_STOCK' || product.status === 'OUT_OF_STOCK') {
      getIO().to('managers').emit('lowStockAlert', { product });
    }
  } catch (e) {}

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  });
});

// @desc Delete product (soft delete, Manager only)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) throw new ApiError(404, 'Product not found');

  try {
    getIO().to('managers').emit('inventoryUpdated', { type: 'DELETED', product });
  } catch (e) {}

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// @desc Get low stock products (Manager only)
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
  }).sort({ stockQuantity: 1 });

  res.status(200).json({ success: true, data: { products } });
});

// @desc Get single product by RFID UID (used internally by IoT layer too)
export const getProductByRfid = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    rfidUid: req.params.rfidUid.toUpperCase(),
    isActive: true,
  });

  if (!product) throw new ApiError(404, 'No product found with this RFID UID');

  res.status(200).json({ success: true, data: { product } });
});