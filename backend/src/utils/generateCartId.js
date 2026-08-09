import Cart from '../models/Cart.model.js';

const generateCartId = async () => {
  const count = await Cart.countDocuments();
  const nextNumber = count + 1;
  const paddedNumber = String(nextNumber).padStart(3, '0');
  let cartId = `CART-${paddedNumber}`;

  // Handle edge case where a cart was deleted, causing count mismatch
  let exists = await Cart.findOne({ cartId });
  let attempt = nextNumber;
  while (exists) {
    attempt += 1;
    cartId = `CART-${String(attempt).padStart(3, '0')}`;
    exists = await Cart.findOne({ cartId });
  }

  return cartId;
};

export default generateCartId;