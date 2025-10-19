#!/usr/bin/env node

/**
 * OAuth 2.0 Setup Script for Google Search Console
 *
 * This script helps you authorize the MCP server to access your Google Search Console account.
 */

import * as readline from 'readline';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { GSCAuthManager, startOAuthCallbackServer } from './gsc/auth.js';

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


async function main(): Promise<void> {
  console.log('======================================');
  console.log('Google Search Console OAuth Setup');
  console.log('======================================\n');

  try {
    // Get credentials from environment
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback';

    if (!clientId || !clientSecret) {
      console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env file');
      console.log('\nSteps to set up OAuth credentials:');
      console.log('1. Go to https://console.cloud.google.com');
      console.log('2. Create a new project');
      console.log('3. Enable "Google Search Console API"');
      console.log('4. Create OAuth 2.0 credentials (Desktop/Desktop app):');
      console.log('   - Add redirect URI: http://localhost:6000/callback');
      console.log('5. Copy Client ID and Client Secret to .env file');
      rl.close();
      process.exit(1);
    }

    console.log('Creating OAuth authentication manager...');
    const authManager = new GSCAuthManager(clientId, clientSecret, redirectUri);

    // Start callback server
    console.log('Starting OAuth callback server on port 6000...');
    const { server, codePromise } = await startOAuthCallbackServer(6000);

    // Get authorization URL
    const authUrl = authManager.getAuthorizationUrl();

    console.log('\nOpening browser for authorization...');
    console.log(`If browser does not open, visit: ${authUrl}\n`);

    // Open browser
    try {
      const { default: open } = await import('open');
      await open(authUrl);
    } catch (error) {
      console.log(`Please manually visit: ${authUrl}`);
    }

    // Wait for authorization code with timeout for manual fallback
    console.log('Waiting for authorization (timeout in 10 seconds for manual entry)...\n');

    let code: string;
    try {
      // Create a race between automatic callback and timeout
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 10000);
      });

      code = await Promise.race([codePromise, timeoutPromise]);
      console.log('Authorization code received automatically!');
    } catch (error) {
      if ((error as Error).message === 'TIMEOUT') {
        console.log('ℹ️  Automatic callback did not complete (common in WSL2).');
        console.log('📋 Please copy the authorization code from the redirect URL and paste it here.\n');
        console.log('The URL should look like: http://localhost:6000/callback?code=XXXXXXXXX...\n');

        // Prompt for manual code entry
        code = await new Promise<string>((resolve) => {
          rl.question('Enter authorization code: ', (input) => {
            resolve(input.trim());
          });
        });

        if (!code) {
          throw new Error('No authorization code provided');
        }

        console.log('\nExchanging code for tokens...');
      } else {
        throw error;
      }
    }

    console.log('Exchanging authorization code for tokens...');

    // Exchange code for tokens
    await authManager.exchangeCodeForTokens(code);

    // Close server
    server.close();

    console.log('\n✅ Authorization successful!');
    console.log(`\nTokens have been saved to: ./config/gsc-tokens.json`);
    console.log('The MCP server is now ready to use!\n');

    rl.close();
  } catch (error) {
    console.error(`\n❌ Authorization failed: ${(error as Error).message}`);
    rl.close();
    process.exit(1);
  }
}

main();
