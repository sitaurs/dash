const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for performance
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });

// Virtual for account locking
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isLocked) {
    throw new Error('Account is locked');
  }
  
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  if (!isMatch) {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
    }
    await this.save();
    return false;
  }
  
  // Reset login attempts on successful login
  if (this.loginAttempts > 0) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }
  
  this.lastLogin = new Date();
  await this.save();
  return true;
};

// Static method to find by username
adminSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username, isActive: true });
};

// Static method to create default admin
adminSchema.statics.createDefaultAdmin = async function() {
  const existingAdmin = await this.findOne({ username: 'admin' });
  if (!existingAdmin) {
    const defaultAdmin = new this({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      email: process.env.ADMIN_EMAIL || 'admin@blogger-dashboard.com',
      role: 'admin'
    });
    await defaultAdmin.save();
    console.log('✅ Default admin created successfully');
    return defaultAdmin;
  }
  return existingAdmin;
};

// Method to safely return admin data
adminSchema.methods.toJSON = function() {
  const adminObj = this.toObject();
  delete adminObj.password;
  delete adminObj.loginAttempts;
  delete adminObj.lockUntil;
  return adminObj;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;