const express = require('express');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
//   Public:        returns active products only, optional ?type= and ?search=
//   Admin (?all=1): requires a valid admin token, returns every product (active + hidden)
router.get('/', async (req, res) => {
  try {
    const { type, search, all } = req.query;

    if (all) {
      // Admin view - must be authenticated
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'Missing or invalid Authorization header' });
      try {
        require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
      } catch {
        return res.status(401).json({ message: 'Invalid or expired token, please log in again' });
      }
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.json(products);
    }

    const filter = { isActive: true };
    if (type && type !== 'All') filter.type = type;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Could not load products' });
  }
});

// GET /api/products/types - distinct types currently in use (active products)
router.get('/types', async (req, res) => {
  try {
    const types = await Product.distinct('type', { isActive: true });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Could not load product types' });
  }
});

// POST /api/products - create (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not create product' });
  }
});

// PUT /api/products/:id - full update (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not update product' });
  }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete product' });
  }
});

// PATCH /api/products/:id/type - change category (admin only)
router.patch('/:id/type', requireAdmin, async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) return res.status(400).json({ message: 'type is required' });
    const product = await Product.findByIdAndUpdate(req.params.id, { type }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Could not update product type' });
  }
});

// PATCH /api/products/:id/stock - update stock status/quantity (admin only)
router.patch('/:id/stock', requireAdmin, async (req, res) => {
  try {
    const { stockStatus, quantity } = req.body;
    const update = {};
    if (stockStatus) update.stockStatus = stockStatus;
    if (quantity !== undefined) update.quantity = quantity;

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Could not update stock' });
  }
});

module.exports = router;
