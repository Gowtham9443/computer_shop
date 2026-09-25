const jwt = require('jsonwebtoken');

// Protects any route it is attached to - requires "Authorization: Bearer <token>".
// Used for all admin-panel write operations (create/update/delete products,
// update service requests & orders) so only a logged-in admin can change data.
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token, please log in again' });
  }
}

module.exports = { requireAdmin };
