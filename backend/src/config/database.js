const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogger-dashboard';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log('📦 ================================');
    console.log('📦 MongoDB Connection Successful');
    console.log('📦 ================================');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📦 Host: ${mongoose.connection.host}`);
    console.log(`📦 Port: ${mongoose.connection.port}`);
    console.log('📦 ================================');

    // Create default admin if it doesn't exist
    await Admin.createDefaultAdmin();

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('📦 MongoDB reconnected');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📦 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return true;
  } catch (error) {
    console.error('❌ ================================');
    console.error('❌ Database Connection Failed');
    console.error('❌ ================================');
    console.error('❌ Error:', error.message);
    console.error('❌ ================================');
    console.error('💡 Please ensure MongoDB is running');
    console.error('💡 Check your MONGODB_URI in .env file');
    console.error('💡 Default: mongodb://localhost:27017/blogger-dashboard');
    console.error('❌ ================================');
    process.exit(1);
  }
};

module.exports = connectDB;