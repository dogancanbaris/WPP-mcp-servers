/**
 * MCP Tools for URL Inspection operations
 */

import { extractOAuthToken, createGSCClient } from '../../shared/oauth-client-factory.js';
import { getAuditLogger } from '../audit.js';
import { validateGSCProperty } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
import { formatDiscoveryResponse, injectGuidance, formatNextSteps } from '../../shared/interactive-workflow.js';

const logger = getLogger('gsc.tools.url-inspection');

/**
 * Inspect URL tool
 */
export const inspectUrlTool = {
  name: 'inspect_url',
  description:
    'Get indexing status and detailed information about a specific URL in Google Search Console',
  inputSchema: {
    type: 'object' as const,
    properties: {
      property: {
        type: 'string',
        description: 'Property URL (e.g., sc-domain:example.com)',
      },
      url: {
        type: 'string',
        description: 'The URL to inspect',
      },
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { property, url } = input;

      // Extract OAuth token from request
      const oauthToken = await extractOAuthToken(input);
      if (!oauthToken) {
        throw new Error('OAuth token required for Google Search Console API access');
      }

      // Create GSC client with user's OAuth token
      const gscClient = createGSCClient(oauthToken);

      // ═══ STEP 1: PROPERTY DISCOVERY ═══
      if (!property) {
        logger.info('Property discovery mode - listing properties');
        const res = await gscClient.sites.list();
        const sites = res.data.siteEntry || [];
        const properties = sites.map((site) => ({
          url: site.siteUrl,
          permissionLevel: site.permissionLevel,
        }));

        return formatDiscoveryResponse({
          step: '1/2',
          title: 'SELECT PROPERTY',
          items: properties,
          itemFormatter: (p, i) =>
            `${i + 1}. ${p.url}\n   Permission: ${p.permissionLevel}`,
          prompt: 'Which property would you like to inspect URLs in?',
          nextParam: 'property',
          emoji: '🔍',
        });
      }

      // ═══ STEP 2: URL SPECIFICATION ═══
      if (!url) {
        const guidanceText = `📋 SPECIFY URL TO INSPECT (Step 2/2)

**Property:** ${property}

Please provide the full URL you want to inspect:

**Examples:**
- https://example.com/
- https://example.com/about
- https://example.com/blog/article-title

💡 TIP: URL must be accessible to Google and within your property

**What You'll Get:**
- Index status (covered/not covered)
- Coverage state
- Last crawl time
- Robots.txt status
- Mobile usability issues
- Rich results detection
- AMP validation
- Canonicalization info

What URL would you like to inspect?`;

        return injectGuidance(
          { property },
          guidanceText
        );
      }

      // ═══ STEP 3: EXECUTE WITH ANALYSIS ═══

      // Validate input
      validateGSCProperty(property);

      const audit = getAuditLogger();

      // Note: Access control removed for full property discovery mode
      // Google API will handle permission errors if user doesn't own the property

      logger.info('Inspecting URL', { property, url });

      const res = await gscClient.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl: property,
        },
      });
      const result = res.data;

      // Parse the inspection result
      let formattedResult: any = {
        url,
        property,
      };

      // Index Status
      if (result.inspectionResult?.indexStatusResult) {
        const indexStatus = result.inspectionResult.indexStatusResult;
        formattedResult.indexStatus = {
          verdict: indexStatus.verdict,
          coverageState: indexStatus.coverageState,
          lastCrawlTime: indexStatus.lastCrawlTime,
          robotsTxtState: indexStatus.robotsTxtState,
          indexingState: indexStatus.indexingState,
          pageProtocol: (indexStatus as any).pageProtocol,
          userCanonical: indexStatus.userCanonical,
          googleCanonical: indexStatus.googleCanonical,
        };
      }

      // Mobile Usability
      if (result.inspectionResult?.mobileUsabilityResult) {
        const mobileUsability = result.inspectionResult.mobileUsabilityResult;
        formattedResult.mobileUsability = {
          verdict: mobileUsability.verdict,
          issues: (mobileUsability.issues || []).map((issue: any) => ({
            rule: issue.rule,
            severity: issue.severity,
          })),
        };
      }

      // Rich Results
      if (result.inspectionResult?.richResultsResult) {
        const richResults = result.inspectionResult.richResultsResult;
        formattedResult.richResults = {
          verdict: richResults.verdict,
          detectedItems: (richResults.detectedItems || []).map((item: any) => ({
            type: item.richResultType,
            itemCount: item.items?.length || 0,
          })),
        };
      }

      // AMP
      if (result.inspectionResult?.ampResult) {
        const amp = result.inspectionResult.ampResult;
        formattedResult.amp = {
          verdict: amp.verdict,
          ampUrl: amp.ampUrl,
          indexingState: amp.indexingState,
        };
      }

      await audit.logReadOperation('user', 'inspect_url', property, {
        inspectionUrl: url,
        verdict: formattedResult.indexStatus?.verdict,
      });

      // Generate insights
      const insights: string[] = [];
      const verdict = formattedResult.indexStatus?.verdict;
      const coverageState = formattedResult.indexStatus?.coverageState;

      if (verdict === 'PASS') {
        insights.push('✅ URL is indexable by Google');
      } else if (verdict === 'FAIL') {
        insights.push('🔴 URL has indexing issues - requires attention');
      } else if (verdict === 'NEUTRAL') {
        insights.push('⚠️ URL is valid but has warnings');
      }

      if (coverageState === 'Submitted and indexed') {
        insights.push('✅ URL is successfully indexed');
      } else if (coverageState === 'Discovered - currently not indexed') {
        insights.push('⚠️ URL discovered but not yet indexed');
      } else if (coverageState === 'Crawled - currently not indexed') {
        insights.push('⚠️ URL crawled but not indexed - check for issues');
      }

      if (formattedResult.mobileUsability?.issues?.length > 0) {
        insights.push(`🔴 ${formattedResult.mobileUsability.issues.length} mobile usability issue(s) found`);
      } else {
        insights.push('✅ No mobile usability issues');
      }

      const guidanceText = `🔍 URL INSPECTION RESULTS

**URL:** ${url}
**Property:** ${property}

**INDEX STATUS:**
- Verdict: ${formattedResult.indexStatus?.verdict || 'Unknown'}
- Coverage: ${formattedResult.indexStatus?.coverageState || 'Unknown'}
- Last Crawl: ${formattedResult.indexStatus?.lastCrawlTime || 'Never'}
- Indexing State: ${formattedResult.indexStatus?.indexingState || 'Unknown'}
- Robots.txt: ${formattedResult.indexStatus?.robotsTxtState || 'Unknown'}

**CANONICALIZATION:**
- User Canonical: ${formattedResult.indexStatus?.userCanonical || 'None'}
- Google Canonical: ${formattedResult.indexStatus?.googleCanonical || 'None'}

**MOBILE USABILITY:**
- Verdict: ${formattedResult.mobileUsability?.verdict || 'Not available'}
- Issues: ${formattedResult.mobileUsability?.issues?.length || 0}

**RICH RESULTS:**
- Verdict: ${formattedResult.richResults?.verdict || 'Not available'}
- Detected Items: ${formattedResult.richResults?.detectedItems?.length || 0}

**AMP:**
- Verdict: ${formattedResult.amp?.verdict || 'Not applicable'}
- AMP URL: ${formattedResult.amp?.ampUrl || 'None'}

💡 KEY INSIGHTS:
${insights.map(i => `   • ${i}`).join('\n')}

${formatNextSteps([
  'Check sitemaps: use list_sitemaps',
  'Query analytics: use query_search_analytics',
  'Inspect another URL: call inspect_url again',
  'Submit sitemap: use submit_sitemap if URL not discovered'
])}

Full inspection details available in structured output.`;

      return injectGuidance(formattedResult, guidanceText);
    } catch (error) {
      logger.error('Failed to inspect URL', error as Error);
      await getAuditLogger().logFailedOperation(
        'user',
        'inspect_url',
        input.property,
        (error as Error).message
      );
      throw error;
    }
  },
};
