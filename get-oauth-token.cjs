#!/usr/bin/env node
/**
 * Simple OAuth Token Getter
 * Exchanges authorization code for tokens
 */

const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = '60184572847-2knv6l327muo06kdp35km87049hagsot.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:6000/callback';
const TOKENS_PATH = path.join(__dirname, 'config/gsc-tokens.json');

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/analytics',
  'https://www.googleapis.com/auth/bigquery',
  'https://www.googleapis.com/auth/cloud-platform'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('🔑 OAuth Token Setup\n');

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('📋 Step 1: Visit this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n📋 Step 2: After authorization, copy the CODE from the redirect URL');
  console.log('   URL will look like: http://localhost:6000/callback?code=XXXXXXX\n');

  rl.question('Paste the authorization code here: ', async (code) => {
    try {
      console.log('\n🔄 Exchanging code for tokens...');

      const { tokens } = await oauth2Client.getToken(code.trim());

      const tokenData = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date || Date.now() + 3600000).toISOString(),
        tokenType: 'Bearer'
      };

      // Ensure config directory exists
      const configDir = path.dirname(TOKENS_PATH);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokenData, null, 2));

      console.log('\n✅ Success! Tokens saved to:', TOKENS_PATH);
      console.log('\n🔑 Access Token:', tokens.access_token.substring(0, 50) + '...');
      console.log('🔄 Refresh Token:', tokens.refresh_token?.substring(0, 50) + '...');
      console.log('⏰ Expires:', tokenData.expiryDate);
      console.log('\n✨ You can now use the MCP server!\n');

      rl.close();
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      rl.close();
      process.exit(1);
    }
  });
}

main();
