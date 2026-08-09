import Cart from '../models/Cart.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import generateCartId from '../utils/generateCartId.js';
import { getIO } from '../socket/socket.js';

// @desc Customer creates/starts a new shopping session
export const createCart = asyncHandler(async (req, res) => {
  const existingActiveCart = await Cart.findOne({
    customer: req.user._id,
    status: 'ACTIVE',
  });

  if (existingActiveCart) {
    return res.status(200).json({
      success: true,
      message: 'You already have an active cart',
      data: { cart: existingActiveCart },
    });
  }

  const cartId = await generateCartId();

  const cart = await Cart.create({
    cartId,
    customer: req.user._id,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'ACTIVE',
  });

  await User.findByIdAndUpdate(req.user._id, { activeCartId: cart._id });

  try {
    getIO().to('managers').emit('cartCreated', { cart });
  } catch (e) {}

  res.status(201).json({
    success: true,
    message: 'Cart created successfully',
    data: { cart },
  });
});

// @desc Get customer's own active cart
export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    customer: req.user._id,
    status: 'ACTIVE',
  });

  if (!cart) {
    throw new ApiError(404, 'No active cart found. Please create one first.');
  }

  res.status(200).json({ success: true, data: { cart } });
});

// @desc Get customer's shopping history (all completed carts/transactions)
export const getMyCartHistory = asyncHandler(async (req, res) => {
  const carts = await Cart.find({
    customer: req.user._id,
    status: { $ne: 'ACTIVE' },
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { carts } });
});

// @desc Get single cart by cartId (Manager only, or the owning customer)
export const getCartById = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ cartId: req.params.cartId.toUpperCase() }).populate(
    'customer',
    'name email'
  );

  if (!cart) throw new ApiError(404, 'Cart not found');

  if (req.user.role !== 'MANAGER' && String(cart.customer._id) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not authorized to view this cart');
  }

  res.status(200).json({ success: true, data: { cart } });
});

// @desc Get all active carts (Manager only — for monitoring dashboard)
export const getActiveCarts = asyncHandler(async (req, res) => {
  const carts = await Cart.find({ status: 'ACTIVE' })
    .populate('customer', 'name email')
    .sort({ updatedAt: -1 });

  res.status(200).json({ success: true, data: { carts } });
});

// @desc Get all carts / transactions (Manager only, with filters)
export const getAllCarts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [carts, total] = await Promise.all([
    Cart.find(query)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Cart.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      carts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});