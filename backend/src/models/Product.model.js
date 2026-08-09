import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    minimumStock: { type: Number, required: true, min: 0, default: 5 },
    rfidUid: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
      default: 'IN_STOCK',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-calculate status before saving
productSchema.pre('save', function () {
  if (this.stockQuantity <= 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.stockQuantity <= this.minimumStock) {
    this.status = 'LOW_STOCK';
  } else {
    this.status = 'IN_STOCK';
  }
});

// Also recalculate on findOneAndUpdate (used by controllers for stock changes)
productSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  const docToUpdate = await this.model.findOne(this.getQuery());

  if (!docToUpdate) return;

  const newStock =
    update.stockQuantity !== undefined ? update.stockQuantity : docToUpdate.stockQuantity;
  const newMinStock =
    update.minimumStock !== undefined ? update.minimumStock : docToUpdate.minimumStock;

  if (newStock <= 0) {
    update.status = 'OUT_OF_STOCK';
  } else if (newStock <= newMinStock) {
    update.status = 'LOW_STOCK';
  } else {
    update.status = 'IN_STOCK';
  }
});


productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

export default mongoose.model('Product', productSchema);