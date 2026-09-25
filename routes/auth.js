const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login  { username, password } -> { token, admin }
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const ok = await admin.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      admin: { id: admin._id, username: admin.username, name: admin.name, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me - returns the logged-in admin, used to restore a session on page load
router.get('/me', requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-passwordHash');
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  res.json(admin);
});

module.exports = router;
