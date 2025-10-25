/**
 * PictorialBarChart Storybook Stories
 *
 * Interactive documentation and testing for PictorialBarChart component.
 * Run: npm run storybook
 */
import type { Meta, StoryObj } from '@storybook/react';
import { PictorialBarChart } from './PictorialBarChart';

const meta: Meta<typeof PictorialBarChart> = {
  title: 'Dashboard/Charts/PictorialBarChart',
  component: PictorialBarChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'PictorialBarChart creates bars from repeated symbols for engaging infographic-style visualizations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    symbolType: {
      control: 'select',
      options: ['circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'star'],
      description: 'Shape of symbols used to construct bars',
    },
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'Bar orientation',
    },
    symbolRepeat: {
      control: 'boolean',
      description: 'Whether to repeat symbols to fill bar',
    },
    showLegend: {
      control: 'boolean',
      description: 'Show/hide legend',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PictorialBarChart>;

/**
 * Default vertical pictorial bar chart with rounded rectangles
 */
export const Default: Story = {
  args: {
    title: 'User Sessions by Device',
    datasource: 'google_analytics_sessions',
    dimension: 'GoogleAnalytics.deviceCategory',
    metrics: ['GoogleAnalytics.sessions'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolType: 'roundRect',
    symbolRepeat: true,
    orientation: 'vertical',
    showLegend: false,
  },
};

/**
 * Circle symbols for user counts
 */
export const CircleSymbols: Story = {
  args: {
    title: 'Active Users by Type',
    datasource: 'google_analytics_users',
    dimension: 'GoogleAnalytics.userType',
    metrics: ['GoogleAnalytics.activeUsers'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolType: 'circle',
    symbolRepeat: true,
    symbolMargin: 2,
    symbolSize: 20,
    chartColors: ['#ee6666', '#73c0de'],
  },
};

/**
 * Star symbols for quality/rating metrics
 */
export const StarRating: Story = {
  args: {
    title: 'Top Campaigns (5-Star Rating)',
    datasource: 'google_ads_campaigns',
    dimension: 'GoogleAds.campaignName',
    metrics: ['GoogleAds.conversions'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolType: 'star',
    symbolRepeat: true,
    symbolMargin: '10%',
    chartColors: ['#fac858'],
  },
};

/**
 * Diamond symbols for premium metrics
 */
export const DiamondPremium: Story = {
  args: {
    title: 'Premium Conversions',
    datasource: 'google_ads_campaigns',
    dimension: 'GoogleAds.campaignName',
    metrics: ['GoogleAds.conversions'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolType: 'diamond',
    symbolRepeat: true,
    chartColors: ['#91cc75'],
  },
};

/**
 * Horizontal orientation for long category names
 */
export const HorizontalBars: Story = {
  args: {
    title: 'Top Landing Pages by Clicks',
    datasource: 'gsc_performance',
    dimension: 'GSC.page',
    metrics: ['GSC.clicks'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolType: 'diamond',
    symbolRepeat: true,
    orientation: 'horizontal',
    chartColors: ['#5470c6'],
  },
};

/**
 * Triangle symbols for growth metrics
 */
export const GrowthTrend: Story = {
  args: {
    title: 'Revenue Growth',
    datasource: 'google_ads_revenue',
    dimension: 'GoogleAds.month',
    metrics: ['GoogleAds.conversionValue'],
    dateRange: { start: '2025-01-01', end: '2025-12-31' },
    symbolType: 'triangle',
    symbolRepeat: true,
    symbolMargin: '8%',
    chartColors: ['#3ba272'],
  },
};

/**
 * Pin symbols for geographic data
 */
export const GeographicPins: Story = {
  args: {
    title: 'Sessions by Country',
    datasource: 'google_analytics_geo',
    dimension: 'GoogleAnalytics.country',
    metrics: ['GoogleAnalytics.sessions'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolType: 'pin',
    symbolRepeat: true,
    symbolMargin: '6%',
    chartColors: ['#ee6666'],
  },
};

/**
 * Arrow symbols for traffic sources
 */
export const TrafficFlow: Story = {
  args: {
    title: 'Traffic by Source',
    datasource: 'google_analytics_traffic',
    dimension: 'GoogleAnalytics.sourceMedium',
    metrics: ['GoogleAnalytics.sessions'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolType: 'arrow',
    symbolRepeat: true,
    orientation: 'horizontal',
    chartColors: ['#73c0de'],
  },
};

/**
 * Multiple metrics with different symbols
 */
export const MultipleMetrics: Story = {
  args: {
    title: 'Clicks vs Impressions',
    datasource: 'gsc_performance',
    dimension: 'GSC.query',
    metrics: ['GSC.clicks', 'GSC.impressions'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolRepeat: true,
    symbolMargin: '5%',
    showLegend: true,
    chartColors: ['#5470c6', '#91cc75'],
  },
};

/**
 * Non-repeating symbols (single large symbol per bar)
 */
export const SingleSymbols: Story = {
  args: {
    title: 'Ad Spend by Group',
    datasource: 'google_ads_adgroups',
    dimension: 'GoogleAds.adGroupName',
    metrics: ['GoogleAds.cost'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    symbolType: 'roundRect',
    symbolRepeat: false,
    symbolSize: [60, 40],
    chartColors: ['#5470c6', '#91cc75', '#fac858', '#ee6666'],
    metricsConfig: [
      {
        name: 'GoogleAds.cost',
        format: 'currency',
        decimalPlaces: 2,
      },
    ],
  },
};

/**
 * Fully styled container with custom appearance
 */
export const StyledContainer: Story = {
  args: {
    title: 'Quality Score Distribution',
    showTitle: true,
    titleFontFamily: 'inter',
    titleFontSize: '18',
    titleFontWeight: '700',
    titleColor: '#1f2937',
    titleAlignment: 'center',

    datasource: 'google_ads_keywords',
    dimension: 'GoogleAds.qualityScore',
    metrics: ['GoogleAds.keywords'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },

    symbolType: 'star',
    symbolRepeat: true,
    symbolMargin: '5%',

    backgroundColor: '#f9fafb',
    showBorder: true,
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 12,
    showShadow: true,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 15,
    padding: 20,

    chartColors: ['#fbbf24', '#f59e0b', '#d97706', '#b45309'],
  },
};

/**
 * Compact view for dashboard grids
 */
export const CompactView: Story = {
  args: {
    title: 'Quick Device Stats',
    showTitle: true,
    titleFontSize: '14',

    datasource: 'gsc_performance',
    dimension: 'GSC.device',
    metrics: ['GSC.clicks'],
    dateRange: { start: '2025-01-01', end: '2025-01-31' },

    symbolType: 'circle',
    symbolRepeat: true,
    symbolMargin: 1,
    symbolSize: 16,

    showBorder: false,
    padding: 8,
    showLegend: false,
    chartColors: ['#5470c6'],
  },
};

/**
 * Empty state (no configuration)
 */
export const EmptyState: Story = {
  args: {
    title: 'Configure Your Chart',
    dimension: null,
    metrics: [],
  },
};

/**
 * Loading state simulation
 */
export const LoadingState: Story = {
  args: {
    title: 'Loading Data...',
    datasource: 'google_analytics_sessions',
    dimension: 'GoogleAnalytics.deviceCategory',
    metrics: ['GoogleAnalytics.sessions'],
    // Simulated loading by providing invalid query
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays loading spinner while data is being fetched from Cube.js',
      },
    },
  },
};
