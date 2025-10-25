/**
 * TreeChart Usage Examples - Hierarchical Data Visualization
 *
 * This file demonstrates various real-world use cases for the TreeChart component
 * with Cube.js integration for WPP marketing analytics.
 */

import { TreeChart } from './TreeChart';

// ============================================================================
// EXAMPLE 1: URL Structure Analysis (Orthogonal Layout)
// ============================================================================
// Use Case: Analyze site architecture and traffic distribution
// Shows domain > folder > page hierarchy with click metrics

export const URLStructureTree = () => (
  <TreeChart
    title="Website URL Structure & Traffic"
    datasource="gsc_performance_30days"
    dimension="GSC.page"
    metrics={['GSC.clicks', 'GSC.impressions', 'GSC.ctr']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-01-31'
    }}
    treeLayout="orthogonal"
    treeOrientation="LR" // Left to right
    nodeMetric="GSC.clicks" // Node size based on clicks
    expandLevel={2}
    roam={true}
    symbolSize={14}
    metricsConfig={[
      {
        metricId: 'GSC.clicks',
        format: 'number',
        prefix: '',
        suffix: ' clicks',
        decimals: 0
      },
      {
        metricId: 'GSC.impressions',
        format: 'number',
        prefix: '',
        suffix: ' impr',
        decimals: 0
      },
      {
        metricId: 'GSC.ctr',
        format: 'percent',
        decimals: 2
      }
    ]}
    showTitle={true}
    backgroundColor="#ffffff"
    showBorder={true}
    borderRadius={12}
    padding={20}
  />
);

// ============================================================================
// EXAMPLE 2: Campaign Hierarchy (Radial Layout)
// ============================================================================
// Use Case: Visualize Google Ads campaign > ad group > keyword structure
// Radial layout for compact display of complex hierarchies

export const CampaignStructureTree = () => (
  <TreeChart
    title="Google Ads Campaign Structure"
    datasource="google_ads_30days"
    dimension="GoogleAds.campaignName" // Would need to be pre-processed with hierarchy
    metrics={['GoogleAds.cost', 'GoogleAds.conversions', 'GoogleAds.roas']}
    filters={[
      {
        field: 'GoogleAds.campaignStatus',
        operator: 'equals',
        values: ['ENABLED']
      }
    ]}
    dateRange={{
      start: '2025-01-01',
      end: '2025-01-31'
    }}
    treeLayout="radial" // Circular layout
    nodeMetric="GoogleAds.cost" // Node size based on spend
    expandLevel={3}
    roam={true}
    symbolSize={12}
    metricsConfig={[
      {
        metricId: 'GoogleAds.cost',
        format: 'currency',
        decimals: 2
      },
      {
        metricId: 'GoogleAds.conversions',
        format: 'number',
        decimals: 1
      },
      {
        metricId: 'GoogleAds.roas',
        format: 'percent',
        decimals: 2,
        suffix: 'x'
      }
    ]}
    chartColors={['#4285F4', '#34A853', '#FBBC04', '#EA4335']}
  />
);

// ============================================================================
// EXAMPLE 3: Product Category Tree (Top-to-Bottom)
// ============================================================================
// Use Case: E-commerce product hierarchy with sales metrics
// Shows category > subcategory > product with revenue data

export const ProductCategoryTree = () => (
  <TreeChart
    title="Product Category Performance"
    datasource="analytics_30days"
    dimension="Analytics.productCategory" // Path-like: Electronics/Laptops/Gaming
    metrics={['Analytics.revenue', 'Analytics.transactions', 'Analytics.itemsViewed']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-01-31'
    }}
    treeLayout="orthogonal"
    treeOrientation="TB" // Top to bottom
    nodeMetric="Analytics.revenue" // Node size based on revenue
    expandLevel={2}
    roam={true}
    symbolSize={16}
    metricsConfig={[
      {
        metricId: 'Analytics.revenue',
        format: 'currency',
        decimals: 0
      },
      {
        metricId: 'Analytics.transactions',
        format: 'number',
        decimals: 0,
        suffix: ' orders'
      },
      {
        metricId: 'Analytics.itemsViewed',
        format: 'number',
        decimals: 0,
        suffix: ' views'
      }
    ]}
    backgroundColor="#fafafa"
    showBorder={true}
    borderColor="#e5e7eb"
    padding={24}
  />
);

// ============================================================================
// EXAMPLE 4: Organizational Chart (Right-to-Left)
// ============================================================================
// Use Case: Display department hierarchy with team metrics
// Shows company > division > department structure

export const OrganizationalChart = () => (
  <TreeChart
    title="Organization Structure & Performance"
    datasource="internal_metrics"
    dimension="Organization.department" // Path: Company/Sales/EMEA/UK
    metrics={['Organization.teamSize', 'Organization.revenue', 'Organization.targets']}
    treeLayout="orthogonal"
    treeOrientation="RL" // Right to left (useful for RTL languages or design preference)
    nodeMetric="Organization.teamSize"
    expandLevel={3}
    roam={false} // Disable zoom for org charts
    symbolSize={14}
    metricsConfig={[
      {
        metricId: 'Organization.teamSize',
        format: 'number',
        decimals: 0,
        suffix: ' people'
      },
      {
        metricId: 'Organization.revenue',
        format: 'currency',
        decimals: 0
      },
      {
        metricId: 'Organization.targets',
        format: 'percent',
        decimals: 1
      }
    ]}
    chartColors={['#6366f1', '#8b5cf6', '#d946ef']}
  />
);

// ============================================================================
// EXAMPLE 5: Content Hierarchy (Compact Radial)
// ============================================================================
// Use Case: Blog/content structure with engagement metrics
// Radial layout for compact display

export const ContentHierarchyTree = () => (
  <TreeChart
    title="Content Structure & Engagement"
    datasource="gsc_content_90days"
    dimension="GSC.page" // /blog/category/article
    metrics={['GSC.clicks', 'GSC.averagePosition', 'GSC.ctr']}
    filters={[
      {
        field: 'GSC.page',
        operator: 'contains',
        values: ['/blog/']
      }
    ]}
    dateRange={{
      start: '2024-11-01',
      end: '2025-01-31'
    }}
    treeLayout="radial"
    nodeMetric="GSC.clicks"
    expandLevel={2}
    roam={true}
    symbolSize={10}
    metricsConfig={[
      {
        metricId: 'GSC.clicks',
        format: 'number',
        decimals: 0
      },
      {
        metricId: 'GSC.averagePosition',
        format: 'number',
        decimals: 1,
        prefix: '#'
      },
      {
        metricId: 'GSC.ctr',
        format: 'percent',
        decimals: 2
      }
    ]}
    backgroundColor="#ffffff"
    showBorder={true}
    borderRadius={8}
    padding={16}
  />
);

// ============================================================================
// EXAMPLE 6: Landing Page Hierarchy (Bottom-to-Top)
// ============================================================================
// Use Case: Analyze landing page structure and conversion paths

export const LandingPageTree = () => (
  <TreeChart
    title="Landing Page Hierarchy & Conversions"
    datasource="analytics_30days"
    dimension="Analytics.landingPage" // /products/category/subcategory
    metrics={['Analytics.sessions', 'Analytics.conversions', 'Analytics.conversionRate']}
    filters={[
      {
        field: 'Analytics.medium',
        operator: 'equals',
        values: ['organic', 'cpc']
      }
    ]}
    dateRange={{
      start: '2025-01-01',
      end: '2025-01-31'
    }}
    treeLayout="orthogonal"
    treeOrientation="BT" // Bottom to top
    nodeMetric="Analytics.conversions"
    expandLevel={2}
    roam={true}
    symbolSize={14}
    metricsConfig={[
      {
        metricId: 'Analytics.sessions',
        format: 'number',
        decimals: 0,
        suffix: ' sessions'
      },
      {
        metricId: 'Analytics.conversions',
        format: 'number',
        decimals: 0,
        suffix: ' conv'
      },
      {
        metricId: 'Analytics.conversionRate',
        format: 'percent',
        decimals: 2
      }
    ]}
    chartColors={['#10b981', '#3b82f6', '#f59e0b']}
  />
);

// ============================================================================
// EXAMPLE 7: Multi-Platform Campaign Tree
// ============================================================================
// Use Case: Compare campaign performance across Google Ads, Facebook, LinkedIn
// Shows platform > campaign > ad set hierarchy

export const MultiPlatformCampaignTree = () => (
  <TreeChart
    title="Multi-Platform Campaign Structure"
    datasource="cross_platform_30days"
    dimension="Platform.hierarchy" // Google/Search/Brand, Facebook/Feed/Awareness
    metrics={['Platform.spend', 'Platform.conversions', 'Platform.cpa']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-01-31'
    }}
    treeLayout="orthogonal"
    treeOrientation="LR"
    nodeMetric="Platform.spend"
    expandLevel={3}
    roam={true}
    symbolSize={16}
    metricsConfig={[
      {
        metricId: 'Platform.spend',
        format: 'currency',
        decimals: 0
      },
      {
        metricId: 'Platform.conversions',
        format: 'number',
        decimals: 0
      },
      {
        metricId: 'Platform.cpa',
        format: 'currency',
        decimals: 2,
        prefix: '$'
      }
    ]}
    backgroundColor="#ffffff"
    showBorder={true}
    borderRadius={12}
    padding={24}
    chartColors={['#4285F4', '#1877F2', '#0A66C2']} // Google, Facebook, LinkedIn colors
  />
);

// ============================================================================
// EXAMPLE 8: Keyword Group Tree (Themed)
// ============================================================================
// Use Case: Analyze keyword themes and subgroups
// Shows theme > subtheme > keyword hierarchy

export const KeywordThemeTree = () => (
  <TreeChart
    title="Keyword Theme Structure"
    datasource="google_ads_keywords_30days"
    dimension="GoogleAds.keywordTheme" // Brand/Products/Generic
    metrics={['GoogleAds.impressions', 'GoogleAds.clicks', 'GoogleAds.qualityScore']}
    filters={[
      {
        field: 'GoogleAds.keywordStatus',
        operator: 'equals',
        values: ['ENABLED']
      }
    ]}
    dateRange={{
      start: '2025-01-01',
      end: '2025-01-31'
    }}
    treeLayout="radial"
    nodeMetric="GoogleAds.impressions"
    expandLevel={2}
    roam={true}
    symbolSize={12}
    metricsConfig={[
      {
        metricId: 'GoogleAds.impressions',
        format: 'number',
        decimals: 0,
        suffix: ' impr'
      },
      {
        metricId: 'GoogleAds.clicks',
        format: 'number',
        decimals: 0,
        suffix: ' clicks'
      },
      {
        metricId: 'GoogleAds.qualityScore',
        format: 'number',
        decimals: 1,
        prefix: 'QS: '
      }
    ]}
    titleFontSize="18"
    titleFontWeight="700"
    titleColor="#1f2937"
    backgroundColor="#f9fafb"
    showBorder={true}
    borderColor="#d1d5db"
    padding={20}
  />
);

// ============================================================================
// INTEGRATION NOTES
// ============================================================================

/**
 * DATA PREPARATION FOR HIERARCHICAL STRUCTURE:
 *
 * Option 1: Pre-process in Cube.js
 * --------------------------------
 * Create a dimension that contains the full path:
 *
 * dimensions: {
 *   categoryPath: {
 *     sql: `CONCAT(
 *       ${CUBE}.main_category, '/',
 *       ${CUBE}.sub_category, '/',
 *       ${CUBE}.product_name
 *     )`,
 *     type: 'string'
 *   }
 * }
 *
 * Option 2: Separate Hierarchy Table
 * -----------------------------------
 * Create a dedicated hierarchy table in BigQuery:
 *
 * CREATE TABLE hierarchy_mapping (
 *   id STRING,
 *   parent_id STRING,
 *   name STRING,
 *   level INT,
 *   full_path STRING
 * );
 *
 * Then join in Cube.js:
 *
 * joins: {
 *   Hierarchy: {
 *     sql: `${CUBE}.item_id = ${Hierarchy}.id`,
 *     relationship: 'belongsTo'
 *   }
 * }
 *
 * Option 3: Frontend Processing
 * ------------------------------
 * The TreeChart component automatically builds hierarchy from path-like strings:
 * - URLs: https://example.com/products/electronics/laptops
 * - Categories: Electronics > Laptops > Gaming
 * - Campaigns: Brand | Search | US | Desktop
 *
 * PERFORMANCE OPTIMIZATION:
 * -------------------------
 * - Limit to 100-200 nodes maximum
 * - Use appropriate expandLevel (2-3 for deep trees)
 * - Enable roam for large trees
 * - Pre-aggregate metrics in Cube.js
 * - Use pre-aggregations for faster queries
 *
 * LAYOUT SELECTION GUIDE:
 * ------------------------
 * Orthogonal (LR): Best for org charts, process flows
 * Orthogonal (TB): Best for top-down hierarchies, file systems
 * Radial: Best for compact display, equal-importance nodes
 */
