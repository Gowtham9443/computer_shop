# Backend - Sen Kumaran Info Tech API

Node.js / Express / MongoDB REST API. No longer serves any HTML — it's a pure API
that the `../frontend` project (or anything else) calls over HTTP. CORS is enabled
so a frontend on a different origin/port can reach it.

## Setup

```bash
npm install
cp .env.example .env    # fill in MONGODB_URI, JWT_SECRET, admin login, WHATSAPP_NUMBER
npm run seed             # creates the default admin account + starter products
npm start                 # or: npm run dev (nodemon)
```

Runs on `http://localhost:5000` by default (`PORT` in `.env`).

## Project structure

```
backend/
├── server.js              # Express app entry point
├── config/db.js           # MongoDB connection
├── models/                # Mongoose schemas (Product, Admin, ServiceRequest, Order)
├── routes/                # API routes (auth, products, services, orders, dashboard)
├── middleware/auth.js     # JWT auth guard for admin-only routes
└── utils/seed.js          # Creates default admin + starter products (npm run seed)
```

## API endpoints

Public:
- `GET /api/products` — active products (`?type=Laptops`, `?search=acer`)
- `GET /api/products/types` — distinct product types in use
- `POST /api/service-requests` — create a booking
- `POST /api/orders` — checkout (prices are looked up server-side, not trusted from the client)

Admin (require `Authorization: Bearer <token>` from `POST /api/auth/login`):
- `GET /api/auth/me`
- `GET /api/products?all=1`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- `PATCH /api/products/:id/type`, `PATCH /api/products/:id/stock`
- `GET /api/service-requests`, `PATCH /api/service-requests/:id`, `DELETE /api/service-requests/:id`
- `GET /api/orders`, `PATCH /api/orders/:id`
- `GET /api/dashboard/stats`

Also public: `GET /api/config` (WhatsApp number) and `GET /api/health`.

## Security note

Change `DEFAULT_ADMIN_PASSWORD` and `JWT_SECRET` before deploying anywhere public.

## Troubleshooting

- **`EADDRINUSE ... port 5000`** - an old server is still running. Windows:
  `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`, or set a different `PORT` in `.env`
  (and update `API_BASE` in `frontend/js/api.js`).
- **`MongoDB connected -> test`** - add a database name to `MONGODB_URI` (e.g. `/senkumaran`), then run `npm run seed` again.
- **Frontend shows "Cannot reach the server"** - the backend is not running, or `API_BASE` uses the wrong port.
