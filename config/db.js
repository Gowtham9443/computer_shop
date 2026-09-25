const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not set. Copy .env.example to .env and configure it.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected -> ${mongoose.connection.name}`);

    // If the URI has no database name, MongoDB silently uses "test".
    if (mongoose.connection.name === 'test') {
      console.warn(
        'WARNING: connected to the default "test" database. Add a database name to MONGODB_URI, ' +
          'e.g. mongodb://127.0.0.1:27017/senkumaran (then run "npm run seed" again).'
      );
    }
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
}

module.exports = connectDB;
