import mongoose from 'mongoose';

const transactionItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    category: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
    cartId: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [transactionItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PAID', // simulated payment — always succeeds for now
    },
    paymentMethod: { type: String, default: 'SIMULATED' },
    transactionStatus: {
      type: String,
      enum: ['COMPLETED', 'REFUNDED', 'CANCELLED'],
      default: 'COMPLETED',
    },
  },
  { timestamps: true }
);

transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ customer: 1 });
transactionSchema.index({ createdAt: -1 });

export default mongoose.model('Transaction', transactionSchema);