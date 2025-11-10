/**
 * Create Client Account Tool
 * Creates a new Google Ads client account under a manager account
 */
import { getGoogleAdsClient } from '../../client-factory.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../../shared/approval-enforcer.js';
import { getLogger } from '../../../shared/logger.js';
const logger = getLogger('ads.tools.accounts.create-client');
export const createClientAccountTool = {
    name: 'create_client_account',
    description: `Create a new Google Ads client account under a manager account.

**Account Hierarchy:**
Manager Account (MCC) → Can't have campaigns
  └── Client Account → CAN have campaigns, ad groups, ads, keywords

**Use Case:**
- Set up new client accounts for different brands, regions, or business units
- Required before creating any campaigns (campaigns must be in client accounts)
- Practitioners managing multiple clients need separate client accounts

**Required Information:**
- Manager Customer ID: The manager account that will own this client
- Account Name: Descriptive name (e.g., "Dell Canada - English")
- Currency: Cannot be changed after creation (e.g., USD, EUR, CAD)
- Timezone: Cannot be changed after creation (e.g., America/New_York)

**Important:**
- Currency and timezone are permanent - choose carefully
- This is a WRITE operation requiring approval
- You'll see a preview before the account is created`,
    inputSchema: {
        type: 'object',
        properties: {
            managerCustomerId: {
                type: 'string',
                description: 'Manager account customer ID (without hyphens, e.g., "6625745756")',
            },
            descriptiveName: {
                type: 'string',
                description: 'Descriptive name for the new client account (e.g., "Dell Canada - English Campaigns")',
            },
            currencyCode: {
                type: 'string',
                description: 'Currency code (ISO 4217, e.g., "USD", "CAD", "EUR") - CANNOT be changed later',
            },
            timeZone: {
                type: 'string',
                description: 'Timezone (IANA format, e.g., "America/New_York", "America/Toronto") - CANNOT be changed later',
            },
            confirmationToken: {
                type: 'string',
                description: 'Confirmation token from dry-run preview (only provide after reviewing preview)',
            },
        },
        required: [], // All params discovered interactively
    },
    handler: async (args) => {
        try {
            const adsClient = await getGoogleAdsClient();
            const approvalEnforcer = getApprovalEnforcer();
            // Interactive parameter discovery
            if (!args.managerCustomerId) {
                const accounts = await adsClient.listAccessibleAccounts();
                const accountIds = accounts.map((r) => r.replace('customers/', ''));
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🏢 SELECT MANAGER ACCOUNT (Step 1/4)

You have access to ${accountIds.length} Google Ads accounts:

${accountIds.map((id, i) => `${i + 1}. Customer ID: ${id}`).join('\n')}

**Which account is your MANAGER account?**

💡 Manager accounts (MCCs) can create client accounts.
   Client accounts cannot create other accounts.

**Next:** Provide managerCustomerId parameter`,
                        },
                    ],
                };
            }
            if (!args.descriptiveName) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📝 ACCOUNT NAME (Step 2/4)

What should we name this client account?

**Examples:**
- "Dell Canada - English Campaigns"
- "Acme Corp - Brand Campaigns"
- "Client X - Performance Marketing"

**Tips:**
- Use clear, descriptive names
- Include brand, region, or campaign type
- You can change this later

**Next:** Provide descriptiveName parameter`,
                        },
                    ],
                };
            }
            if (!args.currencyCode) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `💰 CURRENCY SELECTION (Step 3/4)

⚠️  **CRITICAL:** Currency CANNOT be changed after account creation!

**Common Currencies:**
- USD - US Dollar
- CAD - Canadian Dollar
- EUR - Euro
- GBP - British Pound
- AUD - Australian Dollar
- JPY - Japanese Yen

**Choose based on:**
- Where you'll be advertising
- Your billing preference
- Your business location

**Next:** Provide currencyCode parameter (e.g., "USD", "CAD")`,
                        },
                    ],
                };
            }
            if (!args.timeZone) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🌍 TIMEZONE SELECTION (Step 4/4)

⚠️  **CRITICAL:** Timezone CANNOT be changed after account creation!

**Common Timezones:**
- America/New_York - Eastern Time (US & Canada)
- America/Chicago - Central Time (US & Canada)
- America/Denver - Mountain Time (US & Canada)
- America/Los_Angeles - Pacific Time (US & Canada)
- America/Toronto - Toronto
- Europe/London - London
- Europe/Paris - Paris, Berlin, Rome
- Asia/Tokyo - Tokyo
- Australia/Sydney - Sydney

**This affects:**
- Campaign scheduling
- Report date ranges
- Budget resets (midnight in this timezone)

**Next:** Provide timeZone parameter (e.g., "America/New_York")`,
                        },
                    ],
                };
            }
            // Build dry-run preview
            const dryRunBuilder = new DryRunResultBuilder('create_client_account', 'Google Ads', args.managerCustomerId);
            dryRunBuilder.addChange({
                resource: 'Client Account',
                resourceId: 'NEW',
                field: 'descriptive_name',
                currentValue: null,
                newValue: args.descriptiveName,
                changeType: 'create',
            });
            dryRunBuilder.addChange({
                resource: 'Client Account',
                resourceId: 'NEW',
                field: 'currency_code',
                currentValue: null,
                newValue: args.currencyCode,
                changeType: 'create',
            });
            dryRunBuilder.addChange({
                resource: 'Client Account',
                resourceId: 'NEW',
                field: 'time_zone',
                currentValue: null,
                newValue: args.timeZone,
                changeType: 'create',
            });
            dryRunBuilder.addRisk('Currency and timezone cannot be changed after creation');
            dryRunBuilder.addRisk('New account will be empty - you\'ll need to create campaigns');
            dryRunBuilder.addRecommendation('Verify currency matches your billing preference');
            dryRunBuilder.addRecommendation('Verify timezone matches your target market');
            dryRunBuilder.addRecommendation('After creation, set up billing information in Google Ads UI');
            const dryRun = dryRunBuilder.build();
            // If no confirmation token, return preview
            if (!args.confirmationToken) {
                const token = approvalEnforcer.createConfirmationToken(dryRun);
                const preview = approvalEnforcer.formatDryRunForDisplay(dryRun, token);
                return {
                    success: true,
                    requiresApproval: true,
                    preview,
                    confirmationToken: token,
                    message: 'Client account creation requires approval. Review the preview and confirm.',
                };
            }
            // Validate confirmation and execute
            logger.info('Creating client account with confirmation', {
                managerCustomerId: args.managerCustomerId,
                descriptiveName: args.descriptiveName,
            });
            const result = await approvalEnforcer.validateAndExecute(args.confirmationToken, dryRun, async () => {
                return await adsClient.createClientAccount(args.managerCustomerId, args.descriptiveName, args.currencyCode, args.timeZone);
            });
            // Extract customer ID from result
            const customerResourceName = result.resource_name || '';
            const customerId = customerResourceName.replace('customers/', '');
            return {
                success: true,
                data: {
                    customerId,
                    resourceName: customerResourceName,
                    descriptiveName: args.descriptiveName,
                    currencyCode: args.currencyCode,
                    timeZone: args.timeZone,
                    message: `✅ Client account created successfully!

**New Account Details:**
- Customer ID: ${customerId}
- Name: ${args.descriptiveName}
- Currency: ${args.currencyCode} (permanent)
- Timezone: ${args.timeZone} (permanent)

**What's Next:**
1. Set up billing information (in Google Ads UI)
2. Create campaigns: use create_campaign with customerId: "${customerId}"
3. Set up conversion tracking (optional)
4. Create ad groups and keywords

💡 Save this Customer ID - you'll need it for all future operations!`,
                },
            };
        }
        catch (error) {
            logger.error('Failed to create client account', error);
            throw error;
        }
    },
};
//# sourceMappingURL=create-client-account.tool.js.map