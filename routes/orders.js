const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders - public checkout. Body: { items: [{productId, quantity}], customerName, phone, address }
// Prices are looked up server-side from the current product catalog, never trusted from the client.
router.post('/', async (req, res) => {
  try {
    const { items, customerName, phone, address, notes } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    if (!customerName || !phone) {
      return res.status(400).json({ message: 'customerName and phone are required' });
    }

    const orderItems = [];
    let total = 0;

    for (const { productId, quantity } of items) {
      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${productId} was not found` });
      }
      orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: qty });
      total += product.price * qty;
    }

    const order = await Order.create({
      items: orderItems,
      total,
      customerName,
      phone,
      address,
      notes,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not place order' });
  }
});

// GET /api/orders (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders' });
  }
});

// PATCH /api/orders/:id (admin only) - update status/notes
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Could not update order' });
  }
});

module.exports = router;
