#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');
const mongoose = require('mongoose');

// DB utilities and models
const connectDB = require('../src/config/database');
const Admin = require('../src/models/Admin');
const OAuthToken = require('../src/models/OAuthToken');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/blogger'];

async function generateToken() {
  console.log('🔐 ================================');
  console.log('🔐 OAuth Token Generator');
  console.log('🔐 Pusat Kendali Blogger');
  console.log('🔐 ================================');
  
  // Check if required environment variables are set
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env file');
    console.log('💡 Please check your .env file and make sure you have:');
    console.log('   GOOGLE_CLIENT_ID=your_client_id');
    console.log('   GOOGLE_CLIENT_SECRET=your_client_secret');
    console.log('   GOOGLE_REDIRECT_URI=http://localhost:3002/auth/google/callback');
    process.exit(1);
  }

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('📋 Step 1: Open this URL in your browser:');
  console.log('🔗', authUrl);
  console.log('');
  console.log('📋 Step 2: After authorization, you will be redirected to:');
  console.log('   http://localhost:3002/auth/google/callback?code=AUTHORIZATION_CODE');
  console.log('');
  console.log('📋 Step 3: Copy the AUTHORIZATION_CODE from the URL and paste it below:');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🔑 Enter the authorization code: ', async (code) => {
    try {
      console.log('⏳ Exchanging authorization code for tokens...');

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      console.log('✅ Success! Tokens received:');
      console.log('📄 Access Token:', tokens.access_token ? '✓ Received' : '✗ Missing');
      console.log('🔄 Refresh Token:', tokens.refresh_token ? '✓ Received' : '✗ Missing');
      console.log('⏰ Expires At:', new Date(tokens.expiry_date).toLocaleString());
      console.log('');

      if (!tokens.refresh_token) {
        console.log('⚠️  Warning: No refresh token received.');
        console.log('💡 This might happen if you have already authorized this app before.');
        console.log('💡 To get a refresh token, revoke access at:');
        console.log('   https://myaccount.google.com/permissions');
        console.log('💡 Then run this script again.');
      } else {
        // Connect to database
        await connectDB();

        // Find admin user based on ADMIN_USERNAME or default 'admin'
        const username = process.env.ADMIN_USERNAME || 'admin';
        const adminUser = await Admin.findOne({ username });
        if (!adminUser) {
          console.error(`❌ Admin user '${username}' not found.`);
          process.exit(1);
        }

        // Save tokens to database
        await OAuthToken.createOrUpdateToken(adminUser._id, tokens);
        console.log('💾 Refresh token saved to database for user:', username);
        console.log('🎉 Setup complete! Your application can now access the Blogger API.');

        // Close DB connection
        await mongoose.connection.close();
      }

      console.log('🔐 ================================');

    } catch (error) {
      console.error('❌ Error exchanging code for tokens:', error.message);
      console.log('💡 Please make sure:');
      console.log('   1. The authorization code is correct');
      console.log('   2. Your Google Cloud Console credentials are valid');
      console.log('   3. The redirect URI matches your Google Cloud Console settings');
    }

    rl.close();
  });
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Token generation cancelled.');
  process.exit(0);
});

generateToken().catch(console.error);