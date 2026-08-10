import Alert from '../models/Alert.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

// @desc  Get all alerts (unresolved first, newest first)
export const getAlerts = asyncHandler(async (req, res) => {
  const { resolved } = req.query;

  const query = {};
  if (resolved === 'true') query.isResolved = true;
  if (resolved === 'false') query.isResolved = false;

  const alerts = await Alert.find(query)
    .populate('product', 'name category stockQuantity minimumStock status')
    .sort({ isResolved: 1, createdAt: -1 });

  res.status(200).json({ success: true, data: { alerts } });
});

// @desc  Mark alert as read
export const markAlertRead = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!alert) throw new ApiError(404, 'Alert not found');
  res.status(200).json({ success: true, data: { alert } });
});

// @desc  Mark alert as resolved (e.g. after restocking)
export const resolveAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { isResolved: true, isRead: true },
    { new: true }
  );
  if (!alert) throw new ApiError(404, 'Alert not found');
  res.status(200).json({ success: true, message: 'Alert resolved', data: { alert } });
});