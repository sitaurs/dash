const mongoose = require('mongoose');

const oauthTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true // One token per user
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  scope: {
    type: String,
    required: true,
    default: 'https://www.googleapis.com/auth/blogger'
  },
  tokenType: {
    type: String,
    default: 'Bearer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRefreshed: {
    type: Date,
    default: Date.now
  },
  googleUserId: {
    type: String,
    required: false // Google user ID for additional validation
  }
}, {
  timestamps: true
});

// Index for performance
oauthTokenSchema.index({ userId: 1 });
oauthTokenSchema.index({ expiresAt: 1 });
oauthTokenSchema.index({ isActive: 1 });

// Virtual to check if token is expired
oauthTokenSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Method to check if token needs refresh (expires in next 5 minutes)
oauthTokenSchema.methods.needsRefresh = function() {
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return this.expiresAt < new Date(Date.now() + bufferTime);
};

// Static method to find active token for user
oauthTokenSchema.statics.findActiveToken = function(userId) {
  return this.findOne({ 
    userId: userId, 
    isActive: true 
  });
};

// Static method to create or update token
oauthTokenSchema.statics.createOrUpdateToken = async function(userId, tokenData) {
  // Deactivate existing tokens for this user
  await this.updateMany(
    { userId: userId }, 
    { isActive: false }
  );
  
  // Create new token
  const newToken = new this({
    userId: userId,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: new Date(tokenData.expiry_date),
    scope: tokenData.scope || 'https://www.googleapis.com/auth/blogger',
    tokenType: tokenData.token_type || 'Bearer',
    googleUserId: tokenData.google_user_id,
    isActive: true,
    lastRefreshed: new Date()
  });
  
  await newToken.save();
  console.log('✅ OAuth token saved for user:', userId);
  return newToken;
};

// Method to update access token after refresh
oauthTokenSchema.methods.updateAccessToken = async function(newAccessToken, newExpiresAt) {
  this.accessToken = newAccessToken;
  this.expiresAt = new Date(newExpiresAt);
  this.lastRefreshed = new Date();
  await this.save();
  console.log('✅ Access token refreshed for user:', this.userId);
  return this;
};

// Method to safely return token data (exclude sensitive info)
oauthTokenSchema.methods.toSafeObject = function() {
  return {
    userId: this.userId,
    expiresAt: this.expiresAt,
    scope: this.scope,
    isActive: this.isActive,
    lastRefreshed: this.lastRefreshed,
    isExpired: this.isExpired,
    needsRefresh: this.needsRefresh()
  };
};

const OAuthToken = mongoose.model('OAuthToken', oauthTokenSchema);

module.exports = OAuthToken;