import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Cart from '../models/Cart.model.js';
import Transaction from '../models/Transaction.model.js';
import InventoryEvent from '../models/InventoryEvent.model.js';
import Alert from '../models/Alert.model.js';

const products = [
  {
    name: 'Milk (1L)',
    category: 'Dairy',
    price: 35,
    stockQuantity: 40,
    minimumStock: 10,
    rfidUid: 'A3B79124',
    description: 'Fresh full-cream milk, 1 litre pack.',
    image: '',
  },
  {
    name: 'Brown Bread',
    category: 'Bakery',
    price: 45,
    stockQuantity: 25,
    minimumStock: 8,
    rfidUid: 'B1C29988',
    description: 'Whole wheat brown bread loaf.',
    image: '',
  },
  {
    name: 'Eggs (12 pack)',
    category: 'Dairy',
    price: 84,
    stockQuantity: 6,
    minimumStock: 10,
    rfidUid: 'C4D31122',
    description: 'Farm fresh eggs, tray of 12.',
    image: '',
  },
  {
    name: 'Basmati Rice (5kg)',
    category: 'Grocery',
    price: 450,
    stockQuantity: 15,
    minimumStock: 5,
    rfidUid: 'D5E44556',
    description: 'Premium long-grain basmati rice.',
    image: '',
  },
  {
    name: 'Sunflower Oil (1L)',
    category: 'Grocery',
    price: 150,
    stockQuantity: 30,
    minimumStock: 8,
    rfidUid: 'E6F55667',
    description: 'Refined sunflower cooking oil.',
    image: '',
  },
  {
    name: 'Tomatoes (1kg)',
    category: 'Vegetables',
    price: 40,
    stockQuantity: 3,
    minimumStock: 10,
    rfidUid: 'F7A66778',
    description: 'Fresh red tomatoes.',
    image: '',
  },
  {
    name: 'Bananas (dozen)',
    category: 'Fruits',
    price: 60,
    stockQuantity: 20,
    minimumStock: 6,
    rfidUid: 'A8B77889',
    description: 'Ripe yellow bananas, dozen.',
    image: '',
  },
  {
    name: 'Toor Dal (1kg)',
    category: 'Grocery',
    price: 130,
    stockQuantity: 18,
    minimumStock: 5,
    rfidUid: 'B9C88990',
    description: 'Split pigeon peas.',
    image: '',
  },
  {
    name: 'Potato Chips',
    category: 'Snacks',
    price: 20,
    stockQuantity: 0,
    minimumStock: 15,
    rfidUid: 'C0D99001',
    description: 'Classic salted potato chips, 52g pack.',
    image: '',
  },
  {
    name: 'Green Tea (25 bags)',
    category: 'Beverages',
    price: 110,
    stockQuantity: 22,
    minimumStock: 5,
    rfidUid: 'D1E00112',
    description: 'Antioxidant-rich green tea bags.',
    image: '',
  },
  {
    name: 'Yogurt (400g)',
    category: 'Dairy',
    price: 55,
    stockQuantity: 28,
    minimumStock: 8,
    rfidUid: 'E2F11223',
    description: 'Thick and creamy plain yogurt.',
    image: '',
  },
  {
    name: 'Butter (200g)',
    category: 'Dairy',
    price: 105,
    stockQuantity: 4,
    minimumStock: 6,
    rfidUid: 'F3A22334',
    description: 'Salted table butter.',
    image: '',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Transaction.deleteMany({}),
      InventoryEvent.deleteMany({}),
      Alert.deleteMany({}),
    ]);

    console.log('Creating users...');
    const manager = await User.create({
      name: 'Store Manager',
      email: 'manager@test.com',
      password: '123456',
      role: 'MANAGER',
    });

    const customer1 = await User.create({
      name: 'John Customer',
      email: 'customer@test.com',
      password: '123456',
      role: 'CUSTOMER',
    });

    const customer2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@test.com',
      password: '123456',
      role: 'CUSTOMER',
    });

    console.log('Creating products...');
    const createdProducts = await Product.create(products);
    console.log(`Created ${createdProducts.length} products`);

    // Auto-generate LOW_STOCK / OUT_OF_STOCK alerts for seeded products that qualify
    console.log('Creating alerts for low/out-of-stock seed products...');
    const alertPromises = createdProducts
      .filter((p) => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK')
      .map((p) =>
        Alert.create({
          type: p.status,
          product: p._id,
          message: `${p.name} is ${p.status === 'OUT_OF_STOCK' ? 'out of stock' : 'running low'} (${p.stockQuantity} left)`,
        })
      );
    await Promise.all(alertPromises);

    console.log('Creating a sample completed transaction for customer2...');
    const milk = createdProducts.find((p) => p.rfidUid === 'A3B79124');
    const bread = createdProducts.find((p) => p.rfidUid === 'B1C29988');

    const sampleCart = await Cart.create({
      cartId: 'CART-001',
      customer: customer2._id,
      items: [
        {
          product: milk._id,
          name: milk.name,
          rfidUid: milk.rfidUid,
          price: milk.price,
          quantity: 2,
          subtotal: milk.price * 2,
        },
        {
          product: bread._id,
          name: bread.name,
          rfidUid: bread.rfidUid,
          price: bread.price,
          quantity: 1,
          subtotal: bread.price,
        },
      ],
      status: 'COMPLETED',
    });
    sampleCart.recalculateTotals();
    await sampleCart.save();

    await Transaction.create({
      transactionId: 'TXN-00001',
      cart: sampleCart._id,
      cartId: sampleCart.cartId,
      customer: customer2._id,
      products: sampleCart.items.map((item) => ({
        product: item.product,
        name: item.name,
        category: item.product.equals(milk._id) ? milk.category : bread.category,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      subtotal: sampleCart.subtotal,
      tax: sampleCart.tax,
      total: sampleCart.total,
      paymentStatus: 'PAID',
      transactionStatus: 'COMPLETED',
    });

    console.log('Creating an empty active cart for customer1...');
    await Cart.create({
      cartId: 'CART-002',
      customer: customer1._id,
      items: [],
      status: 'ACTIVE',
    });
    await User.findByIdAndUpdate(customer1._id, {
      activeCartId: (await Cart.findOne({ cartId: 'CART-002' }))._id,
    });

    console.log('\n✅ Seed complete!\n');
    console.log('Login credentials:');
    console.log('  Manager  → manager@test.com / 123456');
    console.log('  Customer → customer@test.com / 123456 (has active empty CART-002)');
    console.log('  Customer → priya@test.com / 123456 (has completed TXN-00001)');
    console.log('\nSample RFID UIDs to scan:');
    createdProducts.forEach((p) => console.log(`  ${p.rfidUid} → ${p.name} (₹${p.price})`));

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();