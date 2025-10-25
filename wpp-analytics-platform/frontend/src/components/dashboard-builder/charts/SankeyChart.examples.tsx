import React from 'react';
import { SankeyChart } from './SankeyChart';

/**
 * SankeyChart Usage Examples
 *
 * This file demonstrates various real-world use cases for the Sankey chart component
 * with Cube.js integration.
 */

// ============================================================================
// Example 1: Traffic Source → Landing Page → Conversion Flow
// ============================================================================
export const TrafficFlowExample: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2>Traffic Source to Conversion Flow</h2>
      <p>Visualize how traffic from different sources converts through your site</p>

      <SankeyChart
        query={{
          measures: ['TrafficSource.sessions'],
          dimensions: [
            'TrafficSource.source',
            'TrafficSource.landingPage',
            'TrafficSource.conversionType',
          ],
          timeDimensions: [
            {
              dimension: 'TrafficSource.date',
              dateRange: 'last 30 days',
            },
          ],
          order: {
            'TrafficSource.sessions': 'desc',
          },
          limit: 1000,
        }}
        flowLevels={['source', 'landingPage', 'conversionType']}
        valueMeasure="TrafficSource.sessions"
        height={700}
        nodeAlign="justify"
        valueFormatter={(value) => `${(value / 1000).toFixed(1)}K sessions`}
        onNodeClick={(nodeName, level) => {
          console.log(`Clicked: ${nodeName} at level ${level}`);
        }}
        onLinkClick={(source, target, value) => {
          console.log(`Flow: ${source} → ${target} (${value})`);
        }}
      />
    </div>
  );
};

// ============================================================================
// Example 2: Google Ads Campaign Hierarchy Flow
// ============================================================================
export const GoogleAdsCampaignFlowExample: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2>Google Ads: Campaign → Ad Group → Keyword → Conversion</h2>
      <p>Analyze which campaigns and keywords drive the most conversions</p>

      <SankeyChart
        query={{
          measures: ['GoogleAds.conversions', 'GoogleAds.cost'],
          dimensions: [
            'GoogleAds.campaignName',
            'GoogleAds.adGroupName',
            'GoogleAds.keyword',
            'GoogleAds.conversionAction',
          ],
          timeDimensions: [
            {
              dimension: 'GoogleAds.date',
              dateRange: 'last 7 days',
            },
          ],
          filters: [
            {
              member: 'GoogleAds.conversions',
              operator: 'gt',
              values: ['0'],
            },
          ],
          order: {
            'GoogleAds.conversions': 'desc',
          },
          limit: 500,
        }}
        flowLevels={['campaignName', 'adGroupName', 'keyword', 'conversionAction']}
        valueMeasure="GoogleAds.conversions"
        height={800}
        nodeGap={12}
        nodeWidth={25}
        colors={['#4285F4', '#34A853', '#FBBC04', '#EA4335']}
        levelColors={{
          0: '#4285F4', // Campaign level - blue
          1: '#34A853', // Ad Group level - green
          2: '#FBBC04', // Keyword level - yellow
          3: '#EA4335', // Conversion level - red
        }}
        valueFormatter={(value) => `${value} conv`}
        minLinkValue={1} // Hide flows with less than 1 conversion
        showLinkLabels={true}
      />
    </div>
  );
};

// ============================================================================
// Example 3: Device → Page Type → User Action Flow
// ============================================================================
export const DeviceJourneyExample: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2>Device to Action Flow</h2>
      <p>Understand how different devices interact with different page types</p>

      <SankeyChart
        query={{
          measures: ['Analytics.pageviews'],
          dimensions: [
            'Analytics.deviceCategory',
            'Analytics.pageType',
            'Analytics.eventAction',
          ],
          timeDimensions: [
            {
              dimension: 'Analytics.date',
              dateRange: 'this month',
            },
          ],
          order: {
            'Analytics.pageviews': 'desc',
          },
        }}
        flowLevels={['deviceCategory', 'pageType', 'eventAction']}
        valueMeasure="Analytics.pageviews"
        height={600}
        orient="horizontal"
        nodeAlign="left"
        valueFormatter={(value) => {
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
          return value.toString();
        }}
      />
    </div>
  );
};

// ============================================================================
// Example 4: Geographic Location → Product Category → Purchase
// ============================================================================
export const GeographicSalesFlowExample: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2>Geographic Sales Flow</h2>
      <p>Track purchase paths from region to product category</p>

      <SankeyChart
        query={{
          measures: ['Ecommerce.revenue', 'Ecommerce.transactions'],
          dimensions: [
            'Ecommerce.region',
            'Ecommerce.productCategory',
            'Ecommerce.purchaseType',
          ],
          timeDimensions: [
            {
              dimension: 'Ecommerce.date',
              dateRange: 'last 90 days',
            },
          ],
          filters: [
            {
              member: 'Ecommerce.revenue',
              operator: 'gt',
              values: ['0'],
            },
          ],
          order: {
            'Ecommerce.revenue': 'desc',
          },
        }}
        flowLevels={['region', 'productCategory', 'purchaseType']}
        valueMeasure="Ecommerce.revenue"
        height={700}
        colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']}
        valueFormatter={(value) => `$${(value / 1000).toFixed(1)}K`}
        minLinkValue={1000} // Hide flows under $1K
        draggable={true}
        layoutIterations={64} // More iterations for better layout
      />
    </div>
  );
};

// ============================================================================
// Example 5: Search Console Query Flow (Multi-Platform)
// ============================================================================
export const SearchConsoleFlowExample: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2>Search Console: Query → Page → Device → Position Range</h2>
      <p>Analyze how search queries perform across different pages and devices</p>

      <SankeyChart
        query={{
          measures: ['SearchConsole.clicks', 'SearchConsole.impressions'],
          dimensions: [
            'SearchConsole.query',
            'SearchConsole.page',
            'SearchConsole.device',
            'SearchConsole.positionRange',
          ],
          timeDimensions: [
            {
              dimension: 'SearchConsole.date',
              dateRange: 'last 28 days',
            },
          ],
          filters: [
            {
              member: 'SearchConsole.clicks',
              operator: 'gt',
              values: ['10'],
            },
          ],
          order: {
            'SearchConsole.clicks': 'desc',
          },
          limit: 200,
        }}
        flowLevels={['query', 'page', 'device', 'positionRange']}
        valueMeasure="SearchConsole.clicks"
        height={900}
        nodeWidth={30}
        nodeGap={10}
        valueFormatter={(value) => `${value} clicks`}
        showLinkLabels={false}
        animationDuration={1500}
      />
    </div>
  );
};

// ============================================================================
// Example 6: Vertical Orientation Example
// ============================================================================
export const VerticalFlowExample: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2>Vertical Flow: Top to Bottom</h2>
      <p>Same data, different orientation for space-constrained layouts</p>

      <SankeyChart
        query={{
          measures: ['TrafficSource.sessions'],
          dimensions: [
            'TrafficSource.source',
            'TrafficSource.medium',
            'TrafficSource.campaign',
          ],
          timeDimensions: [
            {
              dimension: 'TrafficSource.date',
              dateRange: 'last 7 days',
            },
          ],
        }}
        flowLevels={['source', 'medium', 'campaign']}
        valueMeasure="TrafficSource.sessions"
        height={1000}
        orient="vertical"
        nodeAlign="justify"
        nodeWidth={50}
        nodeGap={20}
      />
    </div>
  );
};

// ============================================================================
// Example 7: Custom Loading and Error Components
// ============================================================================
export const CustomStatesExample: React.FC = () => {
  const CustomLoading = () => (
    <div
      style={{
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
      }}
    >
      <div>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔄</div>
        <h3>Analyzing flow patterns...</h3>
      </div>
    </div>
  );

  const CustomError = (error: Error) => (
    <div
      style={{
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        border: '2px dashed #ff4d4f',
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚨</div>
        <h2 style={{ color: '#ff4d4f', margin: '0 0 16px 0' }}>
          Flow Analysis Failed
        </h2>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0' }}>
          {error.message}
        </p>
        <button
          style={{
            padding: '12px 24px',
            background: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <h2>Custom Loading & Error States</h2>

      <SankeyChart
        query={{
          measures: ['TrafficSource.sessions'],
          dimensions: [
            'TrafficSource.source',
            'TrafficSource.landingPage',
            'TrafficSource.conversionType',
          ],
          timeDimensions: [
            {
              dimension: 'TrafficSource.date',
              dateRange: 'last 30 days',
            },
          ],
        }}
        flowLevels={['source', 'landingPage', 'conversionType']}
        valueMeasure="TrafficSource.sessions"
        loadingComponent={<CustomLoading />}
        errorComponent={CustomError}
      />
    </div>
  );
};

// ============================================================================
// Example 8: Dashboard Integration with Multiple Charts
// ============================================================================
export const DashboardIntegrationExample: React.FC = () => {
  return (
    <div style={{ padding: '24px', background: '#f5f5f5' }}>
      <h1>Multi-Platform Marketing Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '24px',
        }}
      >
        {/* Paid Traffic Flow */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0' }}>Paid Traffic Flow</h3>
          <SankeyChart
            query={{
              measures: ['GoogleAds.clicks'],
              dimensions: [
                'GoogleAds.campaignName',
                'GoogleAds.adGroupName',
                'GoogleAds.conversionAction',
              ],
              timeDimensions: [
                {
                  dimension: 'GoogleAds.date',
                  dateRange: 'last 7 days',
                },
              ],
              filters: [
                {
                  member: 'GoogleAds.clicks',
                  operator: 'gt',
                  values: ['0'],
                },
              ],
            }}
            flowLevels={['campaignName', 'adGroupName', 'conversionAction']}
            valueMeasure="GoogleAds.clicks"
            height={400}
            nodeWidth={15}
            nodeGap={6}
          />
        </div>

        {/* Organic Traffic Flow */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0' }}>Organic Traffic Flow</h3>
          <SankeyChart
            query={{
              measures: ['SearchConsole.clicks'],
              dimensions: [
                'SearchConsole.query',
                'SearchConsole.page',
                'SearchConsole.device',
              ],
              timeDimensions: [
                {
                  dimension: 'SearchConsole.date',
                  dateRange: 'last 7 days',
                },
              ],
            }}
            flowLevels={['query', 'page', 'device']}
            valueMeasure="SearchConsole.clicks"
            height={400}
            nodeWidth={15}
            nodeGap={6}
            colors={['#10b981', '#3b82f6', '#f59e0b']}
          />
        </div>
      </div>

      {/* Full-Width Combined Flow */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0' }}>Combined Channel Performance</h3>
        <SankeyChart
          query={{
            measures: ['HolisticSearch.totalClicks', 'HolisticSearch.totalCost'],
            dimensions: [
              'HolisticSearch.channel',
              'HolisticSearch.searchTerm',
              'HolisticSearch.landingPage',
              'HolisticSearch.outcome',
            ],
            timeDimensions: [
              {
                dimension: 'HolisticSearch.date',
                dateRange: 'last 30 days',
              },
            ],
          }}
          flowLevels={['channel', 'searchTerm', 'landingPage', 'outcome']}
          valueMeasure="HolisticSearch.totalClicks"
          height={700}
          showLinkLabels={true}
          valueFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Export all examples
// ============================================================================
export const AllExamples = {
  TrafficFlowExample,
  GoogleAdsCampaignFlowExample,
  DeviceJourneyExample,
  GeographicSalesFlowExample,
  SearchConsoleFlowExample,
  VerticalFlowExample,
  CustomStatesExample,
  DashboardIntegrationExample,
};

export default AllExamples;
