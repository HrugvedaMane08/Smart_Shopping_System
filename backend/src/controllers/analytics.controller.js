import mongoose from 'mongoose';
import Product from '../models/Product.model.js';
import Cart from '../models/Cart.model.js';
import Transaction from '../models/Transaction.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper: get start of today / this week / this month
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    start.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    start.setDate(now.getDate() - 30);
  }

  return { $gte: start, $lte: now };
};

// @desc  Main dashboard summary stats
// @route GET /api/analytics/dashboard
export const getDashboardStats = asyncHandler(async (req, res) => {
  const todayRange = getDateRange('today');

  const [
    totalProducts,
    totalInventoryAgg,
    activeCarts,
    todayTransactions,
    lowStockCount,
    completedTransactionsCount,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalStock: { $sum: '$stockQuantity' } } },
    ]),
    Cart.countDocuments({ status: 'ACTIVE' }),
    Transaction.find({ createdAt: todayRange }),
    Product.countDocuments({
      isActive: true,
      status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
    }),
    Transaction.countDocuments({ transactionStatus: 'COMPLETED' }),
  ]);

  const todaysSales = todayTransactions.length;
  const todaysRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalInventory = totalInventoryAgg[0]?.totalStock || 0;

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      totalInventory,
      activeCarts,
      todaysSales,
      todaysRevenue: Math.round(todaysRevenue * 100) / 100,
      lowStockItems: lowStockCount,
      completedTransactions: completedTransactionsCount,
    },
  });
});

// @desc  Revenue chart data (daily/weekly/monthly)
// @route GET /api/analytics/revenue?period=daily|weekly|monthly
export const getRevenueChart = asyncHandler(async (req, res) => {
  const { period = 'daily' } = req.query;

  let groupFormat;
  let daysBack;

  if (period === 'daily') {
    groupFormat = '%Y-%m-%d';
    daysBack = 14; // last 14 days
  } else if (period === 'weekly') {
    groupFormat = '%Y-%U'; // year-week
    daysBack = 90; // last ~13 weeks
  } else {
    groupFormat = '%Y-%m';
    daysBack = 365; // last 12 months
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const revenueData = await Transaction.aggregate([
    { $match: { createdAt: { $gte: startDate }, transactionStatus: 'COMPLETED' } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      chart: revenueData.map((d) => ({
        label: d._id,
        revenue: Math.round(d.revenue * 100) / 100,
        orders: d.orders,
      })),
    },
  });
});

// @desc  Best-selling products
// @route GET /api/analytics/best-sellers
export const getBestSellers = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const bestSellers = await Transaction.aggregate([
    { $match: { transactionStatus: 'COMPLETED' } },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.product',
        name: { $first: '$products.name' },
        totalQuantitySold: { $sum: '$products.quantity' },
        totalRevenue: { $sum: '$products.subtotal' },
      },
    },
    { $sort: { totalQuantitySold: -1 } },
    { $limit: Number(limit) },
  ]);

  res.status(200).json({ success: true, data: { bestSellers } });
});

// @desc  Category-wise sales breakdown
// @route GET /api/analytics/category-sales
export const getCategorySales = asyncHandler(async (req, res) => {
  const categorySales = await Transaction.aggregate([
    { $match: { transactionStatus: 'COMPLETED' } },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.category',
        totalRevenue: { $sum: '$products.subtotal' },
        totalQuantity: { $sum: '$products.quantity' },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      categorySales: categorySales.map((c) => ({
        category: c._id || 'Uncategorized',
        totalRevenue: Math.round(c.totalRevenue * 100) / 100,
        totalQuantity: c.totalQuantity,
      })),
    },
  });
});

// @desc  Inventory status breakdown (for pie/donut chart)
// @route GET /api/analytics/inventory-status
export const getInventoryStatus = asyncHandler(async (req, res) => {
  const statusBreakdown = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const result = { IN_STOCK: 0, LOW_STOCK: 0, OUT_OF_STOCK: 0 };
  statusBreakdown.forEach((s) => {
    result[s._id] = s.count;
  });

  res.status(200).json({ success: true, data: { inventoryStatus: result } });
});

// @desc  Recent transactions (for dashboard widget)
// @route GET /api/analytics/recent-transactions
export const getRecentTransactions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const transactions = await Transaction.find()
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.status(200).json({ success: true, data: { transactions } });
});