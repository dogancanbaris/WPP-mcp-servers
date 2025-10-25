import type { Meta, StoryObj } from '@storybook/react';
import { WaterfallChart } from './WaterfallChart';

/**
 * WaterfallChart visualizes sequential changes from starting → ending value.
 *
 * Uses stacked bars with invisible helper series for correct positioning.
 * Perfect for revenue bridges, budget allocation, funnel analysis, and period-over-period changes.
 */
const meta = {
  title: 'Dashboard/Charts/WaterfallChart',
  component: WaterfallChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The WaterfallChart component shows how a starting value changes through a series of positive and negative adjustments to reach an ending value.

**Key Features:**
- Cube.js semantic layer integration
- Invisible helper bars for accurate stacking
- Automatic cumulative calculation
- Interactive tooltips with running totals
- Customizable colors for increases/decreases
- Summary statistics panel
- Responsive and accessible

**Common Use Cases:**
- Revenue/profit bridges
- Budget allocation tracking
- Conversion funnel drop-offs
- Period-over-period metric changes
- Cost optimization tracking
- Traffic source contribution
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    query: {
      description: 'Cube.js query configuration',
      control: 'object',
    },
    title: {
      description: 'Chart title',
      control: 'text',
    },
    startLabel: {
      description: 'Label for starting value bar',
      control: 'text',
    },
    endLabel: {
      description: 'Label for ending value bar',
      control: 'text',
    },
    positiveColor: {
      description: 'Color for positive changes',
      control: 'color',
    },
    negativeColor: {
      description: 'Color for negative changes',
      control: 'color',
    },
    totalColor: {
      description: 'Color for total/start/end bars',
      control: 'color',
    },
    height: {
      description: 'Chart height in pixels',
      control: { type: 'range', min: 300, max: 800, step: 50 },
    },
    showLabels: {
      description: 'Show value labels on bars',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof WaterfallChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock Cube.js hook for Storybook
const mockUseCubeQuery = (data: any[]) => {
  return {
    resultSet: {
      tablePivot: () => data,
    },
    isLoading: false,
    error: null,
  };
};

/**
 * Revenue bridge showing Q1 to Q2 changes
 */
export const RevenueBreakdown: Story = {
  args: {
    query: {
      measures: ['Revenue.amount'],
      dimensions: ['Revenue.category'],
      order: { 'Revenue.sequenceOrder': 'asc' },
    },
    title: 'Q1 to Q2 Revenue Bridge',
    startLabel: 'Q1 Revenue',
    endLabel: 'Q2 Revenue',
    valueFormat: (val) => `$${(val / 1000000).toFixed(1)}M`,
  },
  parameters: {
    mockData: [
      { 'Revenue.category': 'Q1 Starting', 'Revenue.amount': 5000000 },
      { 'Revenue.category': 'New Customers', 'Revenue.amount': 1200000 },
      { 'Revenue.category': 'Expansion', 'Revenue.amount': 800000 },
      { 'Revenue.category': 'Churn', 'Revenue.amount': -500000 },
      { 'Revenue.category': 'Price Increase', 'Revenue.amount': 300000 },
    ],
  },
};

/**
 * Campaign budget allocation across channels
 */
export const BudgetAllocation: Story = {
  args: {
    query: {
      measures: ['GoogleAds.dailyBudget'],
      dimensions: ['GoogleAds.campaignName'],
      filters: [{ member: 'GoogleAds.status', operator: 'equals', values: ['ENABLED'] }],
      order: { 'GoogleAds.dailyBudget': 'desc' },
      limit: 8,
    },
    title: 'Daily Budget Allocation',
    startLabel: 'Total Budget',
    endLabel: 'Remaining',
    valueFormat: (val) => `$${val.toLocaleString()}`,
    positiveColor: '#059669',
    negativeColor: '#dc2626',
  },
  parameters: {
    mockData: [
      { 'GoogleAds.campaignName': 'Total Available', 'GoogleAds.dailyBudget': 10000 },
      { 'GoogleAds.campaignName': 'Brand Campaign', 'GoogleAds.dailyBudget': -2500 },
      { 'GoogleAds.campaignName': 'Product Campaign', 'GoogleAds.dailyBudget': -1800 },
      { 'GoogleAds.campaignName': 'Competitor Campaign', 'GoogleAds.dailyBudget': -1500 },
      { 'GoogleAds.campaignName': 'Retargeting', 'GoogleAds.dailyBudget': -1200 },
      { 'GoogleAds.campaignName': 'Display Network', 'GoogleAds.dailyBudget': -900 },
      { 'GoogleAds.campaignName': 'Video Campaign', 'GoogleAds.dailyBudget': -600 },
    ],
  },
};

/**
 * Conversion funnel with drop-offs at each stage
 */
export const ConversionFunnel: Story = {
  args: {
    query: {
      measures: ['Analytics.users'],
      dimensions: ['Analytics.funnelStep'],
      timeDimensions: [{ dimension: 'Analytics.date', dateRange: 'last 30 days' }],
      order: { 'Analytics.funnelStepOrder': 'asc' },
    },
    title: 'Conversion Funnel Analysis',
    startLabel: 'Landing Page',
    endLabel: 'Conversions',
    valueFormat: (val) => val.toLocaleString(),
    negativeColor: '#f59e0b',
    height: 500,
  },
  parameters: {
    mockData: [
      { 'Analytics.funnelStep': 'Landing Page', 'Analytics.users': 50000 },
      { 'Analytics.funnelStep': 'Drop: Product View', 'Analytics.users': -15000 },
      { 'Analytics.funnelStep': 'Drop: Add to Cart', 'Analytics.users': -12000 },
      { 'Analytics.funnelStep': 'Drop: Checkout', 'Analytics.users': -8000 },
      { 'Analytics.funnelStep': 'Drop: Payment', 'Analytics.users': -10000 },
    ],
  },
};

/**
 * Cost per acquisition optimization (inverted colors)
 */
export const CPAOptimization: Story = {
  args: {
    query: {
      measures: ['GoogleAds.costPerConversion'],
      dimensions: ['GoogleAds.week'],
      timeDimensions: [
        { dimension: 'GoogleAds.date', dateRange: 'last 8 weeks', granularity: 'week' },
      ],
      order: { 'GoogleAds.date': 'asc' },
    },
    title: 'Weekly CPA Optimization',
    startLabel: 'Week 1',
    endLabel: 'Week 8',
    valueFormat: (val) => `$${val.toFixed(2)}`,
    // Inverted: red = increase (bad), green = decrease (good)
    positiveColor: '#ef4444',
    negativeColor: '#10b981',
  },
  parameters: {
    mockData: [
      { 'GoogleAds.week': 'Week 1', 'GoogleAds.costPerConversion': 45.5 },
      { 'GoogleAds.week': 'Week 2', 'GoogleAds.costPerConversion': -3.2 },
      { 'GoogleAds.week': 'Week 3', 'GoogleAds.costPerConversion': -2.8 },
      { 'GoogleAds.week': 'Week 4', 'GoogleAds.costPerConversion': 1.5 },
      { 'GoogleAds.week': 'Week 5', 'GoogleAds.costPerConversion': -4.1 },
      { 'GoogleAds.week': 'Week 6', 'GoogleAds.costPerConversion': -1.9 },
      { 'GoogleAds.week': 'Week 7', 'GoogleAds.costPerConversion': -2.5 },
    ],
  },
};

/**
 * Traffic source changes month-over-month
 */
export const TrafficSourceChanges: Story = {
  args: {
    query: {
      measures: ['SearchConsole.clicks'],
      dimensions: ['SearchConsole.sourceType'],
      timeDimensions: [
        {
          dimension: 'SearchConsole.date',
          dateRange: ['2025-09-01', '2025-10-31'],
          granularity: 'month',
        },
      ],
      order: { 'SearchConsole.clicks': 'desc' },
    },
    title: 'Traffic Source Changes (Sep → Oct)',
    startLabel: 'September',
    endLabel: 'October',
    valueFormat: (val) => `${(val / 1000).toFixed(1)}K`,
  },
  parameters: {
    mockData: [
      { 'SearchConsole.sourceType': 'Sep Total', 'SearchConsole.clicks': 125000 },
      { 'SearchConsole.sourceType': 'Organic Search', 'SearchConsole.clicks': 15000 },
      { 'SearchConsole.sourceType': 'Direct', 'SearchConsole.clicks': -5000 },
      { 'SearchConsole.sourceType': 'Social', 'SearchConsole.clicks': 8000 },
      { 'SearchConsole.sourceType': 'Email', 'SearchConsole.clicks': 3000 },
      { 'SearchConsole.sourceType': 'Referral', 'SearchConsole.clicks': -2000 },
    ],
  },
};

/**
 * Marketing ROI contribution by channel
 */
export const ROIBreakdown: Story = {
  args: {
    query: {
      measures: ['Marketing.roi'],
      dimensions: ['Marketing.channel'],
      filters: [{ member: 'Marketing.date', operator: 'inDateRange', values: ['last quarter'] }],
      order: { 'Marketing.roi': 'desc' },
      limit: 8,
    },
    title: 'Q3 Marketing ROI by Channel',
    startLabel: 'Baseline',
    endLabel: 'Total ROI',
    valueFormat: (val) => `${(val * 100).toFixed(1)}%`,
    height: 450,
  },
  parameters: {
    mockData: [
      { 'Marketing.channel': 'Baseline', 'Marketing.roi': 0 },
      { 'Marketing.channel': 'Paid Search', 'Marketing.roi': 0.35 },
      { 'Marketing.channel': 'SEO', 'Marketing.roi': 0.28 },
      { 'Marketing.channel': 'Email', 'Marketing.roi': 0.22 },
      { 'Marketing.channel': 'Social Ads', 'Marketing.roi': 0.15 },
      { 'Marketing.channel': 'Display', 'Marketing.roi': -0.05 },
      { 'Marketing.channel': 'Affiliate', 'Marketing.roi': 0.12 },
    ],
  },
};

/**
 * Showing loading state
 */
export const Loading: Story = {
  args: {
    query: {
      measures: ['Revenue.amount'],
      dimensions: ['Revenue.category'],
    },
    title: 'Loading Example',
  },
  parameters: {
    mockData: null,
    isLoading: true,
  },
};

/**
 * Showing error state
 */
export const Error: Story = {
  args: {
    query: {
      measures: ['Revenue.amount'],
      dimensions: ['Revenue.category'],
    },
    title: 'Error Example',
  },
  parameters: {
    mockData: null,
    error: new Error('Failed to fetch data from Cube.js'),
  },
};

/**
 * Empty state with no data
 */
export const Empty: Story = {
  args: {
    query: {
      measures: ['Revenue.amount'],
      dimensions: ['Revenue.category'],
    },
    title: 'Empty State Example',
  },
  parameters: {
    mockData: [],
  },
};

/**
 * Custom colors matching brand
 */
export const CustomColors: Story = {
  args: {
    query: {
      measures: ['Revenue.amount'],
      dimensions: ['Revenue.category'],
    },
    title: 'Custom Brand Colors',
    valueFormat: (val) => `$${(val / 1000).toFixed(0)}K`,
    positiveColor: '#8b5cf6',
    negativeColor: '#f97316',
    totalColor: '#06b6d4',
  },
  parameters: {
    mockData: [
      { 'Revenue.category': 'Starting', 'Revenue.amount': 100000 },
      { 'Revenue.category': 'Increase A', 'Revenue.amount': 25000 },
      { 'Revenue.category': 'Decrease B', 'Revenue.amount': -10000 },
      { 'Revenue.category': 'Increase C', 'Revenue.amount': 15000 },
    ],
  },
};

/**
 * Without labels on bars
 */
export const NoLabels: Story = {
  args: {
    query: {
      measures: ['Revenue.amount'],
      dimensions: ['Revenue.category'],
    },
    title: 'Without Bar Labels',
    valueFormat: (val) => `$${val.toLocaleString()}`,
    showLabels: false,
  },
  parameters: {
    mockData: [
      { 'Revenue.category': 'Starting', 'Revenue.amount': 500000 },
      { 'Revenue.category': 'Q1 Growth', 'Revenue.amount': 75000 },
      { 'Revenue.category': 'Q2 Decline', 'Revenue.amount': -25000 },
      { 'Revenue.category': 'Q3 Growth', 'Revenue.amount': 100000 },
      { 'Revenue.category': 'Q4 Growth', 'Revenue.amount': 50000 },
    ],
  },
};

/**
 * Compact height for dashboard cards
 */
export const CompactHeight: Story = {
  args: {
    query: {
      measures: ['Clicks.total'],
      dimensions: ['Clicks.source'],
    },
    title: 'Compact Waterfall',
    valueFormat: (val) => val.toLocaleString(),
    height: 300,
  },
  parameters: {
    mockData: [
      { 'Clicks.source': 'Starting', 'Clicks.total': 10000 },
      { 'Clicks.source': 'Organic', 'Clicks.total': 2500 },
      { 'Clicks.source': 'Paid', 'Clicks.total': -500 },
      { 'Clicks.source': 'Social', 'Clicks.total': 1200 },
    ],
  },
};

/**
 * Large dataset with many changes
 */
export const LargeDataset: Story = {
  args: {
    query: {
      measures: ['Revenue.amount'],
      dimensions: ['Revenue.category'],
      limit: 15,
    },
    title: 'Large Dataset (15 points)',
    valueFormat: (val) => `$${(val / 1000).toFixed(0)}K`,
    height: 600,
  },
  parameters: {
    mockData: [
      { 'Revenue.category': 'Starting', 'Revenue.amount': 1000000 },
      { 'Revenue.category': 'Product A', 'Revenue.amount': 150000 },
      { 'Revenue.category': 'Product B', 'Revenue.amount': 120000 },
      { 'Revenue.category': 'Product C', 'Revenue.amount': -50000 },
      { 'Revenue.category': 'Product D', 'Revenue.amount': 90000 },
      { 'Revenue.category': 'Product E', 'Revenue.amount': -30000 },
      { 'Revenue.category': 'Product F', 'Revenue.amount': 70000 },
      { 'Revenue.category': 'Product G', 'Revenue.amount': 60000 },
      { 'Revenue.category': 'Product H', 'Revenue.amount': -40000 },
      { 'Revenue.category': 'Product I', 'Revenue.amount': 80000 },
      { 'Revenue.category': 'Product J', 'Revenue.amount': 45000 },
      { 'Revenue.category': 'Product K', 'Revenue.amount': -25000 },
      { 'Revenue.category': 'Product L', 'Revenue.amount': 35000 },
      { 'Revenue.category': 'Product M', 'Revenue.amount': 55000 },
    ],
  },
};
