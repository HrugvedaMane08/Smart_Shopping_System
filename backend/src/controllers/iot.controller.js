import mongoose from 'mongoose';
import Product from '../models/Product.model.js';
import Cart from '../models/Cart.model.js';
import InventoryEvent from '../models/InventoryEvent.model.js';
import Alert from '../models/Alert.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getIO } from '../socket/socket.js';

// @desc  RFID product scan — called by IoT Simulator NOW, by ESP32 LATER
// @route POST /api/iot/rfid
export const handleRfidScan = asyncHandler(async (req, res) => {
  const { cartId, rfidUid, event, source } = req.body;

  // 1. Validate input
  if (!cartId || !rfidUid) {
    throw new ApiError(400, 'cartId and rfidUid are required');
  }

  // 2. Validate Cart
  const cart = await Cart.findOne({ cartId: cartId.toUpperCase(), status: 'ACTIVE' });
  if (!cart) {
    throw new ApiError(404, `No active cart found with ID: ${cartId}`);
  }

  // 3. Validate RFID -> find Product
  const product = await Product.findOne({
    rfidUid: rfidUid.toUpperCase(),
    isActive: true,
  });
  if (!product) {
    throw new ApiError(404, `No product found for RFID UID: ${rfidUid}`);
  }

  // 4. Check stock
  if (product.stockQuantity <= 0) {
    throw new ApiError(400, `${product.name} is out of stock`);
  }

  // 5. Add product to cart (or increment quantity if already present)
  const existingItemIndex = cart.items.findIndex(
    (item) => String(item.product) === String(product._id)
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += 1;
    cart.items[existingItemIndex].subtotal =
      cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      rfidUid: product.rfidUid,
      price: product.price,
      quantity: 1,
      subtotal: product.price,
    });
  }

  // 6. Recalculate cart totals
  cart.recalculateTotals();
  await cart.save();

  // 7. Update inventory (decrement stock)
  product.stockQuantity -= 1;
  if (product.stockQuantity <= 0) {
    product.status = 'OUT_OF_STOCK';
  } else if (product.stockQuantity <= product.minimumStock) {
    product.status = 'LOW_STOCK';
  } else {
    product.status = 'IN_STOCK';
  }
  await product.save();

  // 8. Create inventory event (audit trail)
  const inventoryEvent = await InventoryEvent.create({
    eventType: 'PRODUCT_SCANNED',
    product: product._id,
    rfidUid: product.rfidUid,
    cart: cart._id,
    cartId: cart.cartId,
    quantityChange: -1,
    stockAfter: product.stockQuantity,
    source: source || 'SIMULATOR',
  });

  // 9. Create low stock alert if needed
  let alert = null;
  if (product.status === 'LOW_STOCK' || product.status === 'OUT_OF_STOCK') {
    alert = await Alert.create({
      type: product.status === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      product: product._id,
      message: `${product.name} is ${product.status === 'OUT_OF_STOCK' ? 'out of stock' : 'running low'} (${product.stockQuantity} left)`,
    });
  }

  // 10. Emit Socket.IO events to all relevant rooms
  const io = getIO();

  // To the specific customer's cart room
  io.to(`cart_${cart._id}`).emit('productScanned', {
    cart,
    scannedProduct: product,
  });
  io.to(`cart_${cart._id}`).emit('cartUpdated', { cart });

  // To managers monitoring everything
  io.to('managers').emit('cartUpdated', { cart });
  io.to('managers').emit('inventoryUpdated', { product });

  if (alert) {
    io.to('managers').emit('lowStockAlert', { alert, product });
  }

  // 11. Return updated cart/product info
  res.status(200).json({
    success: true,
    message: `${product.name} scanned and added to cart`,
    data: {
      cart,
      product,
      event: inventoryEvent,
    },
  });
});

// @desc  Product return / removal — called by IoT Simulator NOW, by ESP32 LATER
// @route POST /api/iot/product-return
export const handleProductReturn = asyncHandler(async (req, res) => {
  const { cartId, rfidUid, source } = req.body;

  if (!cartId || !rfidUid) {
    throw new ApiError(400, 'cartId and rfidUid are required');
  }

  const cart = await Cart.findOne({ cartId: cartId.toUpperCase(), status: 'ACTIVE' });
  if (!cart) {
    throw new ApiError(404, `No active cart found with ID: ${cartId}`);
  }

  const product = await Product.findOne({ rfidUid: rfidUid.toUpperCase() });
  if (!product) {
    throw new ApiError(404, `No product found for RFID UID: ${rfidUid}`);
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => String(item.product) === String(product._id)
  );

  if (existingItemIndex === -1) {
    throw new ApiError(400, `${product.name} is not in this cart`);
  }

  // Decrement quantity or remove entirely
  const item = cart.items[existingItemIndex];
  if (item.quantity > 1) {
    item.quantity -= 1;
    item.subtotal = item.quantity * item.price;
  } else {
    cart.items.splice(existingItemIndex, 1);
  }

  cart.recalculateTotals();
  await cart.save();

  // Restore inventory
  product.stockQuantity += 1;
  if (product.stockQuantity <= 0) {
    product.status = 'OUT_OF_STOCK';
  } else if (product.stockQuantity <= product.minimumStock) {
    product.status = 'LOW_STOCK';
  } else {
    product.status = 'IN_STOCK';
  }
  await product.save();

  const inventoryEvent = await InventoryEvent.create({
    eventType: 'PRODUCT_REMOVED',
    product: product._id,
    rfidUid: product.rfidUid,
    cart: cart._id,
    cartId: cart.cartId,
    quantityChange: 1,
    stockAfter: product.stockQuantity,
    source: source || 'SIMULATOR',
  });

  const io = getIO();
  io.to(`cart_${cart._id}`).emit('productRemoved', { cart, removedProduct: product });
  io.to(`cart_${cart._id}`).emit('cartUpdated', { cart });
  io.to('managers').emit('cartUpdated', { cart });
  io.to('managers').emit('inventoryUpdated', { product });

  res.status(200).json({
    success: true,
    message: `${product.name} removed from cart`,
    data: {
      cart,
      product,
      event: inventoryEvent,
    },
  });
});