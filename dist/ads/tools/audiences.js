/**
 * MCP Tools for Google Ads Audience & Targeting
 * Includes: UserListService, AudienceService, CustomerMatchService
 */
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';
import { extractRefreshToken } from '../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../client.js';
import { formatDiscoveryResponse, injectGuidance, formatNextSteps, formatNumber } from '../../shared/interactive-workflow.js';
import { extractCustomerId } from '../validation.js';
const logger = getLogger('ads.tools.audiences');
/**
 * List user lists (remarketing audiences)
 */
export const listUserListsTool = {
    name: 'list_user_lists',
    description: 'List all remarketing lists and audiences in Google Ads account.',
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
                    prompt: 'Which account would you like to list remarketing lists for?',
                    nextParam: 'customerId',
                });
            }
            const { customerId } = input;
            const customer = client.getCustomer(customerId);
            logger.info('Listing user lists', { customerId });
            const query = `
        SELECT
          user_list.id,
          user_list.name,
          user_list.type,
          user_list.size_for_display,
          user_list.size_for_search,
          user_list.membership_life_span,
          user_list.status,
          user_list.match_rate_percentage
        FROM user_list
        WHERE user_list.status != 'REMOVED'
        ORDER BY user_list.name
      `;
            const results = await customer.query(query);
            const userLists = [];
            for (const row of results) {
                const list = row.user_list;
                userLists.push({
                    id: String(list?.id || ''),
                    name: String(list?.name || ''),
                    type: String(list?.type || ''),
                    sizeForDisplay: parseInt(String(list?.size_for_display || 0)),
                    sizeForSearch: parseInt(String(list?.size_for_search || 0)),
                    membershipDays: parseInt(String(list?.membership_life_span || 30)),
                    matchRate: list?.match_rate_percentage
                        ? parseFloat(String(list.match_rate_percentage))
                        : undefined,
                });
            }
            // Calculate summary stats
            const byType = userLists.reduce((acc, l) => {
                acc[l.type] = (acc[l.type] || 0) + 1;
                return acc;
            }, {});
            const totalDisplay = userLists.reduce((sum, l) => sum + l.sizeForDisplay, 0);
            const totalSearch = userLists.reduce((sum, l) => sum + l.sizeForSearch, 0);
            const avgMatchRate = userLists.filter(l => l.matchRate).length > 0
                ? userLists.filter(l => l.matchRate).reduce((sum, l) => sum + (l.matchRate || 0), 0) / userLists.filter(l => l.matchRate).length
                : 0;
            // Inject rich guidance into response
            const guidanceText = `📊 REMARKETING LISTS (USER LISTS)

**Account:** ${customerId}
**Total Lists:** ${userLists.length}

📋 LIST BREAKDOWN:
${Object.entries(byType).map(([type, count]) => `• ${type}: ${count} list(s)`).join('\n')}

📈 AUDIENCE SUMMARY:
• Total Users (Display Network): ${formatNumber(totalDisplay)}
• Total Users (Search Network): ${formatNumber(totalSearch)}
• Average Match Rate: ${avgMatchRate.toFixed(1)}%

🎯 USER LISTS IN THIS ACCOUNT:
${userLists.slice(0, 10).map((l, i) => `${i + 1}. ${l.name} (${l.type})
   • ID: ${l.id}
   • Size: ${formatNumber(l.sizeForDisplay)} (Display), ${formatNumber(l.sizeForSearch)} (Search)
   • Membership: ${l.membershipDays} days${l.matchRate ? `\n   • Match Rate: ${l.matchRate.toFixed(1)}%` : ''}`).join('\n\n')}${userLists.length > 10 ? `\n\n... and ${userLists.length - 10} more` : ''}

💡 USER LIST TYPES EXPLAINED:
- **RULE_BASED:** Users who match URL/action rules (website visitors)
- **CRM_BASED:** Uploaded customer lists (email/phone)
- **LOGICAL:** Combination of other lists (AND/OR/NOT logic)
- **SIMILAR:** Lookalike audiences (Google finds similar users)

🎯 REMARKETING BEST PRACTICES:
✅ **For Display:** Need 100+ users to serve ads
✅ **For Search:** Need 1,000+ users to serve ads
⏱️ **Membership Duration:** 7-30 days for recent visitors, 90-180 days for converters
📊 **Match Rate:** 30-60% typical for emails, 20-40% for phones

${userLists.some(l => l.sizeForDisplay < 100) ? `⚠️  Some lists below minimum size (100 users for Display)` : '✅ All lists meet minimum size requirements'}
${userLists.some(l => l.sizeForSearch < 1000) ? `⚠️  Some lists below minimum size (1,000 users for Search)` : ''}

${formatNextSteps([
                'Create new remarketing list: use create_user_list',
                'Upload customer data: use upload_customer_match_list',
                'Target these lists in campaigns: use create_campaign or update_campaign',
                'Exclude converters from acquisition campaigns: add as negative audiences'
            ])}`;
            return injectGuidance({
                customerId,
                userLists,
                count: userLists.length,
                byType,
                totalDisplay,
                totalSearch,
                avgMatchRate: avgMatchRate.toFixed(1),
            }, guidanceText);
        }
        catch (error) {
            logger.error('Failed to list user lists', error);
            throw error;
        }
    },
};
/**
 * Create remarketing user list
 */
export const createUserListTool = {
    name: 'create_user_list',
    description: `Create a new remarketing list for targeting past website visitors.

💡 AGENT GUIDANCE - CREATE REMARKETING LISTS:

🎯 WHAT THIS DOES:
- Creates a new remarketing list
- Defines rules for who gets added (URL visited, actions taken)
- Sets membership duration (how long users stay in list)
- Enables remarketing campaigns to past visitors

📋 LIST TYPES:
- RULE_BASED - Users who match URL/action rules
- CRM_BASED - Uploaded customer lists (email/phone)
- LOGICAL - Combination of other lists

⏱️ MEMBERSHIP DURATION:
- Default: 30 days
- Range: 1-540 days
- Shorter = more recent visitors
- Longer = larger list but less relevant

💡 COMMON USE CASES:
- All website visitors (30 days)
- Cart abandoners (7 days)
- Product viewers who didn't purchase (14 days)
- Converters - for exclusion (90 days)

⚠️ REQUIREMENTS:
- Remarketing tag must be installed on website
- List needs 1,000+ users for Display, 100+ for Search
- Rules must be properly formatted`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            name: {
                type: 'string',
                description: 'User list name (e.g., "Cart Abandoners - 7 Days")',
            },
            membershipDays: {
                type: 'number',
                description: 'How long users stay in list (1-540 days, default: 30)',
            },
            description: {
                type: 'string',
                description: 'List description (optional)',
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
            const { customerId, name, membershipDays = 30, description, confirmationToken } = input;
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
                    prompt: 'Which account should have this user list?',
                    nextParam: 'customerId',
                    emoji: '🏢',
                });
            }
            const customer = client.getCustomer(customerId);
            // ═══ STEP 2: LIST NAME INPUT ═══
            if (!name) {
                const guidanceText = `📝 NAME YOUR USER LIST (Step 2/3)

**Current Context:**
- Account: ${customerId}

**💡 USER LIST NAMING BEST PRACTICES:**

**Common Naming Patterns:**
- "All Website Visitors - 30 Days"
- "Cart Abandoners - 7 Days"
- "Product Viewers - 14 Days"
- "Past Customers - 90 Days"
- "Newsletter Subscribers"
- "High-Value Customers (>$500)"

**Naming Tips:**
- Include behavior/segment description
- Include membership duration
- Make it descriptive for reporting
- Use consistent naming convention

**Examples by Use Case:**
- Remarketing: "Site Visitors - Last 30 Days"
- Exclusion: "Converters - Last 90 Days (Exclude)"
- Upsell: "Low-Tier Customers - Active"
- Re-engagement: "Lapsed Customers - 180+ Days"

**What parameter to provide next?**
- name (string, descriptive name)`;
                return injectGuidance({ customerId }, guidanceText);
            }
            // ═══ STEP 3: MEMBERSHIP DURATION GUIDANCE ═══
            if (!membershipDays) {
                const durations = [
                    { days: 7, desc: 'Very recent visitors (small, highly relevant)' },
                    { days: 14, desc: 'Recent visitors (good for cart abandonment)' },
                    { days: 30, desc: 'Standard duration (recommended for most)' },
                    { days: 60, desc: 'Extended reach (larger audience)' },
                    { days: 90, desc: 'Long-term visitors (maximum relevance window)' },
                    { days: 180, desc: 'Very long-term (for customer retention)' },
                    { days: 540, desc: 'Maximum allowed (1.5 years)' },
                ];
                return formatDiscoveryResponse({
                    step: '3/3',
                    title: 'SELECT MEMBERSHIP DURATION',
                    items: durations,
                    itemFormatter: (d, i) => `${i + 1}. ${d.days} days
   ${d.desc}`,
                    prompt: 'How long should users stay in this list?',
                    nextParam: 'membershipDays',
                    context: { customerId, name },
                    emoji: '⏱️',
                });
            }
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'create_user_list',
                inputText: `create user list ${name}`,
                inputParams: { customerId, name },
            });
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_user_list', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'User List',
                resourceId: 'new',
                field: 'user_list',
                currentValue: 'N/A (new list)',
                newValue: `"${name}" (${membershipDays} day membership)`,
                changeType: 'create',
            });
            dryRunBuilder.addRecommendation('Remarketing tag must be installed on website to populate this list');
            dryRunBuilder.addRecommendation('List needs 1,000+ users for Display Network, 100+ for Search');
            if (membershipDays < 7) {
                dryRunBuilder.addRecommendation(`Short membership duration (${membershipDays} days) - list will be small but very recent`);
            }
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_user_list', 'Google Ads', customerId, { name });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'User list creation requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Creating user list with confirmation', { customerId, name });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const userList = {
                    name,
                    membership_life_span: membershipDays,
                    description: description || '',
                    membership_status: 'OPEN',
                };
                const operation = {
                    create: userList,
                };
                const response = await customer.userLists.create([operation]);
                return response;
            });
            return {
                success: true,
                data: {
                    customerId,
                    userListId: result,
                    name,
                    membershipDays,
                    message: `✅ User list "${name}" created successfully`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create user list', error);
            throw error;
        }
    },
};
/**
 * Upload customer match list
 */
export const uploadCustomerMatchListTool = {
    name: 'upload_customer_match_list',
    description: `Upload customer email/phone list for Customer Match targeting.

💡 AGENT GUIDANCE - CUSTOMER MATCH:

🎯 WHAT THIS DOES:
- Upload your customer data (emails, phones, addresses)
- Google matches to signed-in users
- Target or exclude your customers in campaigns
- First-party data targeting (privacy-safe)

📋 DATA YOU CAN UPLOAD:
- Email addresses (most common)
- Phone numbers (with country code)
- First name + Last name + ZIP + Country
- Mobile Advertiser IDs

🔒 PRIVACY & SECURITY:
- Data is hashed before upload (SHA-256)
- Google never sees raw emails/phones
- Only matched users see ads
- Complies with privacy regulations

💡 COMMON USE CASES:
- Target existing customers with special offers
- Exclude customers from acquisition campaigns
- Create lookalike audiences from best customers
- Re-engage lapsed customers

⚠️ REQUIREMENTS:
- Account must have Customer Match eligibility
- List needs 1,000+ users for Display
- Data must be hashed (SHA-256)
- Policy compliance required

📊 MATCH RATES:
- Email: typically 30-60% match rate
- Phone: typically 20-40% match rate
- Combined data: higher match rates

🎯 BEST PRACTICES:
- Upload fresh customer data (last 30-90 days)
- Include as many data points as possible for better matching
- Create separate lists for: active customers, lapsed, high-value
- Update lists monthly`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            userListId: {
                type: 'string',
                description: 'User list ID (must be CRM_BASED type)',
            },
            customers: {
                type: 'array',
                description: 'Array of customer data (will be hashed automatically)',
                items: {
                    type: 'object',
                    properties: {
                        hashedEmail: {
                            type: 'string',
                            description: 'SHA-256 hashed email (normalized: lowercase, trimmed)',
                        },
                        hashedPhoneNumber: {
                            type: 'string',
                            description: 'SHA-256 hashed phone with country code (E.164 format)',
                        },
                    },
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
            const { customerId, userListId, customers, confirmationToken } = input;
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
            // ═══ STEP 2: USER LIST DISCOVERY ═══
            if (!userListId) {
                logger.info('User list discovery mode', { customerId });
                const query = `
          SELECT
            user_list.id,
            user_list.name,
            user_list.type,
            user_list.size_for_display,
            user_list.membership_life_span
          FROM user_list
          WHERE user_list.status != 'REMOVED'
          ORDER BY user_list.name
        `;
                const results = await customer.query(query);
                const userLists = [];
                for (const row of results) {
                    const list = row.user_list;
                    userLists.push({
                        id: String(list?.id || ''),
                        name: String(list?.name || ''),
                        type: String(list?.type || ''),
                        size: parseInt(String(list?.size_for_display || 0)),
                        membershipDays: parseInt(String(list?.membership_life_span || 30)),
                    });
                }
                if (userLists.length === 0) {
                    const guidanceText = `⚠️ NO USER LISTS FOUND

**Account:** ${customerId}

No user lists found. Create one first using create_user_list.

**💡 NEXT STEPS:**
1. Create user list: use create_user_list
2. Return here to upload customer data`;
                    return injectGuidance({ customerId }, guidanceText);
                }
                // Filter to CRM_BASED lists only (Customer Match requires CRM_BASED type)
                const crmLists = userLists.filter(l => l.type === 'CRM_BASED');
                if (crmLists.length === 0) {
                    const guidanceText = `⚠️ NO CRM-BASED LISTS FOUND

**Account:** ${customerId}

Found ${userLists.length} user list(s), but none are CRM_BASED type.

Customer Match requires CRM_BASED user lists. The existing lists are for website remarketing.

**💡 NEXT STEPS:**
1. Create CRM-based list: use create_user_list
2. Ensure it's configured for Customer Match
3. Return here to upload customer data`;
                    return injectGuidance({ customerId }, guidanceText);
                }
                return formatDiscoveryResponse({
                    step: '2/3',
                    title: 'SELECT CRM-BASED USER LIST',
                    items: crmLists,
                    itemFormatter: (list, i) => `${i + 1}. ${list.name}
   ID: ${list.id}
   Size: ${formatNumber(list.size)} users
   Membership: ${list.membershipDays} days`,
                    prompt: 'Which list should receive customer data?',
                    nextParam: 'userListId',
                    context: { customerId },
                    emoji: '📊',
                });
            }
            // ═══ STEP 3: CUSTOMER DATA FORMAT GUIDANCE ═══
            if (!customers || customers.length === 0) {
                const guidanceText = `📝 PROVIDE CUSTOMER DATA (Step 3/3)

**Current Context:**
- Account: ${customerId}
- User List: ${userListId}

**💡 CUSTOMER MATCH DATA FORMAT:**

**⚠️ PRIVACY & HASHING:**
All customer data must be hashed with SHA-256 before upload. Google never sees raw emails/phones.

**Required Format:**
\`\`\`json
{
  "customers": [
    {
      "hashedEmail": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
      "hashedPhoneNumber": "8846dcf6f44b8bcf7e9db59a4a1b1e97c0f9b41be0e44b9ad1ca9cd715fc2c6e"
    },
    {
      "hashedEmail": "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"
    }
  ]
}
\`\`\`

**Normalization Rules (BEFORE hashing):**

**Email:**
1. Convert to lowercase
2. Trim whitespace
3. Remove dots from Gmail addresses (optional)
4. Hash with SHA-256

**Phone:**
1. Convert to E.164 format: +[country][number]
2. Example: +12025551234 (US), +442071234567 (UK)
3. Remove spaces, dashes, parentheses
4. Hash with SHA-256

**JavaScript Example:**
\`\`\`javascript
const crypto = require('crypto');

// Hash email
const email = 'John.Smith@gmail.com';
const normalized = email.toLowerCase().trim();
const hashedEmail = crypto.createHash('sha256').update(normalized).digest('hex');

// Hash phone
const phone = '+12025551234';
const hashedPhone = crypto.createHash('sha256').update(phone).digest('hex');
\`\`\`

**⚠️ IMPORTANT:**
- Data must be hashed BEFORE sending to API
- Match rate: 30-60% typical for emails
- Match rate: 20-40% typical for phones
- Min 1,000 users recommended for Display
- Max 100,000 customers per upload
- Must have user consent for advertising

**Privacy Compliance:**
- ✅ Ensure GDPR/CCPA compliance
- ✅ Have user consent for advertising
- ✅ Follow Google's Customer Match policies

**What parameter to provide next?**
- customers (array of {hashedEmail, hashedPhoneNumber} objects)`;
                return injectGuidance({ customerId, userListId }, guidanceText);
            }
            // Vagueness detection
            detectAndEnforceVagueness({
                operation: 'upload_customer_match_list',
                inputText: `upload ${customers.length} customers to list ${userListId}`,
                inputParams: { customerId, userListId, customerCount: customers.length },
            });
            // Check bulk limit
            if (customers.length > 100000) {
                throw new Error(`Cannot upload ${customers.length} customers at once. Maximum is 100,000. Please batch into smaller uploads.`);
            }
            // Build dry-run preview
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('upload_customer_match_list', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Customer Match List',
                resourceId: userListId,
                field: 'customer_data',
                currentValue: 'Current list',
                newValue: `+${customers.length} customer record(s)`,
                changeType: 'update',
            });
            dryRunBuilder.addRecommendation(`Uploading ${customers.length} customer record(s) - data will be hashed before upload`);
            dryRunBuilder.addRecommendation('Typical match rate: 30-60% for emails, 20-40% for phones');
            dryRunBuilder.addRisk('⚠️ PRIVACY: Ensure you have consent to use customer data for advertising');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('upload_customer_match_list', 'Google Ads', customerId, { userListId, customers: customers.length });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Customer Match upload requires approval. Review privacy compliance and call this tool again with the confirmationToken to proceed.',
                };
            }
            // Execute with confirmation
            logger.info('Uploading Customer Match data with confirmation', {
                customerId,
                userListId,
                count: customers.length,
            });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                // Build offline user data jobs
                const operations = customers.map((c) => ({
                    create: {
                        hashed_email: c.hashedEmail,
                        hashed_phone_number: c.hashedPhoneNumber,
                    },
                }));
                const addRequest = {
                    resource_name: `customers/${customerId}/userLists/${userListId}`,
                    operations,
                };
                const response = await customer.offlineUserDataJobs.createOfflineUserDataJob(addRequest);
                return response;
            });
            return {
                success: true,
                data: {
                    customerId,
                    userListId,
                    customersUploaded: customers.length,
                    result,
                    message: `✅ Uploaded ${customers.length} customer record(s) to Customer Match list`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to upload Customer Match list', error);
            throw error;
        }
    },
};
/**
 * Create audience (Google Ads audience segment)
 */
export const createAudienceTool = {
    name: 'create_audience',
    description: `Create a new audience segment for targeting.

💡 AGENT GUIDANCE - AUDIENCES:

🎯 WHAT THIS DOES:
- Create audience segments for campaign targeting
- Define audience based on demographics, interests, behaviors
- Use for targeting or exclusion in campaigns

📋 AUDIENCE TYPES:
- AFFINITY - Based on interests and habits
- IN_MARKET - Actively researching/shopping for products
- CUSTOM_INTENT - Based on URLs and apps
- LIFE_EVENT - Major life changes (moving, marriage, etc.)

💡 USE CASES:
- Target in-market shoppers for specific products
- Reach users interested in your industry
- Exclude existing customers from acquisition campaigns`,
    inputSchema: {
        type: 'object',
        properties: {
            customerId: {
                type: 'string',
                description: 'Customer ID (10 digits)',
            },
            name: {
                type: 'string',
                description: 'Audience name',
            },
            description: {
                type: 'string',
                description: 'Audience description',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (optional - if not provided, will show preview)',
            },
        },
        required: ['customerId', 'name'],
    },
    async handler(input) {
        try {
            const { customerId, name, description, confirmationToken } = input;
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
            // STEP 1/4: Account discovery
            if (!customerId) {
                logger.info('Discovery: listing accessible accounts for audience creation');
                const resourceNames = await client.listAccessibleAccounts();
                const accounts = resourceNames.map((rn) => ({
                    resourceName: rn,
                    customerId: extractCustomerId(rn),
                }));
                if (accounts.length === 0) {
                    throw new Error('No accessible Google Ads accounts found');
                }
                return formatDiscoveryResponse({
                    step: '1/4',
                    title: 'SELECT ACCOUNT',
                    emoji: '👥',
                    items: accounts,
                    itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}\n   Resource: ${a.resourceName}`,
                    prompt: 'Which account should this audience be created in?',
                    nextParam: 'customerId'
                });
            }
            // STEP 2/4: Audience name
            if (!name) {
                return injectGuidance({}, `👥 AUDIENCE NAME (Step 2/4)

**Account:** ${customerId}

Enter a descriptive audience name.

💡 **NAMING TIPS:**
   • Be specific: "In-Market Shoppers - Electronics"
   • Include targeting criteria for clarity
   • Use consistent naming across campaigns

📋 **EXAMPLE NAMES:**
   • "Website Visitors - Last 30 Days"
   • "High-Intent Shoppers - Abandoned Cart"
   • "Customers - Exclude from Acquisition"
   • "In-Market - Home Improvement"

What should this audience be named?`);
            }
            // STEP 3/4: Description (optional but recommended)
            if (!description) {
                return injectGuidance({}, `📝 AUDIENCE DESCRIPTION (Step 3/4)

**Account:** ${customerId}
**Name:** ${name}

Enter a description for this audience (optional but recommended).

💡 **DESCRIPTION TIPS:**
   • Explain targeting criteria
   • Note intended use (targeting vs exclusion)
   • Include any special considerations

📋 **EXAMPLE DESCRIPTIONS:**
   • "Users who visited product pages in last 30 days"
   • "Active shoppers researching electronics - for remarketing campaigns"
   • "Existing customers - exclude from acquisition to avoid wasted spend"
   • "In-market audience for targeting home improvement shoppers"

You can skip this by providing an empty string, or enter a description:`);
            }
            const customer = client.getCustomer(customerId);
            detectAndEnforceVagueness({
                operation: 'create_audience',
                inputText: `create audience ${name}`,
                inputParams: { customerId, name },
            });
            // STEP 4/4: Dry-run approval (existing logic)
            const approvalEnforcer = getApprovalEnforcer();
            const dryRunBuilder = new DryRunResultBuilder('create_audience', 'Google Ads', customerId);
            dryRunBuilder.addChange({
                resource: 'Audience',
                resourceId: 'new',
                field: 'audience',
                currentValue: 'N/A (new audience)',
                newValue: `"${name}"${description ? ` - ${description}` : ''}`,
                changeType: 'create',
            });
            dryRunBuilder.addRecommendation('Configure audience rules and targeting criteria after creation');
            dryRunBuilder.addRecommendation('Audience must be associated with campaigns to be used for targeting');
            const dryRun = dryRunBuilder.build();
            if (!confirmationToken) {
                const { confirmationToken: token } = await approvalEnforcer.createDryRun('create_audience', 'Google Ads', customerId, { name });
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);
                return {
                    success: true,
                    requiresApproval: true,
                    preview: `👥 AUDIENCE CREATION - REVIEW & CONFIRM (Step 4/4)

${preview}

✅ Ready to create this audience? Call this tool again with the confirmationToken to proceed.`,
                    confirmationToken: token,
                    message: 'Audience creation requires approval. Review the preview and call again with confirmationToken.',
                };
            }
            logger.info('Creating audience with confirmation', { customerId, name });
            const result = await approvalEnforcer.validateAndExecute(confirmationToken, dryRun, async () => {
                const audience = {
                    name,
                    description: description || '',
                };
                const operation = { create: audience };
                const response = await customer.audiences.create([operation]);
                return response;
            });
            const successMessage = `✅ AUDIENCE CREATED SUCCESSFULLY

**Audience Details:**
   • Name: ${name}
   • Description: ${description || '(none)'}
   • Audience ID: ${result}
   • Account: ${customerId}

🎯 NEXT STEPS:

1. **Configure Targeting Rules:**
   Define who should be included in this audience based on:
   • Demographics (age, gender, location)
   • Interests and behaviors
   • In-market signals
   • Custom intent URLs/apps

2. **Associate with Campaigns:**
   Add this audience to campaigns for targeting or observation:
   • Target specific demographics
   • Layer on top of keyword targeting
   • Use as observation to gather insights

3. **Monitor Performance:**
   Track audience performance to optimize targeting and bids

💡 **COMMON WORKFLOWS:**
   • Create multiple audiences for A/B testing
   • Use audiences for exclusion (avoid existing customers)
   • Build lookalike audiences from converters
   • Layer audiences for more precise targeting

The audience is now ready to be used in your campaigns!`;
            return injectGuidance({
                customerId,
                audienceId: result,
                name,
                description,
            }, successMessage);
        }
        catch (error) {
            logger.error('Failed to create audience', error);
            throw error;
        }
    },
};
/**
 * Export audience tools
 */
export const audienceTools = [
    listUserListsTool,
    createUserListTool,
    uploadCustomerMatchListTool,
    createAudienceTool,
];
//# sourceMappingURL=audiences.js.map