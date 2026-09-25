const express = require('express');
const Product = require('../models/Product');
const ServiceRequest = require('../models/ServiceRequest');
const Order = require('../models/Order');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats (admin only)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [totalProducts, outOfStock, newServiceRequests, pendingOrders, productsByTypeAgg] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ stockStatus: 'OUT_OF_STOCK' }),
      ServiceRequest.countDocuments({ status: 'NEW' }),
      Order.countDocuments({ status: 'PENDING' }),
      Product.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);

    const productsByType = productsByTypeAgg.map((t) => ({ type: t._id, count: t.count }));

    res.json({ totalProducts, outOfStock, newServiceRequests, pendingOrders, productsByType });
  } catch (err) {
    res.status(500).json({ message: 'Could not load dashboard stats' });
  }
});

module.exports = router;
