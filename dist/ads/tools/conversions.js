/**
 * MCP Tools for Google Ads Conversion Tracking
 * Includes: ConversionActionService, ConversionUploadService, ConversionAdjustmentService
 */
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { formatDiscoveryResponse, injectGuidance, formatNextSteps, formatCurrency } from '../../shared/interactive-workflow.js';
import { extractCustomerId } from '../validation.js';
const logger = getLogger('ads.tools.conversions');
/**
 * List conversion actions
 */
export const listConversionActionsTool = {
    name: 'list_conversion_actions',
    description: 'List all conversion actions in a Google Ads account.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
            // Extract OAuth tokens from request
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
            }
            const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
            if (!developerToken) {
                throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
            }
            // Create Google Ads client with user's refresh token
            const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);
            // Account discovery
            if (!input.customerId) {
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/2',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account would you like to list conversion actions for?',
                    nextParam: 'customerId',
                });
            }
            const { customerId } = input;
            const customer = client.getCustomer(customerId);
            logger.info('Listing conversion actions', { customerId });
            // Query conversion actions
            const query = `
        SELECT
          conversion_action.id,
          conversion_action.name,
          conversion_action.category,
          conversion_action.status,
          conversion_action.type,
          conversion_action.counting_type,
          conversion_action.click_through_lookback_window_days,
          conversion_action.value_settings.default_value,
          conversion_action.value_settings.always_use_default_value
        FROM conversion_action
        WHERE conversion_action.status != 'REMOVED'
        ORDER BY conversion_action.name
      `;
            const results = await customer.query(query);
            const conversionActions = [];
            for (const row of results) {
                const action = row.conversion_action;
                conversionActions.push({
                    id: String(action?.id || ''),
                    name: String(action?.name || ''),
                    category: String(action?.category || ''),
                    status: String(action?.status || ''),
                    type: String(action?.type || ''),
                    countingType: String(action?.counting_type || ''),
                    attributionWindow: parseInt(String(action?.click_through_lookback_window_days || 30)),
                    defaultValue: action?.value_settings?.default_value
                        ? parseFloat(String(action.value_settings.default_value)) / 1000000
                        : undefined,
                    alwaysUseDefaultValue: action?.value_settings?.always_use_default_value || false,
                });
            }
            // Calculate summary stats
            const byCategory = conversionActions.reduce((acc, a) => {
                acc[a.category] = (acc[a.category] || 0) + 1;
                return acc;
            }, {});
            const byCountingType = conversionActions.reduce((acc, a) => {
                acc[a.countingType] = (acc[a.countingType] || 0) + 1;
                return acc;
            }, {});
            const withFixedValue = conversionActions.filter(a => a.defaultValue && a.alwaysUseDefaultValue).length;
            // Inject rich guidance into response
            const guidanceText = `📊 CONVERSION ACTIONS

**Account:** ${customerId}
**Total Conversion Actions:** ${conversionActions.length}

📋 BREAKDOWN BY CATEGORY:
${Object.entries(byCategory).map(([cat, count]) => `• ${cat}: ${count} action(s)`).join('\n')}

📋 COUNTING METHOD:
${Object.entries(byCountingType).map(([type, count]) => `• ${type}: ${count} action(s)`).join('\n')}

🎯 CONVERSION ACTIONS IN THIS ACCOUNT:
${conversionActions.slice(0, 10).map((a, i) => `${i + 1}. ${a.name} (${a.category})
   • ID: ${a.id}
   • Type: ${a.type}
   • Counting: ${a.countingType}
   • Attribution Window: ${a.attributionWindow} days${a.defaultValue ? `\n   • Default Value: ${formatCurrency(a.defaultValue)}${a.alwaysUseDefaultValue ? ' (always use)' : ''}` : ''}`).join('\n\n')}${conversionActions.length > 10 ? `\n\n... and ${conversionActions.length - 10} more` : ''}

💡 CONVERSION TRACKING EXPLAINED:

**CATEGORIES:**
- **PURCHASE:** E-commerce transactions (track revenue)
- **LEAD:** Form submissions, signups
- **SIGNUP:** Account creation
- **PAGE_VIEW:** Specific page visits
- **PHONE_CALL:** Call tracking

**COUNTING METHODS:**
- **ONE:** Count once per click (recommended for purchases)
- **MANY:** Count every occurrence (recommended for page views)

**ATTRIBUTION WINDOW:**
- Default: 30 days (click to conversion)
- Shorter = more conservative attribution
- Longer = credits more conversions to ads

🎯 CONVERSION TRACKING BEST PRACTICES:
${conversionActions.length > 0 ? '✅ Conversion tracking is set up' : '⚠️  No conversion actions configured - set up tracking to measure ROI'}
${withFixedValue > 0 ? `✅ ${withFixedValue} conversion(s) with fixed value` : 'ℹ️  Consider adding values to conversions for better optimization'}
${byCountingType['ONE'] ? '✅ Using "ONE" counting for unique conversions' : ''}

${formatNextSteps([
                'Create new conversion action: use create_conversion_action',
                'Upload offline conversions: use upload_click_conversions',
                'Check conversion details: use get_conversion_action with conversionActionId',
                'Set up conversion tracking tags on your website'
            ])}`;
            return injectGuidance({
                customerId,
                conversionActions,
                count: conversionActions.length,
                byCategory,
                byCountingType,
                withFixedValue,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list conversion actions', error);
            throw error;
        }
    },
};
/**
 * Create conversion action
 */
export const createConversionActionTool = {
    name: 'create_conversion_action',
    description: `Create a new conversion action for tracking.

💡 AGENT GUIDANCE - CREATING CONVERSIONS:

🎯 WHAT THIS DOES:
- Creates a new conversion action to track valuable user actions
- Defines what counts as a conversion and how to count it
- Sets attribution window and value settings
- Enables conversion optimization in campaigns

📋 CONVERSION CATEGORIES:
- PURCHASE - E-commerce transactions
- LEAD - Form submissions, signups
- SIGNUP - Account creation
- PAGE_VIEW - Specific page visits
- PHONE_CALL - Call tracking
- DOWNLOAD - File/app downloads
- STORE_VISIT - Physical store visits

📊 COUNTING METHODS:
- ONE - Count one conversion per click (recommended for purchases)
- MANY - Count every conversion (recommended for page views)

⏱️ ATTRIBUTION WINDOW:
- Default: 30 days (click to conversion)
- Can set: 1-90 days
- Shorter window = more conservative attribution

💰 VALUE SETTINGS:
- Use transaction-specific value (e-commerce)
- Use fixed value (leads: $50 each)
- Don't assign value (just count conversions)

🎯 TYPICAL WORKFLOW:
1. Decide what action to track (purchase, signup, etc.)
2. Choose counting method (one vs many)
3. Set attribution window (typically 30 days)
4. Configure value (transaction-specific or fixed)
5. Implement tracking tag on website
6. Verify conversions are being tracked`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            name: {
                type: 'string',
                description: 'Conversion action name (e.g., "Purchase", "Sign Up")',
            },
            category: {
                type: 'string',
                enum: ['PURCHASE', 'LEAD', 'SIGNUP', 'PAGE_VIEW', 'PHONE_CALL', 'DOWNLOAD', 'STORE_VISIT'],
                description: 'Conversion category',
            },
            countingType: {
                type: 'string',
                enum: ['ONE', 'MANY'],
                description: 'How to count conversions (ONE = once per click, MANY = every time)',
            },
            attributionWindowDays: {
                type: 'number',
                description: 'Days between click and conversion to count (1-90, default: 30)',
            },
            valueSettings: {
                type: 'object',
                properties: {
                    defaultValue: {
                        type: 'number',
                        description: 'Fixed value per conversion in dollars (optional)',
                    },
                    alwaysUseDefaultValue: {
                        type: 'boolean',
                        description: 'Always use default value instead of transaction-specific',
                    },
                },
            },
        },
        required: [], // Make all optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, name, category, countingType, attributionWindowDays = 30, valueSettings, } = input;
            // Extract OAuth tokens from request
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
            }
            const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
            if (!developerToken) {
                throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
            }
            // Create Google Ads client with user's refresh token
            const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
            if (!customerId) {
                logger.info('Account discovery mode - listing accessible accounts');
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}\n   Resource: ${a.resourceName}`,
                    prompt: 'Which account should have this conversion action?',
                    nextParam: 'customerId',
                    emoji: '🏢',
                });
            }
            // ═══ STEP 2: CONVERSION NAME INPUT ═══
            if (!name) {
                const guidanceText = `📝 CONVERSION ACTION NAME (Step 2/3)

**Current Context:**
- Account: ${customerId}

**💡 NAME YOUR CONVERSION:**

**Common Naming Patterns:**
- "Purchase" - E-commerce transactions
- "Lead - Contact Form" - Form submissions
- "Sign Up - Free Trial" - Account creation
- "Download - Whitepaper" - Content downloads
- "Phone Call - Sales" - Call tracking
- "Store Visit" - Physical visits

**Best Practices:**
- Be descriptive and specific
- Include business value indicator
- Match naming convention across account
- Make it easy to identify in reports

**Examples:**
- ✅ "Purchase - High Value (>$100)"
- ✅ "Lead - Demo Request"
- ✅ "Sign Up - Premium Plan"
- ❌ "Conversion1" (too vague)
- ❌ "test" (not production-ready)

**What parameter to provide next?**
- name (string, descriptive name for this conversion)`;
                return injectGuidance({ customerId }, guidanceText);
            }
            // ═══ STEP 3: CATEGORY SELECTION GUIDANCE ═══
            if (!category) {
                const guidanceText = `📊 CONVERSION CATEGORY SELECTION (Step 3/7)

**Current:** Creating "${name}" conversion action

🎓 **AGENT TRAINING - CONVERSION CATEGORY LOGIC:**

**CATEGORY DECISION TREE:**

1. **PURCHASE** (E-commerce revenue)
   ✅ Use when: Tracking online sales, transactions
   ✅ Value: Use transaction-specific (varies by order)
   ✅ Counting: ONE (one purchase per click)
   ✅ Example: "E-commerce Purchase", "Product Sale"
   ⚠️ Requires: Transaction value passing from website

2. **LEAD** (Form submissions, quote requests)
   ✅ Use when: Capturing potential customers (B2B, services)
   ✅ Value: Fixed amount (estimate lead value, e.g., $50)
   ✅ Counting: ONE (one lead per click)
   ✅ Example: "Contact Form Submit", "Quote Request", "Demo Request"

3. **SIGNUP** (Account creation)
   ✅ Use when: New user registration, newsletter signup
   ✅ Value: Fixed (lifetime value estimate) or none
   ✅ Counting: ONE
   ✅ Example: "Newsletter Signup", "Create Account", "Free Trial Start"

4. **PAGE_VIEW** (Engagement)
   ✅ Use when: Tracking key page visits
   ✅ Value: Usually none (or small fixed)
   ✅ Counting: MANY (can view multiple times)
   ✅ Example: "Pricing Page View", "Product Detail View"

5. **PHONE_CALL** (Call tracking)
   ✅ Use when: Phone number clicks or call forwarding
   ✅ Value: Fixed (estimated call value)
   ✅ Counting: ONE
   ✅ Example: "Phone Call - Sales", "Click-to-Call"
   ⚠️ Requires: Call tracking integration

6. **DOWNLOAD** (File/app downloads)
   ✅ Use when: PDF downloads, app installs
   ✅ Value: Fixed or none
   ✅ Counting: ONE per download
   ✅ Example: "Whitepaper Download", "App Install"

7. **STORE_VISIT** (Offline)
   ✅ Use when: Driving foot traffic to physical locations
   ✅ Value: Fixed (avg transaction value)
   ✅ Counting: ONE per visit
   ✅ Example: "Store Visit", "In-Store Purchase"
   ⚠️ Requires: Location extensions, sufficient location data

**AGENT RECOMMENDATION FRAMEWORK:**
Ask: "What action do you want to track when someone clicks your ad?"
- Makes purchase → **PURCHASE**
- Fills form/requests quote → **LEAD**
- Signs up for account → **SIGNUP**
- Views specific page → **PAGE_VIEW**
- Calls phone number → **PHONE_CALL**
- Downloads file → **DOWNLOAD**
- Visits store → **STORE_VISIT**

Which category matches your conversion?`;
                return injectGuidance({ customerId, name }, guidanceText);
            }
            // If countingType not provided, guide user
            if (!countingType) {
                const guidanceText = `⚙️ COUNTING TYPE REQUIRED

**Current Context:**
- Account: ${customerId}
- Name: ${name}
- Category: ${category}

**💡 SELECT COUNTING METHOD:**

**ONE (Recommended for most)**
- Count one conversion per click
- Best for: Purchases, leads, signups
- Example: User clicks ad → buys product → count 1 conversion
- If they buy again from same click → still count 1

**MANY (For engagement tracking)**
- Count every conversion
- Best for: Page views, video views, content downloads
- Example: User clicks ad → views 5 pages → count 5 conversions

**Decision Guide:**
- Transactional (purchase, lead)? → Use ONE
- Engagement (page views, clicks)? → Use MANY
- Not sure? → Use ONE (safer, more conservative)

**What parameter to provide next?**
- countingType (either "ONE" or "MANY")`;
                return injectGuidance({ customerId, name, category }, guidanceText);
            }
            // ═══ EXECUTE CONVERSION ACTION CREATION ═══
            logger.info('Creating conversion action', { customerId, name, category });
            // Build conversion action
            const conversionAction = {
                name,
                category,
                type: 'WEBPAGE',
                counting_type: countingType,
                click_through_lookback_window_days: attributionWindowDays,
            };
            // Add value settings if provided
            if (valueSettings) {
                conversionAction.value_settings = {
                    default_value: valueSettings.defaultValue
                        ? valueSettings.defaultValue * 1000000
                        : undefined,
                    always_use_default_value: valueSettings.alwaysUseDefaultValue || false,
                };
            }
            const customer = client.getCustomer(customerId);
            const operation = {
                create: conversionAction,
            };
            const response = await customer.conversionActions.create([operation]);
            const conversionActionId = response.results?.[0]?.resource_name?.split('/')?.pop() || response;
            const guidanceText = `✅ CONVERSION ACTION CREATED

**Conversion Details:**
- Name: ${name}
- ID: ${conversionActionId}
- Category: ${category}
- Counting: ${countingType}
- Attribution Window: ${attributionWindowDays} days
${valueSettings?.defaultValue ? `- Default Value: $${valueSettings.defaultValue}` : ''}

🚨 **CRITICAL NEXT STEPS - IMPLEMENTATION REQUIRED:**

**1. Install Tracking Tag (REQUIRED):**
   This conversion won't track anything until you add the tracking code to your website!

   • Go to Google Ads → Tools → Conversions
   • Find "${name}" conversion
   • Get tracking tag/snippet
   • Add to your website's ${category === 'PURCHASE' ? 'thank-you/confirmation page' : category === 'LEAD' ? 'form submission page' : 'target page'}

**2. Verify Tracking (Within 48 hours):**
   • Make test conversion on your site
   • Check if it appears in Google Ads
   • If no conversions after 48 hours → Tag not installed correctly

**3. Enable in Campaigns:**
   Conversion actions are automatically available for:
   • Campaign optimization (Target CPA, Target ROAS bidding)
   • Smart Bidding strategies
   • Conversion reporting

**4. Set as Primary (if main goal):**
   use update_conversion_action to set as primary goal

${countingType === 'MANY' ? `\n⚠️ **MANY Counting:** Every occurrence counts. Good for ${category === 'PAGE_VIEW' ? 'page views' : 'engagement'}, NOT for purchases!` : ''}
${category === 'PURCHASE' && !valueSettings ? `\n⚠️ **Missing Value:** PURCHASE conversions should have value. Consider adding transaction-specific value tracking!` : ''}`;
            return injectGuidance({
                customerId,
                conversionActionId,
                name,
                category,
                countingType,
                attributionWindowDays,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to create conversion action', error);
            throw error;
        }
    },
};
/**
 * Upload click conversions (offline conversion import)
 */
export const uploadClickConversionsTool = {
    name: 'upload_click_conversions',
    description: `Upload offline conversions to Google Ads.

💡 AGENT GUIDANCE - OFFLINE CONVERSION IMPORT:

🎯 WHAT THIS DOES:
- Imports offline conversions (sales, leads, calls) that happened outside Google Ads
- Links conversions back to the Google Ads click that drove them
- Enables proper ROI attribution for offline sales
- Critical for B2B and long sales cycles

📋 REQUIRED DATA:
- Conversion action name (must already exist in account)
- GCLID (Google Click ID from ad click)
- Conversion date/time
- Conversion value (optional)

🔗 HOW IT WORKS:
1. User clicks Google Ad → GCLID stored in URL
2. User converts offline (calls, visits store, closes deal)
3. Business records GCLID with conversion in CRM
4. Upload GCLID + conversion data via API
5. Google Ads attributes conversion to original click

💡 COMMON USE CASES:
- B2B: Import closed deals from Salesforce/HubSpot
- Retail: Import in-store purchases linked to online clicks
- Service: Import booked appointments
- Real Estate: Import property sales

⚠️ REQUIREMENTS:
- GCLID tracking must be enabled (auto-tagging)
- Conversions must be within attribution window (default 30 days)
- Conversion action must exist in account
- GCLID must match actual click in Google Ads

📊 BEST PRACTICES:
- Upload conversions daily for accurate attribution
- Include conversion value for revenue tracking
- Verify GCLID format before uploading (starts with "Cj0...")
- Check upload errors and fix in next batch`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            conversionActionId: {
                type: 'string',
                description: 'Conversion action ID (must exist in account)',
            },
            conversions: {
                type: 'array',
                description: 'Array of conversions to upload',
                items: {
                    type: 'object',
                    properties: {
                        gclid: {
                            type: 'string',
                            description: 'Google Click ID from ad click',
                        },
                        conversionDateTime: {
                            type: 'string',
                            description: 'Conversion date/time in format: "2025-10-18 14:30:00 America/New_York"',
                        },
                        conversionValue: {
                            type: 'number',
                            description: 'Conversion value in dollars (optional)',
                        },
                        currencyCode: {
                            type: 'string',
                            description: 'Currency code (e.g., "USD") - default: USD',
                        },
                    },
                    required: ['gclid', 'conversionDateTime'],
                },
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: [], // Make all optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, conversionActionId, conversions, confirmationToken } = input;
            // Extract OAuth tokens from request
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
            }
            const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
            if (!developerToken) {
                throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
            }
            // Create Google Ads client with user's refresh token
            const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
            if (!customerId) {
                logger.info('Account discovery mode - listing accessible accounts');
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}\n   Resource: ${a.resourceName}`,
                    prompt: 'Which account contains the conversion action?',
                    nextParam: 'customerId',
                    emoji: '🏢',
                });
            }
            const customer = client.getCustomer(customerId);
            // ═══ STEP 2: CONVERSION ACTION DISCOVERY ═══
            if (!conversionActionId) {
                logger.info('Conversion action discovery mode', { customerId });
                // Query conversion actions
                const query = `
          SELECT
            conversion_action.id,
            conversion_action.name,
            conversion_action.category,
            conversion_action.status
          FROM conversion_action
          WHERE conversion_action.status != 'REMOVED'
          ORDER BY conversion_action.name
        `;
                const results = await customer.query(query);
                const conversionActions = [];
                for (const row of results) {
                    const action = row.conversion_action;
                    conversionActions.push({
                        id: String(action?.id || ''),
                        name: String(action?.name || ''),
                        category: String(action?.category || ''),
                        status: String(action?.status || ''),
                    });
                }
                if (conversionActions.length === 0) {
                    const guidanceText = `⚠️ NO CONVERSION ACTIONS FOUND

**Account:** ${customerId}

No conversion actions found in this account. You must create a conversion action first before uploading conversions.

**💡 NEXT STEPS:**
1. Create conversion action: use create_conversion_action
2. Then return here to upload offline conversions

**What to do?**
Create a conversion action first.`;
                    return injectGuidance({ customerId }, guidanceText);
                }
                return formatDiscoveryResponse({
                    step: '2/3',
                    title: 'SELECT CONVERSION ACTION',
                    items: conversionActions,
                    itemFormatter: (action, i) => `${i + 1}. ${action.name}
   ID: ${action.id}
   Category: ${action.category}
   Status: ${action.status}`,
                    prompt: 'Which conversion action should receive these offline conversions?',
                    nextParam: 'conversionActionId',
                    context: { customerId },
                    emoji: '📊',
                });
            }
            // ═══ STEP 3: CONVERSION DATA INPUT GUIDANCE ═══
            if (!conversions || conversions.length === 0) {
                const guidanceText = `📝 PROVIDE CONVERSION DATA (Step 3/3)

**Current Context:**
- Account: ${customerId}
- Conversion Action: ${conversionActionId}

**💡 OFFLINE CONVERSION FORMAT:**

**Required Fields:**
- gclid: Google Click ID from the original ad click
- conversionDateTime: When conversion happened (format: "YYYY-MM-DD HH:MM:SS timezone")

**Optional Fields:**
- conversionValue: Revenue in dollars
- currencyCode: Currency (default: USD)

**Example Format:**
\`\`\`json
{
  "conversions": [
    {
      "gclid": "Cj0KCQiA...",
      "conversionDateTime": "2025-10-30 14:30:00 America/New_York",
      "conversionValue": 149.99,
      "currencyCode": "USD"
    },
    {
      "gclid": "Cj0KCQiB...",
      "conversionDateTime": "2025-10-30 16:45:00 America/New_York",
      "conversionValue": 299.99
    }
  ]
}
\`\`\`

**⚠️ IMPORTANT:**
- GCLID must be from actual ad click (starts with "Cj0...")
- Conversion must be within attribution window (typically 30 days)
- DateTime must include timezone
- Max 2,000 conversions per upload

**💡 WHERE TO GET GCLID:**
- Enable auto-tagging in Google Ads
- GCLID appears as URL parameter after ad click
- Store GCLID in your CRM when lead/sale happens
- Match GCLID to offline conversions

**What parameter to provide next?**
- conversions (array of conversion objects)`;
                return injectGuidance({ customerId, conversionActionId }, guidanceText);
            }
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'upload_click_conversions',
                inputText: `upload ${conversions.length} conversions to action ${conversionActionId}`,
                inputParams: { customerId, conversionActionId, conversionCount: conversions.length },
            });
            // Check bulk limit
            if (conversions.length > 2000) {
                throw new Error(`Cannot upload ${conversions.length} conversions at once. Maximum is 2,000. Please batch into smaller uploads.`);
            }
            // Calculate total value
            const totalValue = conversions.reduce((sum, c) => sum + (c.conversionValue || 0), 0);
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('upload_click_conversions', 'Google Ads', customerId);
            // Show sample conversions (first 5)
            const sampleSize = Math.min(5, conversions.length);
            for (let i = 0; i < sampleSize; i++) {
                const conv = conversions[i];
                dryRunBuilder.addChange({
                    resource: 'Click Conversion',
                    resourceId: `conversion_${i + 1}`,
                    field: 'conversion',
                    currentValue: 'N/A (new conversion)',
                    newValue: `GCLID: ${conv.gclid}, Date: ${conv.conversionDateTime}, Value: $${conv.conversionValue || 0}`,
                    changeType: 'create',
                });
            }
            if (conversions.length > sampleSize) {
                dryRunBuilder.addChange({
                    resource: 'Click Conversions',
                    resourceId: 'additional',
                    field: 'additional_conversions',
                    currentValue: 'N/A',
                    newValue: `... and ${conversions.length - sampleSize} more conversions`,
                    changeType: 'create',
                });
            }
            // Add financial impact
            if (totalValue > 0) {
                dryRunBuilder.setFinancialImpact({
                    estimatedNewDailySpend: totalValue,
                    monthlyDifference: totalValue,
                });
            }
            dryRunBuilder.addRecommendation(`Uploading ${conversions.length} conversion(s) with total value $${totalValue.toFixed(2)}`);
            dryRunBuilder.addRecommendation('Verify GCLIDs are valid and within attribution window');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('upload_click_conversions', 'Google Ads', customerId, { conversionActionId, conversions: conversions.length });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Conversion upload requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Uploading click conversions with confirmation', {
                customerId,
                conversionActionId,
                count: conversions.length,
            });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                // Format conversions for API
                const clickConversions = conversions.map((c) => ({
                    gclid: c.gclid,
                    conversion_action: `customers/${customerId}/conversionActions/${conversionActionId}`,
                    conversion_date_time: c.conversionDateTime,
                    conversion_value: c.conversionValue ? c.conversionValue * 1000000 : undefined,
                    currency_code: c.currencyCode || 'USD',
                }));
                // Upload conversions
                const uploadRequest = {
                    customer_id: customerId,
                    conversions: clickConversions,
                    partial_failure: true,
                };
                const response = await customer.conversionUploads.uploadClickConversions(uploadRequest);
                return response;
            });
            return {
                success: true,
                data: {
                    customerId,
                    conversionActionId,
                    conversionsUploaded: conversions.length,
                    totalValue: `$${totalValue.toFixed(2)}`,
                    result,
                    message: `✅ Uploaded ${conversions.length} click conversion(s) with total value $${totalValue.toFixed(2)}`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to upload click conversions', error);
            throw error;
        }
    },
};
/**
 * Upload conversion adjustments
 */
export const uploadConversionAdjustmentsTool = {
    name: 'upload_conversion_adjustments',
    description: `Adjust previously uploaded conversions (update value, retract conversion).

💡 AGENT GUIDANCE - CONVERSION ADJUSTMENTS:

🎯 WHAT THIS DOES:
- Modify conversions after initial upload
- Update conversion value (customer upgraded/downgraded)
- Retract conversions (refunds, cancellations)
- Restate conversions with corrected data

📋 ADJUSTMENT TYPES:
- RETRACTION - Remove conversion (refund, cancellation)
- RESTATEMENT - Update conversion value or time
- ENHANCEMENT - Add additional conversion data

💡 COMMON USE CASES:
- Customer refunded → Retract conversion
- Customer upgraded from $100 to $500 plan → Restate with new value
- Conversion value calculated incorrectly → Restate with correct value
- Duplicate conversion uploaded → Retract duplicate

⚠️ REQUIREMENTS:
- Original conversion must exist (same GCLID + conversion action + time)
- Adjustment must be within 55 days of conversion
- GCLID must match exactly

📊 BEST PRACTICES:
- Upload adjustments promptly for accurate reporting
- Include adjustment type and reason
- Track adjustments in CRM for audit trail
- Verify adjustment succeeded`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            conversionActionId: {
                type: 'string',
                description: 'Conversion action ID',
            },
            adjustments: {
                type: 'array',
                description: 'Array of conversion adjustments',
                items: {
                    type: 'object',
                    properties: {
                        gclid: {
                            type: 'string',
                            description: 'Google Click ID (must match original conversion)',
                        },
                        conversionDateTime: {
                            type: 'string',
                            description: 'Original conversion date/time',
                        },
                        adjustmentType: {
                            type: 'string',
                            enum: ['RETRACTION', 'RESTATEMENT'],
                            description: 'RETRACTION (remove) or RESTATEMENT (update value)',
                        },
                        adjustedValue: {
                            type: 'number',
                            description: 'New conversion value for RESTATEMENT (optional)',
                        },
                        adjustmentDateTime: {
                            type: 'string',
                            description: 'When adjustment occurred (defaults to now)',
                        },
                    },
                    required: ['gclid', 'conversionDateTime', 'adjustmentType'],
                },
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: [], // Make all optional for discovery
    },
    async handler(input) {
        try {
            const { customerId, conversionActionId, adjustments, confirmationToken } = input;
            // Extract OAuth tokens from request
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
            }
            const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
            if (!developerToken) {
                throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
            }
            // Create Google Ads client with user's refresh token
            const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);
            // ═══ STEP 1: ACCOUNT DISCOVERY ═══
            if (!customerId) {
                logger.info('Account discovery mode - listing accessible accounts');
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}\n   Resource: ${a.resourceName}`,
                    prompt: 'Which account?',
                    nextParam: 'customerId',
                    emoji: '🏢',
                });
            }
            const customer = client.getCustomer(customerId);
            // ═══ STEP 2: CONVERSION ACTION DISCOVERY ═══
            if (!conversionActionId) {
                logger.info('Conversion action discovery mode', { customerId });
                const query = `
          SELECT
            conversion_action.id,
            conversion_action.name,
            conversion_action.category,
            conversion_action.status
          FROM conversion_action
          WHERE conversion_action.status != 'REMOVED'
          ORDER BY conversion_action.name
        `;
                const results = await customer.query(query);
                const conversionActions = [];
                for (const row of results) {
                    const action = row.conversion_action;
                    conversionActions.push({
                        id: String(action?.id || ''),
                        name: String(action?.name || ''),
                        category: String(action?.category || ''),
                        status: String(action?.status || ''),
                    });
                }
                if (conversionActions.length === 0) {
                    const guidanceText = `⚠️ NO CONVERSION ACTIONS FOUND

**Account:** ${customerId}

No conversion actions found. Create one first using create_conversion_action.`;
                    return injectGuidance({ customerId }, guidanceText);
                }
                return formatDiscoveryResponse({
                    step: '2/3',
                    title: 'SELECT CONVERSION ACTION TO ADJUST',
                    items: conversionActions,
                    itemFormatter: (action, i) => `${i + 1}. ${action.name}
   ID: ${action.id}
   Category: ${action.category}`,
                    prompt: 'Which conversion action needs adjustments?',
                    nextParam: 'conversionActionId',
                    context: { customerId },
                    emoji: '📊',
                });
            }
            // ═══ STEP 3: ADJUSTMENT TYPE GUIDANCE ═══
            if (!adjustments || adjustments.length === 0) {
                const guidanceText = `📝 PROVIDE ADJUSTMENT DATA (Step 3/3)

**Current Context:**
- Account: ${customerId}
- Conversion Action: ${conversionActionId}

**💡 CONVERSION ADJUSTMENT TYPES:**

**RETRACTION** - Remove conversion
- Use for: Refunds, cancellations, fraud
- Effect: Removes conversion from reporting
- Example: Customer refunded $100 purchase

**RESTATEMENT** - Update conversion value
- Use for: Upgraded/downgraded plans, corrected values
- Effect: Updates conversion value
- Example: Customer upgraded from $50 to $200 plan

**Required Fields:**
- gclid: Must match original conversion
- conversionDateTime: Must match original conversion time
- adjustmentType: "RETRACTION" or "RESTATEMENT"

**Optional Fields (RESTATEMENT only):**
- adjustedValue: New conversion value in dollars

**Example Format:**
\`\`\`json
{
  "adjustments": [
    {
      "gclid": "Cj0KCQiA...",
      "conversionDateTime": "2025-10-20 14:30:00 America/New_York",
      "adjustmentType": "RETRACTION"
    },
    {
      "gclid": "Cj0KCQiB...",
      "conversionDateTime": "2025-10-18 10:15:00 America/New_York",
      "adjustmentType": "RESTATEMENT",
      "adjustedValue": 299.99
    }
  ]
}
\`\`\`

**⚠️ IMPORTANT:**
- GCLID must exactly match original conversion
- DateTime must exactly match original conversion
- Adjustment must be within 55 days of conversion
- Max 2,000 adjustments per upload

**What parameter to provide next?**
- adjustments (array of adjustment objects)`;
                return injectGuidance({ customerId, conversionActionId }, guidanceText);
            }
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'upload_conversion_adjustments',
                inputText: `upload ${adjustments.length} conversion adjustments`,
                inputParams: { customerId, conversionActionId, adjustmentCount: adjustments.length },
            });
            // Check bulk limit
            if (adjustments.length > 2000) {
                throw new Error(`Cannot upload ${adjustments.length} adjustments at once. Maximum is 2,000. Please batch into smaller uploads.`);
            }
            // Count retractions vs restatements
            const retractionCount = adjustments.filter((a) => a.adjustmentType === 'RETRACTION').length;
            const restatementCount = adjustments.length - retractionCount;
            // Calculate total value impact
            const totalValueChange = adjustments
                .filter((a) => a.adjustmentType === 'RESTATEMENT' && a.adjustedValue)
                .reduce((sum, a) => sum + (a.adjustedValue || 0), 0);
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('upload_conversion_adjustments', 'Google Ads', customerId);
            // Show sample adjustments (first 5)
            const sampleSize = Math.min(5, adjustments.length);
            for (let i = 0; i < sampleSize; i++) {
                const adj = adjustments[i];
                dryRunBuilder.addChange({
                    resource: 'Conversion Adjustment',
                    resourceId: `adjustment_${i + 1}`,
                    field: 'adjustment',
                    currentValue: 'Original conversion',
                    newValue: `${adj.adjustmentType}: GCLID ${adj.gclid}${adj.adjustedValue ? `, New Value: $${adj.adjustedValue}` : ''}`,
                    changeType: 'update',
                });
            }
            if (adjustments.length > sampleSize) {
                dryRunBuilder.addChange({
                    resource: 'Conversion Adjustments',
                    resourceId: 'additional',
                    field: 'additional_adjustments',
                    currentValue: 'N/A',
                    newValue: `... and ${adjustments.length - sampleSize} more adjustments`,
                    changeType: 'update',
                });
            }
            dryRunBuilder.addRecommendation(`${retractionCount} retraction(s), ${restatementCount} restatement(s)`);
            if (retractionCount > 0) {
                dryRunBuilder.addRisk(`${retractionCount} conversion(s) will be removed (affects conversion reporting)`);
            }
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('upload_conversion_adjustments', 'Google Ads', customerId, { conversionActionId, adjustments: adjustments.length });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Conversion adjustments require approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Uploading conversion adjustments with confirmation', {
                customerId,
                count: adjustments.length,
            });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                // Format adjustments for API
                const conversionAdjustments = adjustments.map((a) => ({
                    gclid_date_time_pair: {
                        gclid: a.gclid,
                        conversion_date_time: a.conversionDateTime,
                    },
                    conversion_action: `customers/${customerId}/conversionActions/${conversionActionId}`,
                    adjustment_type: a.adjustmentType,
                    adjustment_date_time: a.adjustmentDateTime || new Date().toISOString().replace('T', ' ').slice(0, 19),
                    restatement_value: a.adjustedValue && a.adjustmentType === 'RESTATEMENT'
                        ? {
                            adjusted_value: a.adjustedValue * 1000000,
                            currency_code: 'USD',
                        }
                        : undefined,
                }));
                const uploadRequest = {
                    customer_id: customerId,
                    conversion_adjustments: conversionAdjustments,
                    partial_failure: true,
                };
                const response = await customer.conversionAdjustmentUploads.uploadConversionAdjustments(uploadRequest);
                return response;
            });
            return {
                success: true,
                data: {
                    customerId,
                    conversionActionId,
                    adjustmentsUploaded: adjustments.length,
                    retractions: retractionCount,
                    restatements: restatementCount,
                    totalValueChange: `$${totalValueChange.toFixed(2)}`,
                    result,
                    message: `✅ Uploaded ${adjustments.length} conversion adjustment(s): ${retractionCount} retraction(s), ${restatementCount} restatement(s)`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to upload conversion adjustments', error);
            throw error;
        }
    },
};
/**
 * Get conversion action
 */
export const getConversionActionTool = {
    name: 'get_conversion_action',
    description: 'Get details of a specific conversion action.',
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            conversionActionId: {
                type: 'string',
                description: 'Conversion action ID',
            },
        },
        required: [],
    },
    async handler(input) {
        try {
            // Extract OAuth tokens from request
            const refreshToken = extractRefreshToken(input);
            if (!refreshToken) {
                throw new Error('Refresh token required for Google Ads API. OMA must provide X-Google-Refresh-Token header.');
            }
            const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
            if (!developerToken) {
                throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
            }
            // Create Google Ads client with user's refresh token
            const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);
            // Account discovery
            if (!input.customerId) {
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: extractCustomerId(rn),
                }));
                return formatDiscoveryResponse({
                    step: '1/3',
                    title: 'SELECT GOOGLE ADS ACCOUNT',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
                    prompt: 'Which account contains the conversion action?',
                    nextParam: 'customerId',
                });
            }
            // Conversion action discovery
            if (!input.conversionActionId) {
                const customer = client.getCustomer(input.customerId);
                const query = `
          SELECT
            conversion_action.id,
            conversion_action.name,
            conversion_action.category,
            conversion_action.status
          FROM conversion_action
          WHERE conversion_action.status != 'REMOVED'
          ORDER BY conversion_action.name
        `;
                const results = await customer.query(query);
                const actions = [];
                for (const row of results) {
                    const action = row.conversion_action;
                    actions.push({
                        id: String(action?.id || ''),
                        name: String(action?.name || ''),
                        category: String(action?.category || ''),
                    });
                }
                return formatDiscoveryResponse({
                    step: '2/3',
                    title: 'SELECT CONVERSION ACTION',
                    items: actions,
                    itemFormatter: (a, i) => `${i + 1}. ${a.name} (${a.category}) - ID: ${a.id}`,
                    prompt: 'Which conversion action would you like details for?',
                    nextParam: 'conversionActionId',
                    context: { customerId: input.customerId },
                });
            }
            const { customerId, conversionActionId } = input;
            const customer = client.getCustomer(customerId);
            logger.info('Getting conversion action', { customerId, conversionActionId });
            const query = `
        SELECT
          conversion_action.id,
          conversion_action.name,
          conversion_action.category,
          conversion_action.status,
          conversion_action.type,
          conversion_action.counting_type,
          conversion_action.click_through_lookback_window_days,
          conversion_action.view_through_lookback_window_days,
          conversion_action.value_settings.default_value,
          conversion_action.value_settings.always_use_default_value,
          conversion_action.tag_snippets
        FROM conversion_action
        WHERE conversion_action.id = ${conversionActionId}
      `;
            const results = await customer.query(query);
            let conversionAction = null;
            for (const row of results) {
                const action = row.conversion_action;
                conversionAction = {
                    id: String(action?.id || ''),
                    name: String(action?.name || ''),
                    category: String(action?.category || ''),
                    status: String(action?.status || ''),
                    type: String(action?.type || ''),
                    countingType: String(action?.counting_type || ''),
                    clickThroughWindow: parseInt(String(action?.click_through_lookback_window_days || 30)),
                    viewThroughWindow: parseInt(String(action?.view_through_lookback_window_days || 1)),
                    defaultValue: action?.value_settings?.default_value
                        ? parseFloat(String(action.value_settings.default_value)) / 1000000
                        : undefined,
                    alwaysUseDefaultValue: action?.value_settings?.always_use_default_value || false,
                    tagSnippets: action?.tag_snippets || [],
                };
            }
            if (!conversionAction) {
                throw new Error(`Conversion action ${conversionActionId} not found`);
            }
            // Inject rich guidance into response
            const guidanceText = `📊 CONVERSION ACTION DETAILS

**Name:** ${conversionAction.name}
**ID:** ${conversionAction.id}
**Category:** ${conversionAction.category}
**Status:** ${conversionAction.status}

📋 CONFIGURATION:
• **Type:** ${conversionAction.type}
• **Counting Method:** ${conversionAction.countingType} ${conversionAction.countingType === 'ONE' ? '(once per click - recommended for purchases)' : '(every occurrence - recommended for page views)'}
• **Click-Through Attribution Window:** ${conversionAction.clickThroughWindow} days
• **View-Through Attribution Window:** ${conversionAction.viewThroughWindow} day(s)

💰 VALUE SETTINGS:
${conversionAction.defaultValue ? `• Fixed Value: ${formatCurrency(conversionAction.defaultValue)}${conversionAction.alwaysUseDefaultValue ? ' (always use this value)' : ' (use when no transaction value provided)'}` : '• No default value set (uses transaction-specific values)'}

📝 TRACKING TAG:
${conversionAction.tagSnippets.length > 0 ? '✅ Tracking tag available' : '⚠️  No tracking tag generated yet'}

💡 WHAT THIS MEANS:

**Category: ${conversionAction.category}**
${conversionAction.category === 'PURCHASE' ? '- E-commerce transaction tracking\n- Use transaction-specific values for revenue\n- Count "ONE" prevents duplicate conversions' : ''}
${conversionAction.category === 'LEAD' ? '- Form submission or signup tracking\n- Consider assigning fixed value based on lead quality\n- Use for ROI optimization' : ''}
${conversionAction.category === 'PAGE_VIEW' ? '- Page visit tracking\n- Count "MANY" recommended\n- Useful for engagement measurement' : ''}

**Attribution Window: ${conversionAction.clickThroughWindow} days**
- Conversions within ${conversionAction.clickThroughWindow} days of click are attributed to ads
- Shorter window = more conservative attribution
- Longer window = credits more conversions (up to 90 days)

${formatNextSteps([
                'Modify settings: use update_conversion_action',
                'Upload offline conversions: use upload_click_conversions',
                'Create new conversion: use create_conversion_action',
                'List all conversions: use list_conversion_actions'
            ])}`;
            return injectGuidance({
                customerId,
                conversionAction,
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to get conversion action', error);
            throw error;
        }
    },
};
/**
 * Export conversion tools
 */
export const conversionTools = [
    listConversionActionsTool,
    getConversionActionTool,
    createConversionActionTool,
    uploadClickConversionsTool,
    uploadConversionAdjustmentsTool,
];
//# sourceMappingURL=conversions.js.map