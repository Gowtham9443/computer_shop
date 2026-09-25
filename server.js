const path = require('path');
const fs = require('fs');

// Always load .env from the backend folder (next to this file), no matter which
// folder the server is started from.
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');

// Fail early with a clear message instead of a confusing 500 later on login
if (!fs.existsSync(envPath)) {
  console.error(`\n.env file not found. Expected it at:\n  ${envPath}`);
  console.error('Fix: in the backend folder run  copy .env.example .env  then edit it.');
  console.error('(If you have a file named "_env" or ".env.txt", rename it to exactly ".env")\n');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error(`\nJWT_SECRET is missing in ${envPath}`);
  console.error('Add a line like:  JWT_SECRET=<a long random string>   (no spaces around "=", no quotes)');
  console.error('Generate one with:  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n');
  process.exit(1);
}

const app = express();

app.use(cors()); // allows the frontend (any port / file://) to call this API
app.use(express.json({ limit: '1mb' }));

// Limit login attempts to slow down password guessing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again in 15 minutes' },
});
app.use('/api/auth/login', loginLimiter);

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/service-requests', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Public site settings the frontend needs (used for WhatsApp booking/order redirects)
app.get('/api/config', (req, res) => {
  res.json({ whatsappNumber: process.env.WHATSAPP_NUMBER || '' });
});

// Unknown /api routes -> JSON 404 (instead of an HTML error page)
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// ---- Serve the website (frontend) so http://localhost:5000 opens index.html ----
// Looks for a "frontend" folder next to this "backend" folder (override with FRONTEND_DIR in .env).
// Only that folder is served - never the backend folder, so .env stays private.
const frontendDir = process.env.FRONTEND_DIR
  ? path.resolve(process.env.FRONTEND_DIR)
  : path.join(__dirname, '..', 'frontend');

if (fs.existsSync(path.join(frontendDir, 'index.html'))) {
  app.use(express.static(frontendDir));

  // Let clean URLs like /admin work even when the actual file is admin.html
  // or admin/index.html, without needing a query string or extension.
  app.get(/^\/[a-zA-Z0-9\-_/]*$/, (req, res, next) => {
    const candidates = [req.path + '.html', path.join(req.path, 'index.html')];
    for (const rel of candidates) {
      const full = path.join(frontendDir, rel);
      if (full.startsWith(frontendDir) && fs.existsSync(full)) return res.sendFile(full);
    }
    next();
  });

  console.log(`Serving website from ${frontendDir}`);
} else {
  app.get('/', (req, res) => {
    res.status(200).send(
      `<!doctype html><meta charset="utf-8"><title>Sen Kumaran Info Tech API</title>` +
        `<body style="font-family:sans-serif;max-width:640px;margin:40px auto;line-height:1.5">` +
        `<h2>API is running &#10003;</h2>` +
        `<p>But no website was found. Put your <b>index.html</b> in this folder:</p>` +
        `<pre style="background:#eee;padding:10px">${frontendDir}</pre>` +
        `<p>then restart the server and refresh this page.</p>` +
        `<p>API check: <a href="/api/health">/api/health</a></p></body>`
    );
  });
  console.warn(`No index.html found in ${frontendDir} - put your website files there.`);
}

// ---- Error handler (catches anything thrown/rejected in routes) ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Sen Kumaran Info Tech API running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nPort ${PORT} is already in use (probably an old server still running).\n` +
          `  Fix 1: find and stop it ->  netstat -ano | findstr :${PORT}   then   taskkill /PID <pid> /F\n` +
          `  Fix 2: use another port  ->  set PORT=5001 in .env and update API_BASE in frontend/js/api.js\n`
      );
      process.exit(1);
    }
    throw err;
  });
});
