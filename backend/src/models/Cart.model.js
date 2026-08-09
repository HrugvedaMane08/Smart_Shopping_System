import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    rfidUid: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    cartId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'ABANDONED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

const TAX_RATE = 0.05; // 5% tax — adjust as needed

cartSchema.methods.recalculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.tax = Math.round(this.subtotal * TAX_RATE * 100) / 100;
  this.total = Math.round((this.subtotal + this.tax) * 100) / 100;
};

cartSchema.index({ cartId: 1 });
cartSchema.index({ customer: 1 });
cartSchema.index({ status: 1 });

export default mongoose.model('Cart', cartSchema);