/**
 * MCP Tools for URL Inspection operations
 */
import { extractOAuthToken, createGSCClient } from '../../shared/oauth-client-factory.js';
import { getAuditLogger } from '../audit.js';
import { validateGSCProperty } from '../validation.js';
import { getLogger } from '../../shared/logger.js';
const logger = getLogger('gsc.tools.url-inspection');
/**
 * Inspect URL tool
 */
export const inspectUrlTool = {
    name: 'inspect_url',
    description: 'Get indexing status and detailed information about a specific URL in Google Search Console',
    inputSchema: {
        type: 'object',
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
        required: ['property', 'url'],
    },
    async handler(input) {
        try {
            const { property, url } = input;
            // Extract OAuth token from request
            const oauthToken = extractOAuthToken(input);
            if (!oauthToken) {
                throw new Error('OAuth token required for Google Search Console API access');
            }
            // Create GSC client with user's OAuth token
            const gscClient = createGSCClient(oauthToken);
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
            let formattedResult = {
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
                    pageProtocol: indexStatus.pageProtocol,
                    userCanonical: indexStatus.userCanonical,
                    googleCanonical: indexStatus.googleCanonical,
                };
            }
            // Mobile Usability
            if (result.inspectionResult?.mobileUsabilityResult) {
                const mobileUsability = result.inspectionResult.mobileUsabilityResult;
                formattedResult.mobileUsability = {
                    verdict: mobileUsability.verdict,
                    issues: (mobileUsability.issues || []).map((issue) => ({
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
                    detectedItems: (richResults.detectedItems || []).map((item) => ({
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
            return {
                success: true,
                data: formattedResult,
            };
        }
        catch (error) {
            logger.error('Failed to inspect URL', error);
            await getAuditLogger().logFailedOperation('user', 'inspect_url', input.property, error.message);
            throw error;
        }
    },
};
//# sourceMappingURL=url-inspection.js.map