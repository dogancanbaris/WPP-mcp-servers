#!/usr/bin/env node
/**
 * Refresh OAuth Access Token
 * Uses refresh token to get new access token from Google OAuth
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = '60184572847-2knv6l327muo06kdp35km87049hagsot.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REFRESH_TOKEN = '1//050VfiZX1KH8ZCgYIARAAGAUSNgF-L9Irh4Uf8PkEuCFclTbcdBvkiOxIkarXka71Hk7g2ZkEFXSccbYR2vI9hXDGcDKSh4DeMg';
const TOKENS_PATH = path.join(__dirname, 'config/gsc-tokens.json');

async function refreshAccessToken() {
  try {
    console.log('🔄 Refreshing OAuth access token...');

    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      'http://localhost:6000/callback'
    );

    oauth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN
    });

    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error('Failed to get access token from refresh token');
    }

    const tokens = {
      accessToken: token,
      refreshToken: REFRESH_TOKEN,
      expiryDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      tokenType: 'Bearer'
    };

    // Ensure config directory exists
    const configDir = path.dirname(TOKENS_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));

    console.log('✅ OAuth token refreshed successfully!');
    console.log('📝 Token saved to:', TOKENS_PATH);
    console.log('🔑 New access token:', token.substring(0, 50) + '...');
    console.log('⏰ Expires:', tokens.expiryDate);

    return tokens;
  } catch (error) {
    console.error('❌ Failed to refresh token:', error.message);
    process.exit(1);
  }
}

refreshAccessToken();
