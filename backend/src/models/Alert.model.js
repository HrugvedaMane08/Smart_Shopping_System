import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOW_STOCK', 'OUT_OF_STOCK'],
      required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

alertSchema.index({ isResolved: 1 });
alertSchema.index({ product: 1 });

export default mongoose.model('Alert', alertSchema);