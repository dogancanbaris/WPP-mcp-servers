/**
 * Get Ad Group Quality Score Tool
 *
 * GAQL query for Quality Score metrics by ad group with analysis and recommendations.
 * Quality Score is critical for CPC optimization and ad rank.
 */

import { getLogger } from '../../../shared/logger.js';
import { extractRefreshToken } from '../../../shared/oauth-client-factory.js';
import { createGoogleAdsClientFromRefreshToken } from '../../client.js';
import { formatDiscoveryResponse, formatNextSteps, formatNumber, injectGuidance } from '../../../shared/interactive-workflow.js';
import { extractCustomerId } from '../../validation.js';

const logger = getLogger('ads.tools.ad-groups.quality-score');

/**
 * Get Quality Score analysis for ad groups
 */
export const getAdGroupQualityScoreTool = {
  name: 'get_ad_group_quality_score',
  description: 'Get Quality Score metrics and analysis for ad groups.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customerId: {
        type: 'string',
        description: 'Customer ID (10 digits)',
      },
      campaignId: {
        type: 'string',
        description: 'Campaign ID (optional - filter to specific campaign)',
      },
      adGroupId: {
        type: 'string',
        description: 'Ad Group ID (optional - filter to specific ad group)',
      },
    },
    required: [], // Make optional for discovery
  },
  async handler(input: any) {
    try {
      const { customerId, campaignId, adGroupId } = input;

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
          step: '1/1',
          title: 'SELECT GOOGLE ADS ACCOUNT',
          items: accounts,
          itemFormatter: (a, i) => `${i + 1}. Customer ID: ${a.customerId}`,
          prompt: 'Which account\'s Quality Scores would you like to analyze?',
          nextParam: 'customerId',
          emoji: '📊',
        });
      }

      // ═══ STEP 2: EXECUTE QUALITY SCORE QUERY WITH ANALYSIS ═══
      logger.info('Getting Quality Score data', { customerId, campaignId, adGroupId });

      const customer = client.getCustomer(customerId);

      // Build dynamic WHERE clause
      const whereConditions = ['ad_group.status != \'REMOVED\''];
      if (campaignId) {
        whereConditions.push(`campaign.id = ${campaignId}`);
      }
      if (adGroupId) {
        whereConditions.push(`ad_group.id = ${adGroupId}`);
      }

      // GAQL query for Quality Score metrics
      // Note: Quality Score is at keyword level, we aggregate by ad group
      const qualityScoreData = await customer.query(`
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.status,
          campaign.id,
          campaign.name,
          ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.quality_info.creative_quality_score,
          ad_group_criterion.quality_info.post_click_quality_score,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.search_impression_share
        FROM keyword_view
        WHERE ${whereConditions.join(' AND ')}
          AND ad_group_criterion.status = 'ENABLED'
          AND segments.date DURING LAST_30_DAYS
        ORDER BY metrics.impressions DESC
      `);

      if (qualityScoreData.length === 0) {
        const guidanceText = `ℹ️ NO QUALITY SCORE DATA FOUND

${adGroupId ? `Ad Group ${adGroupId}` : campaignId ? `Campaign ${campaignId}` : 'This account'} has no active keywords with Quality Score data.

**Why no data?**
- No keywords created yet
- Keywords are paused/removed
- Keywords have no recent impressions (need 30 days of data)

**Next Steps:**
1. Create keywords: use add_keywords
2. Wait for impressions: Quality Score calculated after serving
3. Check back in 24-48 hours after keywords start serving`;

        return injectGuidance(
          { customerId, campaignId, adGroupId },
          guidanceText
        );
      }

      // Aggregate by ad group
      const adGroupMap = new Map();

      for (const row of qualityScoreData) {
        const agId = row.ad_group?.id;
        if (!agId) continue;

        if (!adGroupMap.has(agId)) {
          adGroupMap.set(agId, {
            adGroup: row.ad_group,
            campaign: row.campaign,
            keywords: [],
            metrics: {
              impressions: 0,
              clicks: 0,
              costMicros: 0,
              conversions: 0,
            },
            qualityScores: {
              scores: [],
              creativeScores: [],
              postClickScores: [],
            },
          });
        }

        const ag = adGroupMap.get(agId);

        // Add keyword
        ag.keywords.push({
          text: row.ad_group_criterion?.keyword?.text,
          matchType: row.ad_group_criterion?.keyword?.match_type,
          qualityScore: row.ad_group_criterion?.quality_info?.quality_score,
          creativeQuality: row.ad_group_criterion?.quality_info?.creative_quality_score,
          postClickQuality: row.ad_group_criterion?.quality_info?.post_click_quality_score,
          impressions: row.metrics?.impressions || 0,
        });

        // Aggregate metrics
        ag.metrics.impressions += row.metrics?.impressions || 0;
        ag.metrics.clicks += row.metrics?.clicks || 0;
        ag.metrics.costMicros += row.metrics?.cost_micros || 0;
        ag.metrics.conversions += row.metrics?.conversions || 0;

        // Collect Quality Scores (for averaging)
        if (row.ad_group_criterion?.quality_info?.quality_score) {
          ag.qualityScores.scores.push(row.ad_group_criterion.quality_info.quality_score);
        }
        if (row.ad_group_criterion?.quality_info?.creative_quality_score) {
          ag.qualityScores.creativeScores.push(row.ad_group_criterion.quality_info.creative_quality_score);
        }
        if (row.ad_group_criterion?.quality_info?.post_click_quality_score) {
          ag.qualityScores.postClickScores.push(row.ad_group_criterion.quality_info.post_click_quality_score);
        }
      }

      const adGroups = Array.from(adGroupMap.values());

      // Calculate averages and build analysis
      const analysis = adGroups.map((ag: any) => {
        const avgQualityScore = ag.qualityScores.scores.length > 0
          ? ag.qualityScores.scores.reduce((sum: number, s: any) => sum + s, 0) / ag.qualityScores.scores.length
          : null;

        const avgCreativeScore = ag.qualityScores.creativeScores.length > 0
          ? ag.qualityScores.creativeScores.reduce((sum: number, s: any) => sum + s, 0) / ag.qualityScores.creativeScores.length
          : null;

        const avgPostClickScore = ag.qualityScores.postClickScores.length > 0
          ? ag.qualityScores.postClickScores.reduce((sum: number, s: any) => sum + s, 0) / ag.qualityScores.postClickScores.length
          : null;

        // Find low-scoring keywords (QS < 5)
        const lowQualityKeywords = ag.keywords.filter((k: any) => k.qualityScore && k.qualityScore < 5);

        // Find high-scoring keywords (QS >= 8)
        const highQualityKeywords = ag.keywords.filter((k: any) => k.qualityScore && k.qualityScore >= 8);

        return {
          adGroup: ag.adGroup,
          campaign: ag.campaign,
          keywordCount: ag.keywords.length,
          avgQualityScore,
          avgCreativeScore,
          avgPostClickScore,
          lowQualityCount: lowQualityKeywords.length,
          highQualityCount: highQualityKeywords.length,
          lowQualityKeywords,
          highQualityKeywords,
          metrics: ag.metrics,
        };
      });

      // Sort by avg Quality Score (best first)
      analysis.sort((a, b) => (b.avgQualityScore || 0) - (a.avgQualityScore || 0));

      // Overall statistics
      const totalKeywords = analysis.reduce((sum: number, a: any) => sum + a.keywordCount, 0);
      const totalLowQuality = analysis.reduce((sum: number, a: any) => sum + a.lowQualityCount, 0);
      const totalHighQuality = analysis.reduce((sum: number, a: any) => sum + a.highQualityCount, 0);

      const overallAvgQS = analysis.reduce((sum: number, a: any) => sum + (a.avgQualityScore || 0), 0) / analysis.length;

      // Build rich guidance
      const guidanceText = `📊 QUALITY SCORE ANALYSIS - OPTIMIZATION GOLDMINE

**Account:** ${customerId}
${campaignId ? `**Campaign:** ${campaignId}\n` : ''}${adGroupId ? `**Ad Group:** ${adGroupId}\n` : ''}
**Total Ad Groups Analyzed:** ${analysis.length}
**Total Keywords:** ${totalKeywords}

**OVERALL QUALITY SCORE HEALTH:**
   • Average Quality Score: ${overallAvgQS.toFixed(1)}/10 ${overallAvgQS >= 7 ? '✅ Good' : overallAvgQS >= 5 ? '⚠️ Fair' : '🔴 Needs Work'}
   • High Quality Keywords (8-10): ${totalHighQuality} (${((totalHighQuality / totalKeywords) * 100).toFixed(1)}%)
   • Low Quality Keywords (<5): ${totalLowQuality} (${((totalLowQuality / totalKeywords) * 100).toFixed(1)}%)

${analysis.length > 0 ? `**TOP ${Math.min(5, analysis.length)} AD GROUPS BY QUALITY SCORE:**

${analysis.slice(0, 5).map((a, i) => {
  const ctr = a.metrics.clicks > 0 ? ((a.metrics.clicks / a.metrics.impressions) * 100).toFixed(2) : '0.00';
  const avgCpc = a.metrics.clicks > 0 ? (a.metrics.costMicros / 1_000_000) / a.metrics.clicks : 0;

  return `${i + 1}. ${a.adGroup?.name || 'Unnamed'} (Campaign: ${a.campaign?.name})
   Quality Score: ${a.avgQualityScore ? a.avgQualityScore.toFixed(1) : 'N/A'}/10
   ${a.avgCreativeScore ? `Creative Quality: ${a.avgCreativeScore.toFixed(1)}/10` : ''}
   ${a.avgPostClickScore ? `Landing Page Quality: ${a.avgPostClickScore.toFixed(1)}/10` : ''}
   Keywords: ${a.keywordCount} total (${a.highQualityCount} high, ${a.lowQualityCount} low)
   Performance (30d): ${formatNumber(a.metrics.impressions)} impr, ${ctr}% CTR, $${avgCpc.toFixed(2)} avg CPC`;
}).join('\n\n')}
` : ''}
${totalLowQuality > 0 ? `\n⚠️ **LOW QUALITY KEYWORDS NEEDING ATTENTION (${totalLowQuality} total):**

${analysis
  .flatMap((a) => a.lowQualityKeywords.map((k: any) => ({ ...k, adGroupName: a.adGroup?.name })))
  .sort((a, b) => (a.qualityScore || 0) - (b.qualityScore || 0))
  .slice(0, 10)
  .map((k, i) => {
    return `${i + 1}. "${k.text}" (QS: ${k.qualityScore || 'N/A'}/10)
   Ad Group: ${k.adGroupName}
   Match Type: ${k.matchType}
   Impressions (30d): ${formatNumber(k.impressions || 0)}
   💡 ACTION: Improve ad relevance, landing page, or pause keyword`;
  }).join('\n\n')}

${totalLowQuality > 10 ? `... and ${totalLowQuality - 10} more low-quality keywords\n` : ''}
` : '✅ No critically low-quality keywords found\n'}
💡 **QUALITY SCORE OPTIMIZATION GUIDE:**

**What Quality Score Means:**
   • Scale: 1 (worst) to 10 (best)
   • Impacts: Ad Rank, CPC, Impression Share
   • Formula: Expected CTR + Ad Relevance + Landing Page Experience

**Quality Score Tiers:**
   • 8-10 (Excellent): Lower CPCs, higher ad positions, maximize these!
   • 5-7 (Average): Room for improvement, test variations
   • 1-4 (Poor): Expensive clicks, poor positions, fix or pause

**How to Improve Quality Score:**

**1. Expected CTR (most important component):**
   • Write compelling ad headlines matching keyword intent
   • Use ad extensions (sitelinks, callouts, structured snippets)
   • Test multiple ad variations (A/B testing)
   • Ensure keywords match user search intent

**2. Ad Relevance:**
   • Group tightly related keywords in same ad group
   • Include keyword in headlines and descriptions
   • Create separate ad groups for different themes
   • Use Dynamic Keyword Insertion (DKI) carefully

**3. Landing Page Experience:**
   • Fast page load speed (<3 seconds)
   • Mobile-friendly design
   • Content matches ad promise
   • Clear call-to-action
   • No intrusive popups

**Immediate Actions:**
${totalLowQuality > 0 ? `   • Pause ${totalLowQuality} low-quality keywords (QS <5) OR improve them` : ''}
${totalHighQuality > 0 ? `   • Increase bids on ${totalHighQuality} high-quality keywords (QS 8-10)` : ''}
   • Review ad copy relevance for low-scoring ad groups
   • Check landing page quality (speed, mobile, content)
   • Consider restructuring ad groups by theme

${formatNextSteps([
  totalLowQuality > 0 ? 'Pause low-quality keywords: use update_keyword_status' : 'Create more ad variations: use create_ad',
  'Increase bids on high-quality keywords: better ROI',
  'Review ad relevance: ensure keywords in headlines',
  'Test landing pages: improve page experience score',
  'Monitor weekly: Quality Score changes take 1-2 weeks'
])}

Full Quality Score data (${totalKeywords} keywords) available in structured output.`;

      return injectGuidance(
        {
          customerId,
          campaignId: campaignId || 'all',
          adGroupId: adGroupId || 'all',
          analysis,
          totals: {
            adGroups: analysis.length,
            keywords: totalKeywords,
            avgQualityScore: overallAvgQS,
            lowQualityCount: totalLowQuality,
            highQualityCount: totalHighQuality,
          },
        },
        guidanceText
      );

    } catch (error) {
      logger.error('Failed to get Quality Score data', error as Error);
      throw error;
    }
  },
};
