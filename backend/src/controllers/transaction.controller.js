import mongoose from 'mongoose';
import Cart from '../models/Cart.model.js';
import Transaction from '../models/Transaction.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import generateTransactionId from '../utils/generateTransactionId.js';
import { getIO } from '../socket/socket.js';

// @desc  Checkout — convert active cart into a completed transaction
// @route POST /api/carts/:cartId/checkout
export const checkout = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    cartId: req.params.cartId.toUpperCase(),
    status: 'ACTIVE',
  });

  if (!cart) {
    throw new ApiError(404, 'No active cart found with this ID');
  }

  // Only the owning customer can checkout their own cart
  if (String(cart.customer) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not authorized to checkout this cart');
  }

  if (cart.items.length === 0) {
    throw new ApiError(400, 'Cannot checkout an empty cart');
  }

  // Fetch product categories for the transaction record (nice-to-have for analytics)
  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const categoryMap = {};
  products.forEach((p) => {
    categoryMap[String(p._id)] = p.category;
  });

  const transactionId = await generateTransactionId();

  const transaction = await Transaction.create({
    transactionId,
    cart: cart._id,
    cartId: cart.cartId,
    customer: cart.customer,
    products: cart.items.map((item) => ({
      product: item.product,
      name: item.name,
      category: categoryMap[String(item.product)] || 'Uncategorized',
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    subtotal: cart.subtotal,
    tax: cart.tax,
    total: cart.total,
    paymentStatus: 'PAID', // simulated — always succeeds
    paymentMethod: 'SIMULATED',
    transactionStatus: 'COMPLETED',
  });

  // Mark cart completed and clear it from the user's active session
  cart.status = 'COMPLETED';
  await cart.save();

  await User.findByIdAndUpdate(cart.customer, { activeCartId: null });

  const io = getIO();
  io.to(`cart_${cart._id}`).emit('transactionCompleted', { transaction });
  io.to(`cart_${cart._id}`).emit('cartClosed', { cart });
  io.to('managers').emit('transactionCompleted', { transaction });
  io.to('managers').emit('cartClosed', { cart });

  res.status(201).json({
    success: true,
    message: 'Checkout successful',
    data: { transaction, receipt: buildReceipt(transaction) },
  });
});

// @desc  Get digital receipt for a transaction
// @route GET /api/transactions/:transactionId/receipt
export const getReceipt = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    transactionId: req.params.transactionId.toUpperCase(),
  }).populate('customer', 'name email');

  if (!transaction) throw new ApiError(404, 'Transaction not found');

  if (
    req.user.role !== 'MANAGER' &&
    String(transaction.customer._id) !== String(req.user._id)
  ) {
    throw new ApiError(403, 'You are not authorized to view this receipt');
  }

  res.status(200).json({
    success: true,
    data: { receipt: buildReceipt(transaction) },
  });
});

// @desc  Customer's own transaction history
// @route GET /api/transactions/my-history
export const getMyTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ customer: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({ success: true, data: { transactions } });
});

// @desc  All transactions (Manager only)
// @route GET /api/transactions
export const getAllTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, startDate, endDate } = req.query;

  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Helper — builds a clean receipt object from a transaction
const buildReceipt = (transaction) => ({
  transactionId: transaction.transactionId,
  date: transaction.createdAt,
  items: transaction.products.map((p) => ({
    name: p.name,
    price: p.price,
    quantity: p.quantity,
    subtotal: p.subtotal,
  })),
  subtotal: transaction.subtotal,
  tax: transaction.tax,
  total: transaction.total,
  paymentStatus: transaction.paymentStatus,
  paymentMethod: transaction.paymentMethod,
});