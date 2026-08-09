import mongoose from 'mongoose';

const inventoryEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['PRODUCT_SCANNED', 'PRODUCT_REMOVED', 'STOCK_ADJUSTED', 'STOCK_RESTOCKED'],
      required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rfidUid: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    cartId: { type: String },
    quantityChange: { type: Number, required: true }, // negative for scan (removes from stock), positive for return
    stockAfter: { type: Number, required: true },
    source: {
      type: String,
      enum: ['SIMULATOR', 'ESP32', 'MANUAL'],
      default: 'SIMULATOR',
    },
  },
  { timestamps: true }
);

inventoryEventSchema.index({ product: 1 });
inventoryEventSchema.index({ cart: 1 });
inventoryEventSchema.index({ createdAt: -1 });

export default mongoose.model('InventoryEvent', inventoryEventSchema);