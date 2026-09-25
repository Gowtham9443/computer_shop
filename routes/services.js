const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/service-requests - public, saved when the "Book an Engineer" form is submitted
router.post('/', async (req, res) => {
  try {
    const { service, customerName, phone, deviceBrand, urgency, issue } = req.body || {};
    if (!service || !customerName || !phone || !issue) {
      return res.status(400).json({ message: 'service, customerName, phone and issue are required' });
    }
    const request = await ServiceRequest.create({ service, customerName, phone, deviceBrand, urgency, issue });
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not save service request' });
  }
});

// GET /api/service-requests?status= (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await ServiceRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Could not load service requests' });
  }
});

// PATCH /api/service-requests/:id (admin only) - update status/notes
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const request = await ServiceRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!request) return res.status(404).json({ message: 'Service request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Could not update service request' });
  }
});

// DELETE /api/service-requests/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'Service request not found' });
    res.json({ message: 'Service request deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete service request' });
  }
});

module.exports = router;
