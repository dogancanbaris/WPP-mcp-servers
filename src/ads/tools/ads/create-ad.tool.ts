/**
 * Create Ad Tool
 *
 * MCP tool for creating Responsive Search Ads in Google Ads.
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { getAuditLogger } from '../../../gsc/audit.js';
import { formatDiscoveryResponse, formatSuccessSummary, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';

const logger = getLogger('ads.tools.ads.create');
const audit = getAuditLogger();

/**
 * Create Responsive Search Ad
 */
export const createAdTool = {
  name: 'create_ad',
  description: 'Create a new Responsive Search Ad in Google Ads.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad Group ID where the ad will be created',
      },
      headlines: {
        type: 'array',
        items: { type: 'string' },
        description: 'Headlines (3-15 required, 30 chars max each)',
      },
      descriptions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Descriptions (2-4 required, 90 chars max each)',
      },
      finalUrl: {
        type: 'string',
        description: 'Final URL (must be HTTPS)',
      },
      path1: {
        type: 'string',
        description: 'Display path 1 (optional, 15 chars max)',
      },
      path2: {
        type: 'string',
        description: 'Display path 2 (optional, 15 chars max)',
      },
      // Mobile and tracking parameters
      mobileFinalUrl: {
        type: 'string',
        description: 'Mobile final URL (optional but recommended - 60% of traffic is mobile)',
      },
      finalUrlSuffix: {
        type: 'string',
        description: 'Final URL suffix for UTM tracking (optional, e.g., "utm_source=google")',
      },
      trackingTemplate: {
        type: 'string',
        description: 'Tracking URL template for conversion tracking (optional)',
      },
      // Agent assistance parameters
      agentAssistMode: {
        type: 'string',
        enum: ['self', 'assisted'],
        description: 'Whether to provide own ad copy or get agent assistance (self/assisted)',
      },
      productInfo: {
        type: 'string',
        description: 'Product/service information for agent to create headlines (if agentAssistMode=assisted)',
      },
      targetAudience: {
        type: 'string',
        description: 'Target audience description for agent assistance (if agentAssistMode=assisted)',
      },
      uniqueSellingPoints: {
        type: 'string',
        description: 'Key USPs/benefits for agent assistance (if agentAssistMode=assisted)',
      },
      confirmationToken: {
        type: 'string',
        description: 'Confirmation token for executing the operation',
      },
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, adGroupId, headlines, descriptions, finalUrl, path1, path2, mobileFinalUrl, finalUrlSuffix, trackingTemplate, agentAssistMode, productInfo, targetAudience, uniqueSellingPoints } = input;

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
        const resourceNames = await client.listAccessibleAccounts();
        const accounts = resourceNames.map((rn: any) => ({
          resourceName: rn,
          customerId: extractCustomerId(rn),
        }));

        return formatDiscoveryResponse({
          step: '1/6',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account do you want to create an ad in?',
          nextParam: 'customerId',
          emoji: '🎯',
        });
      }

      // ═══ STEP 2: AD GROUP DISCOVERY ═══
      if (!adGroupId) {
        const customer = client.getCustomer(customerId);
        const adGroups = await customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            campaign.id,
            campaign.name
          FROM ad_group
          WHERE ad_group.status != 'REMOVED'
          ORDER BY campaign.name, ad_group.name
        `);

        if (adGroups.length === 0) {
          const guidanceText = `⚠️ NO AD GROUPS FOUND (Step 2/6)

This account has no ad groups. You must create an ad group before creating ads.

**Next Steps:**
1. Create a campaign (if needed)
2. Create an ad group in that campaign
3. Then return here to create the ad

Ad groups organize your keywords and ads within a campaign.`;

          return injectGuidance({ customerId }, guidanceText);
        }

        return formatDiscoveryResponse({
          step: '2/6',
          title: 'SELECT AD GROUP',
          items: adGroups,
          itemFormatter: (ag, i) => {
            const adGroup = ag.ad_group;
            const campaign = ag.campaign;
            return `${i + 1}. ${adGroup?.name || 'Unnamed Ad Group'}
   ID: ${adGroup?.id}
   Campaign: ${campaign?.name || 'N/A'}
   Status: ${adGroup?.status}`;
          },
          prompt: 'Which ad group should this ad belong to?',
          nextParam: 'adGroupId',
          context: { customerId },
        });
      }

      // ═══ STEP 2.5: AGENT ASSISTANCE CHOICE ═══
      if (!agentAssistMode && (!headlines || headlines.length === 0)) {
        const guidanceText = `🤖 AD COPY CREATION - CHOOSE YOUR APPROACH (Step 3/9)

**You have 2 options for creating ad copy:**

**Option 1: Self-Service** ✍️
- You already have your ad headlines and descriptions ready
- You'll provide them directly
- Quick and straightforward

**Option 2: Agent-Assisted** 🤖 **RECOMMENDED**
- Agent helps you create compelling ad copy
- You provide product details, target audience, key benefits
- Agent generates 10-15 headline variations following best practices
- Agent generates 4 description variations
- You review, select, and edit as needed
- **Result:** Professional, diverse ad copy optimized for testing

💡 **RECOMMENDATION:** Use agent assistance for better ad performance!

**To proceed:**
- For self-service: Provide agentAssistMode: "self"
- For agent help: Provide agentAssistMode: "assisted"

Which approach would you prefer?`;

        return injectGuidance({ customerId, adGroupId }, guidanceText);
      }

      // ═══ STEP 3A: AGENT-ASSISTED - COLLECT PRODUCT INFO ═══
      if (agentAssistMode === 'assisted' && (!productInfo || !targetAudience || !uniqueSellingPoints)) {
        const guidanceText = `📋 PROVIDE PRODUCT DETAILS FOR AGENT (Step 4/9)

**To create compelling ad copy, I need to understand:**

📦 **PRODUCT/SERVICE INFO:**
  productInfo: "What are you advertising?"
  Example: "Dell XPS 15 laptop - premium business laptop with Intel i7, 16GB RAM, 512GB SSD"

👥 **TARGET AUDIENCE:**
  targetAudience: "Who is this for?"
  Example: "Business professionals, freelancers, and creative professionals needing high-performance laptops"

✨ **UNIQUE SELLING POINTS:**
  uniqueSellingPoints: "Why should they choose you? Key benefits?"
  Example: "Free shipping, 24/7 support, 30-day returns, industry-leading performance, premium build quality"

💡 **EXAMPLE FULL INPUT:**
{
  "productInfo": "Dell XPS 15 - Premium business laptop",
  "targetAudience": "Business professionals and creators",
  "uniqueSellingPoints": "Free shipping, Best-in-class performance, 30-day returns"
}

**What I'll create for you:**
- 10-15 diverse headlines (keyword-rich, benefit-focused, CTA-driven)
- 4 compelling descriptions (features, benefits, urgency)
- All optimized for Google Ads best practices

Provide the above information.`;

        return injectGuidance({ customerId, adGroupId, agentAssistMode }, guidanceText);
      }

      // ═══ STEP 3B: AGENT GENERATES AD COPY ═══
      if (agentAssistMode === 'assisted' && productInfo && targetAudience && uniqueSellingPoints && (!headlines || headlines.length === 0)) {
        // Generate headlines and descriptions based on product info
        const generatedHeadlines = [
          // Keyword-rich headlines
          `${productInfo.split('-')[0].trim()}`,
          `Premium ${productInfo.split('-')[0].trim()}`,
          `Best ${productInfo.split('-')[0].trim()}`,

          // Benefit-focused headlines
          ...uniqueSellingPoints.split(',').slice(0, 3).map((usp: string) => usp.trim()),

          // CTA headlines
          "Shop Now - Limited Stock",
          "Order Today - Fast Shipping",
          "Buy Now - Save Big",

          // Urgency headlines
          "Sale Ends Soon",
          "Limited Time Offer",

          // Social proof
          "Trusted by Thousands",
          "5-Star Rated",

          // Value propositions
          "Best Price Guaranteed",
          "Free Returns - 30 Days"
        ].filter(h => h && h.length <= 30 && h.length > 0).slice(0, 15);

        const generatedDescriptions = [
          // Feature description
          productInfo.length <= 90 ? productInfo : productInfo.substring(0, 87) + '...',

          // Benefit description
          `Perfect for ${targetAudience}. ${uniqueSellingPoints.split(',').slice(0, 2).join('. ')}.`,

          // CTA description
          `${uniqueSellingPoints.split(',')[0].trim()}. Shop now and experience the difference.`,

          // Urgency description
          `Limited time offer. Order today and get ${uniqueSellingPoints.split(',')[0].trim().toLowerCase()}.`
        ].filter(d => d && d.length <= 90 && d.length > 0).slice(0, 4);

        const guidanceText = `✨ AGENT-GENERATED AD COPY (Step 5/9)

Based on your product details, I've created compelling ad copy:

📝 **HEADLINES GENERATED (${generatedHeadlines.length}):**
${generatedHeadlines.map((h: string, i: number) => `${i + 1}. "${h}" (${h.length}/30 chars)`).join('\n')}

📝 **DESCRIPTIONS GENERATED (${generatedDescriptions.length}):**
${generatedDescriptions.map((d: string, i: number) => `${i + 1}. "${d}" (${d.length}/90 chars)`).join('\n')}

💡 **WHAT I INCLUDED:**
- Keywords from product name (${productInfo.split('-')[0].trim()})
- Your unique selling points
- Call-to-action phrases (Shop Now, Order Today)
- Urgency messaging (Limited Time, Sale Ends Soon)
- Social proof (Trusted, 5-Star Rated)

**To proceed:**
1. Review the generated copy above
2. To USE this copy: Call with headlines and descriptions arrays as shown
3. To MODIFY: Edit any headlines/descriptions and provide your version
4. To REGENERATE: Provide different productInfo/targetAudience/uniqueSellingPoints

**Ready to use this copy?** Provide:
{
  "headlines": ${JSON.stringify(generatedHeadlines, null, 2)},
  "descriptions": ${JSON.stringify(generatedDescriptions, null, 2)}
}`;

        return injectGuidance({ customerId, adGroupId, agentAssistMode, productInfo, targetAudience, uniqueSellingPoints }, guidanceText);
      }

      // ═══ STEP 3: HEADLINES VALIDATION ===
      if (!headlines || headlines.length === 0) {
        const guidanceText = `📝 CREATE HEADLINES (Step 3/6)

Responsive Search Ads require 3-15 headlines (30 chars max each).

🎓 **AGENT TRAINING - WHAT MAKES QUALITY HEADLINES:**

**THE DIVERSITY FORMULA (Cover ALL 5 categories):**

1️⃣ **KEYWORDS** (3-5) - What users search for
   • Product names, brand names, models
   • Examples: "Dell XPS 15", "Business Laptop", "Intel i7 Laptop"

2️⃣ **BENEFITS** (3-5) - What user gets
   • Value propositions, features, advantages
   • Examples: "Free Shipping", "30-Day Returns", "5-Star Rated"

3️⃣ **CTAs** (2-3) - Actions to take
   • Shop Now, Order Today, Buy Now, Get Quote
   • Examples: "Shop Now - Save 20%", "Order Today", "Get Free Quote"

4️⃣ **URGENCY** (2-3) - Time-sensitive
   • Limited time, scarcity, deadlines
   • Examples: "Sale Ends Soon", "Limited Stock", "Today Only"

5️⃣ **SOCIAL PROOF** (2-3) - Trust signals
   • Reviews, ratings, popularity, awards
   • Examples: "Trusted by 10K+", "5-Star Rated", "#1 Best Seller"

**CHARACTER OPTIMIZATION:**
• 25-30 chars = Optimal (max visibility)
• 15-24 chars = Acceptable
• <15 chars = Wasted space (expand if possible!)

**AGENT QUALITY CHECKLIST - REVIEW USER'S HEADLINES:**
□ Diversity: Do headlines cover all 5 categories? (Not all keywords or all CTAs)
□ Repetition: Are <30% headlines identical/very similar?
□ Length: Do most use 25-30 chars?
□ Relevance: Do headlines match product being advertised?
□ Clarity: No vague terms like "Great Product"?

**COMMON ISSUES TO FLAG:**
❌ "I see 10/15 headlines are CTAs ('Buy Now', 'Shop Now', etc.) but missing keywords and benefits. Recommend: 5 keywords, 3 benefits, 3 CTAs, 2 urgency, 2 social proof"
❌ "All headlines <15 chars. You're not using full 30 char space. Expand 'Free Ship' to 'Free Shipping On All Orders'?"
❌ "Headlines 1-8 all mention 'Free Shipping'. Too repetitive! Diversify: shipping (1-2), returns (1), rating (1), price (1), quality (1)"

**EXAMPLE - EXCELLENT 15 HEADLINES:**
"Nike Air Max 270" (16 chars) - keyword
"Premium Running Shoes" (21 chars) - keyword
"Men's Athletic Footwear" (23 chars) - keyword
"Free 2-Day Shipping" (19 chars) - benefit
"30-Day Free Returns" (19 chars) - benefit
"Expert Fit Guidance" (19 chars) - benefit
"Shop Now - Save 20%" (19 chars) - CTA
"Order Today" (11 chars) - CTA
"Buy Now - Free Ship" (19 chars) - CTA
"Sale Ends This Sunday" (21 chars) - urgency
"Limited Sizes Available" (23 chars) - urgency
"5-Star Customer Reviews" (23 chars) - social proof
"Trusted by Runners" (18 chars) - social proof
"Best Price Guaranteed" (21 chars) - benefit
"Shop Top Running Brands" (23 chars) - keyword

Provide your headlines array (or use agent assistance!)`;

        return injectGuidance({ customerId, adGroupId }, guidanceText);
      }

      // Validate headlines count
      if (headlines.length < 3) {
        const guidanceText = `❌ TOO FEW HEADLINES (Step 3/6)

You provided ${headlines.length} headline${headlines.length === 1 ? '' : 's'}, but need at least 3.

**Current Headlines:**
${headlines.map((h: string, i: number) => `${i + 1}. "${h}" (${h.length} chars)`).join('\n')}

**Required:** 3-15 headlines total

Add ${3 - headlines.length} more headline${3 - headlines.length === 1 ? '' : 's'}.`;

        return injectGuidance({ customerId, adGroupId, headlines }, guidanceText);
      }

      if (headlines.length > 15) {
        const guidanceText = `❌ TOO MANY HEADLINES (Step 3/6)

You provided ${headlines.length} headlines, but maximum is 15.

**Limit:** 3-15 headlines

Remove ${headlines.length - 15} headline${headlines.length - 15 === 1 ? '' : 's'}.`;

        return injectGuidance({ customerId, adGroupId, headlines }, guidanceText);
      }

      // Validate headline character limits
      const tooLongHeadlines = headlines.filter((h: string) => h.length > 30);
      if (tooLongHeadlines.length > 0) {
        const guidanceText = `❌ HEADLINES TOO LONG (Step 3/6)

These headlines exceed 30 characters:

${tooLongHeadlines.map((h: string) => `• "${h}" (${h.length} chars - ${h.length - 30} over)`).join('\n')}

**Limit:** 30 characters per headline

Shorten these headlines and try again.`;

        return injectGuidance({ customerId, adGroupId, headlines }, guidanceText);
      }

      // ═══ STEP 4: DESCRIPTIONS VALIDATION ═══
      if (!descriptions || descriptions.length === 0) {
        const guidanceText = `📝 CREATE DESCRIPTIONS (Step 4/6)

Responsive Search Ads require 2-4 descriptions (90 chars max each).

🎓 **AGENT TRAINING - DESCRIPTION QUALITY CRITERIA:**

**WHAT MAKES EFFECTIVE DESCRIPTIONS:**

**THE 3-PART FORMULA** (Each description should include):
1. **Feature or Benefit** - What you offer
2. **Value Proposition** - Why it matters
3. **Call-to-Action** - What to do next

**DESCRIPTION VARIETY (Create 4, each with different angle):**

1️⃣ **Feature-Focused** (What + Why)
   "Shop premium Dell XPS laptops with Intel i7, 16GB RAM, and 512GB SSD. Perfect for professionals."

2️⃣ **Benefit-Focused** (What you get)
   "Free shipping on all orders. 30-day hassle-free returns. 5-star customer service rated by 10K+ buyers."

3️⃣ **CTA-Focused** (Urgency + Action)
   "Limited time sale - save up to 30% on select models. Order today and get free expedited shipping!"

4️⃣ **Trust-Focused** (Social proof + Reassurance)
   "Trusted by business professionals worldwide. Expert support available 24/7. Money-back guarantee."

**CHARACTER OPTIMIZATION:**
• 80-90 chars = Optimal (use full space!)
• 60-79 chars = Good
• <60 chars = Wasted opportunity (expand!)

**AGENT QUALITY CHECKLIST:**
□ Variety: Do descriptions use different angles? (not 4 identical feature lists)
□ CTA present: Does at least 1 description include clear call-to-action?
□ No headline repetition: Descriptions add NEW information (don't just repeat headlines)
□ Length optimized: Most descriptions 80-90 chars?
□ Clear benefit: Does reader understand what they get?

**COMMON ISSUES TO FLAG:**
❌ "All 4 descriptions are feature lists. Vary: 1 features, 1 benefits, 1 CTA, 1 trust"
❌ "Description 1 is 45 chars - you have 45 more chars to add value! Expand with benefits or CTA?"
❌ "Descriptions repeat headlines word-for-word. Descriptions should ADD new info, not duplicate"
❌ "No call-to-action in any description. Add 'Shop now', 'Order today', 'Get quote' to at least one?"

**EXAMPLE - EXCELLENT 4 DESCRIPTIONS:**
1. "Dell XPS 15 with Intel i7, 16GB RAM, 512GB SSD. Premium build for business professionals." (89 chars)
2. "Free shipping, 30-day returns, and expert support. Buy with confidence from 5-star seller." (89 chars)
3. "Limited time offer - save 20% on XPS laptops. Order today for free expedited delivery!" (86 chars)
4. "Trusted by Fortune 500 companies. 24/7 customer support. Industry-leading warranty included." (90 chars)

**Current Progress:**
✅ Headlines: ${headlines.length} provided

Provide 2-4 descriptions array`;

        return injectGuidance({ customerId, adGroupId, headlines }, guidanceText);
      }

      // Validate descriptions count
      if (descriptions.length < 2) {
        const guidanceText = `❌ TOO FEW DESCRIPTIONS (Step 4/6)

You provided ${descriptions.length} description${descriptions.length === 1 ? '' : 's'}, but need at least 2.

**Current Descriptions:**
${descriptions.map((d: string, i: number) => `${i + 1}. "${d}" (${d.length} chars)`).join('\n')}

**Required:** 2-4 descriptions total

Add ${2 - descriptions.length} more description${2 - descriptions.length === 1 ? '' : 's'}.`;

        return injectGuidance({ customerId, adGroupId, headlines, descriptions }, guidanceText);
      }

      if (descriptions.length > 4) {
        const guidanceText = `❌ TOO MANY DESCRIPTIONS (Step 4/6)

You provided ${descriptions.length} descriptions, but maximum is 4.

**Limit:** 2-4 descriptions

Remove ${descriptions.length - 4} description${descriptions.length - 4 === 1 ? '' : 's'}.`;

        return injectGuidance({ customerId, adGroupId, headlines, descriptions }, guidanceText);
      }

      // Validate description character limits
      const tooLongDescriptions = descriptions.filter((d: string) => d.length > 90);
      if (tooLongDescriptions.length > 0) {
        const guidanceText = `❌ DESCRIPTIONS TOO LONG (Step 4/6)

These descriptions exceed 90 characters:

${tooLongDescriptions.map((d: string) => `• "${d}" (${d.length} chars - ${d.length - 90} over)`).join('\n')}

**Limit:** 90 characters per description

Shorten these descriptions and try again.`;

        return injectGuidance({ customerId, adGroupId, headlines, descriptions }, guidanceText);
      }

      // ═══ STEP 5: FINAL URL VALIDATION ═══
      if (!finalUrl) {
        const guidanceText = `🔗 FINAL URL (Step 5/6)

Enter the landing page URL where users will go when they click the ad:

**Requirements:**
- Must start with https:// (secure)
- Valid URL format
- Working landing page

**Best Practices:**
✅ Match ad message to landing page content
✅ Use clean, readable URLs
✅ Include tracking parameters if needed
✅ Test the page loads correctly

**Examples:**
- https://example.com/running-shoes
- https://example.com/products/premium-collection?utm_source=google
- https://shop.example.com/sale

**Current Progress:**
✅ Headlines: ${headlines.length} provided (valid)
✅ Descriptions: ${descriptions.length} provided (valid)

**Provide:** finalUrl (HTTPS URL)`;

        return injectGuidance({ customerId, adGroupId, headlines, descriptions }, guidanceText);
      }

      // Validate HTTPS
      if (!finalUrl.startsWith('https://')) {
        const guidanceText = `❌ INVALID URL (Step 5/6)

Final URL must start with https:// (secure connection required).

**Your URL:** ${finalUrl}

**Fix:** Add https:// at the beginning

Example: https://example.com/running-shoes`;

        return injectGuidance({ customerId, adGroupId, headlines, descriptions, finalUrl }, guidanceText);
      }

      // Validate URL format
      try {
        new URL(finalUrl);
      } catch (e) {
        const guidanceText = `❌ INVALID URL FORMAT (Step 5/6)

The URL format is invalid.

**Your URL:** ${finalUrl}

**Requirements:**
- Must be valid URL format
- Must start with https://
- Must include domain name

Example: https://example.com/page`;

        return injectGuidance({ customerId, adGroupId, headlines, descriptions, finalUrl }, guidanceText);
      }

      // Validate path1 if provided
      if (path1 && path1.length > 15) {
        const guidanceText = `❌ PATH1 TOO LONG (Step 5/6)

Display path 1 exceeds 15 characters.

**Your path1:** "${path1}" (${path1.length} chars - ${path1.length - 15} over)

**Limit:** 15 characters

Shorten or remove path1.`;

        return injectGuidance({ customerId, adGroupId, headlines, descriptions, finalUrl, path1 }, guidanceText);
      }

      // Validate path2 if provided
      if (path2 && path2.length > 15) {
        const guidanceText = `❌ PATH2 TOO LONG (Step 5/6)

Display path 2 exceeds 15 characters.

**Your path2:** "${path2}" (${path2.length} chars - ${path2.length - 15} over)

**Limit:** 15 characters

Shorten or remove path2.`;

        return injectGuidance({ customerId, adGroupId, headlines, descriptions, finalUrl, path1, path2 }, guidanceText);
      }

      // ═══ STEP 6: EXECUTE AD CREATION ═══
      // Note: CREATE operations don't need approval (creates in PAUSED status)
      logger.info('Creating responsive search ad', { customerId, adGroupId, headlineCount: headlines.length, descriptionCount: descriptions.length });

      const customer = client.getCustomer(customerId);

      // Build responsive search ad
      const adOperation: any = {
        ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
        status: 'PAUSED',
        ad: {
          responsive_search_ad: {
            headlines: headlines.map((text: string) => ({ text })),
            descriptions: descriptions.map((text: string) => ({ text })),
            path1: path1 || undefined,
            path2: path2 || undefined,
          },
          final_urls: [finalUrl],
          // Add mobile URLs if provided
          final_mobile_urls: mobileFinalUrl ? [mobileFinalUrl] : undefined,
          // Add tracking if provided
          final_url_suffix: finalUrlSuffix || undefined,
          tracking_url_template: trackingTemplate || undefined,
        },
      };

      const result = await customer.adGroupAds.create([adOperation]);

      // Extract ad ID from result
      const adId = (result as any)[0]?.results?.[0]?.resource_name?.split('/').pop() || 'unknown';

      // AUDIT: Log successful ad creation
      await audit.logWriteOperation('user', 'create_ad', customerId, {
        adGroupId,
        adId,
        headlineCount: headlines.length,
        descriptionCount: descriptions.length,
        finalUrl,
      });

      const successText = formatSuccessSummary({
        title: 'AD CREATED SUCCESSFULLY',
        operation: 'Responsive Search Ad creation',
        details: {
          'Ad ID': adId,
          'Ad Group ID': adGroupId,
          'Headlines': `${headlines.length} provided`,
          'Descriptions': `${descriptions.length} provided`,
          'Status': 'PAUSED',
          'Final URL': finalUrl,
        },
        auditId: `ad_${adId}`,
        nextSteps: [
          'Review ad in Google Ads interface',
          'Wait for Google approval (usually 1 business day)',
          'Enable ad when ready to start serving',
          'Monitor performance: use list_ads to see all ads',
        ],
        warnings: [
          'Ad created in PAUSED status - will not serve until enabled',
          'Google must approve ad before it can serve',
          'No edits allowed after creation - create new ad if changes needed',
        ],
      });

      return injectGuidance(
        {
          success: true,
          customerId,
          adGroupId,
          adId,
          status: 'PAUSED',
          headlineCount: headlines.length,
          descriptionCount: descriptions.length,
        },
        successText
      );

    } catch (error) {
      logger.error('Failed to create ad', error as Error);

      // AUDIT: Log failed ad creation
      await audit.logFailedOperation('user', 'create_ad', input.customerId, (error as Error).message, {
        adGroupId: input.adGroupId,
        headlineCount: input.headlines?.length,
        descriptionCount: input.descriptions?.length,
      });

      throw error;
    }
  },
};
