// Run with: npm run seed
// Creates the default admin login and (if the products collection is empty)
// loads the same products that were originally hardcoded in the HTML page,
// so the site keeps working immediately once it switches to the database.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Product = require('../models/Product');

const initialProducts = [
  {
    name: 'AMD Ryzen 5 Home & Office PC',
    type: 'Computers',
    brand: 'Assembled',
    description: 'Ryzen 5 desktop for home and office use with fast boot and multitasking.',
    price: 30359,
    oldPrice: 32999,
    icon: 'fa-solid fa-computer',
    stockStatus: 'IN_STOCK',
    quantity: 8,
  },
  {
    name: 'Acer Aspire 7 Laptop',
    type: 'Laptops',
    brand: 'Acer',
    description: 'Slim laptop for students and professionals with all-day battery life.',
    price: 47691,
    oldPrice: 52990,
    icon: 'fa-solid fa-laptop',
    stockStatus: 'IN_STOCK',
    quantity: 5,
  },
  {
    name: 'HP LaserJet Office Printer',
    type: 'Printers',
    brand: 'HP',
    description: 'Fast mono laser printer built for shops and small offices.',
    price: 13011,
    oldPrice: 13990,
    icon: 'fa-solid fa-print',
    stockStatus: 'IN_STOCK',
    quantity: 12,
  },
  {
    name: 'CP Plus 4-Camera CCTV Kit',
    type: 'CCTV Cameras',
    brand: 'CP Plus',
    description: 'Complete 4-camera HD kit with night vision, DVR and cabling.',
    price: 14959,
    oldPrice: 16999,
    icon: 'fa-solid fa-video',
    stockStatus: 'IN_STOCK',
    quantity: 10,
  },
];

async function seed() {
  await connectDB();

  // 1. Default admin account
  const username = (process.env.DEFAULT_ADMIN_USERNAME || 'admin').toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';

  let admin = await Admin.findOne({ username });
  if (!admin) {
    admin = new Admin({ username, name: 'Administrator', role: 'SUPER_ADMIN' });
    await admin.setPassword(password);
    await admin.save();
    console.log(`Created default admin -> username: "${username}", password: "${password}"`);
    console.log('IMPORTANT: log in and change this password (or set your own before seeding).');
  } else {
    console.log(`Admin "${username}" already exists, skipping.`);
  }

  // 2. Initial catalog (only if the products collection is currently empty)
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(initialProducts);
    console.log(`Seeded ${initialProducts.length} starter products.`);
  } else {
    console.log(`Products collection already has ${productCount} item(s), skipping product seed.`);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
