#!/usr/bin/env node
/**
 * Test script to verify Google Ads API access
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { readJsonFile } from './shared/utils.js';
// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });
async function testGoogleAdsAPI() {
    console.log('======================================');
    console.log('Google Ads API Connection Test');
    console.log('======================================\n');
    try {
        // Get credentials
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
        const tokensPath = process.env.GSC_TOKENS_PATH || './config/gsc-tokens.json';
        if (!clientId || !clientSecret) {
            throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
        }
        if (!developerToken) {
            throw new Error('Missing GOOGLE_ADS_DEVELOPER_TOKEN');
        }
        console.log('✓ Environment variables loaded');
        console.log(`  - Client ID: ${clientId.substring(0, 20)}...`);
        console.log(`  - Developer Token: ${developerToken}`);
        console.log('');
        // Load OAuth tokens
        console.log('Loading OAuth tokens...');
        const tokens = await readJsonFile(tokensPath);
        if (!tokens || !tokens.refreshToken) {
            throw new Error('No OAuth tokens found. Please run: npm run setup:auth');
        }
        console.log('✓ OAuth tokens loaded');
        console.log('');
        // Dynamic import of google-ads-api
        console.log('Initializing Google Ads API client...');
        const { GoogleAdsApi } = await import('google-ads-api');
        const client = new GoogleAdsApi({
            client_id: clientId,
            client_secret: clientSecret,
            developer_token: developerToken,
        });
        console.log('✓ Google Ads API client initialized');
        console.log('');
        // List accessible customers using refresh token
        console.log('Attempting to list accessible customer accounts...');
        const response = await client.listAccessibleCustomers(tokens.refreshToken);
        const customerIds = response.resource_names || [];
        console.log('✓ Successfully connected to Google Ads API!');
        console.log('');
        console.log(`Found ${customerIds.length} accessible customer account(s):`);
        console.log('');
        if (customerIds.length === 0) {
            console.log('  ℹ️  No customer accounts found.');
            console.log('  This is expected for a blank Google Ads account.');
            console.log('  The API connection is working correctly.');
        }
        else {
            for (const customerId of customerIds) {
                console.log(`  - ${customerId}`);
            }
        }
        console.log('');
        console.log('======================================');
        console.log('✅ Google Ads API Test Successful!');
        console.log('======================================');
        console.log('');
        console.log('The OAuth tokens work with Google Ads API.');
        console.log('You can now proceed with building Google Ads MCP tools.');
        console.log('');
    }
    catch (error) {
        console.error('');
        console.error('======================================');
        console.error('❌ Google Ads API Test Failed');
        console.error('======================================');
        console.error('');
        console.error(`Error: ${error.message}`);
        console.error('');
        console.error('Stack:', error.stack);
        console.error('');
        if (error.code === 'ENOENT') {
            console.error('Tokens file not found. Please run: npm run setup:auth');
        }
        console.error('');
        process.exit(1);
    }
}
testGoogleAdsAPI();
//# sourceMappingURL=test-google-ads.js.map