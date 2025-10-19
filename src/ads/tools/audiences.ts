/**
 * MCP Tools for Google Ads Audience & Targeting
 * Includes: UserListService, AudienceService, CustomerMatchService
 */

import { getGoogleAdsClient } from '../client.js';
import { getLogger } from '../../shared/logger.js';
import { getApprovalEnforcer, DryRunResultBuilder } from '../../shared/approval-enforcer.js';
import { detectAndEnforceVagueness } from '../../shared/vagueness-detector.js';

const logger = getLogger('ads.tools.audiences');

/**
 * List user lists (remarketing audiences)
 */
export const listUserListsTool = {
  name: 'list_user_lists',
  description: `List all remarketing lists and audiences in Google Ads account.

💡 AGENT GUIDANCE - REMARKETING LISTS:

📊 WHAT ARE USER LISTS:
- Remarketing lists of users who visited your site/app
- Used for remarketing campaigns (show ads to past visitors)
- Can be based on: pages visited, actions taken, time on site
- Requires remarketing tag installed on website

🎯 USE CASES:
- "Show me all remarketing lists"
- "Which audiences are largest?"
- "What's the membership duration for cart abandoners list?"

📋 WHAT YOU'LL GET:
- User list name and ID
- List size (number of users)
- Membership duration (how long users stay in list)
- Match rate (how many users matched)
- Status (open/closed)`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
    },
    required: ['customerId'],
  },
  async handler(input: any) {
    try {
      const { customerId } = input;

      const client = getGoogleAdsClient();

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

      const customer = client.getCustomer(customerId);
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

      return {
        success: true,
        data: {
          customerId,
          userLists,
          count: userLists.length,
          message: `Found ${userLists.length} user list(s)`,
        },
      };
    } catch (error) {
      logger.error('Failed to list user lists', error as Error);
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
    type: 'object' as const,
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
    required: ['customerId', 'name'],
  },
  async handler(input: any) {
    try {
      const { customerId, name, membershipDays = 30, description, confirmationToken } = input;

      // Vagueness detection
      detectAndEnforceVagueness({
        operation: 'create_user_list',
        inputText: `create user list ${name}`,
        inputParams: { customerId, name },
      });

      const client = getGoogleAdsClient();

      // Build dry-run preview
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'create_user_list',
        'Google Ads',
        customerId
      );

      dryRunBuilder.addChange({
        resource: 'User List',
        resourceId: 'new',
        field: 'user_list',
        currentValue: 'N/A (new list)',
        newValue: `"${name}" (${membershipDays} day membership)`,
        changeType: 'create',
      });

      dryRunBuilder.addRecommendation(
        'Remarketing tag must be installed on website to populate this list'
      );
      dryRunBuilder.addRecommendation(
        'List needs 1,000+ users for Display Network, 100+ for Search'
      );

      if (membershipDays < 7) {
        dryRunBuilder.addRecommendation(
          `Short membership duration (${membershipDays} days) - list will be small but very recent`
        );
      }

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'create_user_list',
          'Google Ads',
          customerId,
          { name }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'User list creation requires approval. Review the preview above and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Creating user list with confirmation', { customerId, name });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          const customer = client.getCustomer(customerId);

          const userList: any = {
            name,
            membership_life_span: membershipDays,
            description: description || '',
            membership_status: 'OPEN',
          };

          const operation = {
            create: userList,
          };

          const response = await customer.userLists.create([operation as any]);

          return response;
        }
      );

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
    } catch (error) {
      logger.error('Failed to create user list', error as Error);
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
    type: 'object' as const,
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
    required: ['customerId', 'userListId', 'customers'],
  },
  async handler(input: any) {
    try {
      const { customerId, userListId, customers, confirmationToken } = input;

      // Vagueness detection
      detectAndEnforceVagueness({
        operation: 'upload_customer_match_list',
        inputText: `upload ${customers.length} customers to list ${userListId}`,
        inputParams: { customerId, userListId, customerCount: customers.length },
      });

      // Check bulk limit
      if (customers.length > 100000) {
        throw new Error(
          `Cannot upload ${customers.length} customers at once. Maximum is 100,000. Please batch into smaller uploads.`
        );
      }

      const client = getGoogleAdsClient();

      // Build dry-run preview
      const approvalEnforcer = getApprovalEnforcer();

      const dryRunBuilder = new DryRunResultBuilder(
        'upload_customer_match_list',
        'Google Ads',
        customerId
      );

      dryRunBuilder.addChange({
        resource: 'Customer Match List',
        resourceId: userListId,
        field: 'customer_data',
        currentValue: 'Current list',
        newValue: `+${customers.length} customer record(s)`,
        changeType: 'update',
      });

      dryRunBuilder.addRecommendation(
        `Uploading ${customers.length} customer record(s) - data will be hashed before upload`
      );
      dryRunBuilder.addRecommendation(
        'Typical match rate: 30-60% for emails, 20-40% for phones'
      );
      dryRunBuilder.addRisk(
        '⚠️ PRIVACY: Ensure you have consent to use customer data for advertising'
      );

      const dryRun = dryRunBuilder.build();

      // If no confirmation token, return preview
      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'upload_customer_match_list',
          'Google Ads',
          customerId,
          { userListId, customers: customers.length }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Customer Match upload requires approval. Review privacy compliance and call this tool again with the confirmationToken to proceed.',
        };
      }

      // Execute with confirmation
      logger.info('Uploading Customer Match data with confirmation', {
        customerId,
        userListId,
        count: customers.length,
      });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          const customer = client.getCustomer(customerId);

          // Build offline user data jobs
          const operations = customers.map((c: any) => ({
            create: {
              hashed_email: c.hashedEmail,
              hashed_phone_number: c.hashedPhoneNumber,
            },
          }));

          const addRequest = {
            resource_name: `customers/${customerId}/userLists/${userListId}`,
            operations,
          };

          const response = await customer.offlineUserDataJobs.createOfflineUserDataJob(addRequest as any);

          return response;
        }
      );

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
    } catch (error) {
      logger.error('Failed to upload Customer Match list', error as Error);
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
    type: 'object' as const,
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
  async handler(input: any) {
    try {
      const { customerId, name, description, confirmationToken } = input;

      detectAndEnforceVagueness({
        operation: 'create_audience',
        inputText: `create audience ${name}`,
        inputParams: { customerId, name },
      });

      const client = getGoogleAdsClient();

      const approvalEnforcer = getApprovalEnforcer();
      const dryRunBuilder = new DryRunResultBuilder('create_audience', 'Google Ads', customerId);

      dryRunBuilder.addChange({
        resource: 'Audience',
        resourceId: 'new',
        field: 'audience',
        currentValue: 'N/A (new audience)',
        newValue: `"${name}"`,
        changeType: 'create',
      });

      dryRunBuilder.addRecommendation('Configure audience rules after creation');

      const dryRun = dryRunBuilder.build();

      if (!confirmationToken) {
        const { confirmationToken: token } = await approvalEnforcer.createDryRun(
          'create_audience',
          'Google Ads',
          customerId,
          { name }
        );

        const preview = approvalEnforcer.formatDryRunForDisplay(dryRun);

        return {
          success: true,
          requiresApproval: true,
          preview,
          confirmationToken: token,
          message:
            'Audience creation requires approval. Review the preview and call again with confirmationToken.',
        };
      }

      logger.info('Creating audience with confirmation', { customerId, name });

      const result = await approvalEnforcer.validateAndExecute(
        confirmationToken,
        dryRun,
        async () => {
          const customer = client.getCustomer(customerId);

          const audience: any = {
            name,
            description: description || '',
          };

          const operation = { create: audience };

          const response = await customer.audiences.create([operation as any]);
          return response;
        }
      );

      return {
        success: true,
        data: {
          customerId,
          audienceId: result,
          name,
          message: `✅ Audience "${name}" created successfully`,
        },
      };
    } catch (error) {
      logger.error('Failed to create audience', error as Error);
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
