/**
 * Pre-built Dashboard Templates
 *
 * Ready-to-use dashboard templates for common use cases.
 */

import type { DashboardTemplate } from './types.js';

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'seo_overview',
    name: 'SEO Overview',
    description: 'Comprehensive SEO dashboard with header, 4 scorecards, time series, and comparison charts',
    datasource: 'gsc_performance_7days',
    rows: [
      {
        id: 'row-header',
        columns: [
          {
            id: 'col-title',
            width: '3/4',
            component: {
              type: 'title',
              title: 'SEO Performance Overview',
            },
          },
          {
            id: 'col-date-filter',
            width: '1/4',
            component: {
              type: 'date_filter',
            },
          },
        ],
      },
      {
        id: 'row-scorecards',
        columns: [
          {
            id: 'col-clicks',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Total Clicks',
              metrics: ['clicks'],
            },
          },
          {
            id: 'col-impressions',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Total Impressions',
              metrics: ['impressions'],
            },
          },
          {
            id: 'col-ctr',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Average CTR',
              metrics: ['ctr'],
            },
          },
          {
            id: 'col-position',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Average Position',
              metrics: ['position'],
            },
          },
        ],
      },
      {
        id: 'row-timeseries',
        columns: [
          {
            id: 'col-trend',
            width: '1/1',
            component: {
              type: 'time_series',
              title: 'Performance Trend',
              dimension: 'date',
              metrics: ['clicks', 'impressions'],
              chartConfig: {
                showLegend: true,
                showDataLabels: false,
              },
            },
          },
        ],
      },
      {
        id: 'row-comparison',
        columns: [
          {
            id: 'col-pages',
            width: '1/2',
            component: {
              type: 'bar_chart',
              title: 'Top Pages by Clicks',
              dimension: 'page',
              metrics: ['clicks'],
              chartConfig: {
                orientation: 'horizontal',
              },
            },
          },
          {
            id: 'col-queries',
            width: '1/2',
            component: {
              type: 'bar_chart',
              title: 'Top Queries by Impressions',
              dimension: 'query',
              metrics: ['impressions'],
              chartConfig: {
                orientation: 'horizontal',
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: 'campaign_performance',
    name: 'Campaign Performance',
    description: 'Marketing campaign dashboard with 6 scorecards and detailed charts',
    datasource: 'google_ads_campaign_stats',
    rows: [
      {
        id: 'row-header',
        columns: [
          {
            id: 'col-title',
            width: '3/4',
            component: {
              type: 'title',
              title: 'Campaign Performance Dashboard',
            },
          },
          {
            id: 'col-date-filter',
            width: '1/4',
            component: {
              type: 'date_filter',
            },
          },
        ],
      },
      {
        id: 'row-kpis-1',
        columns: [
          {
            id: 'col-spend',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Total Spend',
              metrics: ['cost'],
            },
          },
          {
            id: 'col-conversions',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Conversions',
              metrics: ['conversions'],
            },
          },
          {
            id: 'col-roas',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'ROAS',
              metrics: ['roas'],
            },
          },
        ],
      },
      {
        id: 'row-kpis-2',
        columns: [
          {
            id: 'col-clicks',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Total Clicks',
              metrics: ['clicks'],
            },
          },
          {
            id: 'col-ctr',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Click-Through Rate',
              metrics: ['ctr'],
            },
          },
          {
            id: 'col-cpc',
            width: '1/3',
            component: {
              type: 'scorecard',
              title: 'Cost per Click',
              metrics: ['cpc'],
            },
          },
        ],
      },
      {
        id: 'row-charts',
        columns: [
          {
            id: 'col-spend-trend',
            width: '1/2',
            component: {
              type: 'area_chart',
              title: 'Daily Spend Trend',
              dimension: 'date',
              metrics: ['cost'],
            },
          },
          {
            id: 'col-conversions-trend',
            width: '1/2',
            component: {
              type: 'area_chart',
              title: 'Daily Conversions',
              dimension: 'date',
              metrics: ['conversions'],
            },
          },
        ],
      },
      {
        id: 'row-breakdown',
        columns: [
          {
            id: 'col-campaigns',
            width: '1/1',
            component: {
              type: 'table',
              title: 'Campaign Breakdown',
              dimension: 'campaign_name',
              metrics: ['clicks', 'impressions', 'cost', 'conversions', 'roas'],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'analytics_overview',
    name: 'Analytics Overview',
    description: 'Google Analytics dashboard with user behavior and traffic analysis',
    datasource: 'google_analytics_sessions',
    rows: [
      {
        id: 'row-header',
        columns: [
          {
            id: 'col-title',
            width: '3/4',
            component: {
              type: 'title',
              title: 'Website Analytics Overview',
            },
          },
          {
            id: 'col-date-filter',
            width: '1/4',
            component: {
              type: 'date_filter',
            },
          },
        ],
      },
      {
        id: 'row-scorecards',
        columns: [
          {
            id: 'col-users',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Total Users',
              metrics: ['users'],
            },
          },
          {
            id: 'col-sessions',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Sessions',
              metrics: ['sessions'],
            },
          },
          {
            id: 'col-bounce-rate',
            width: '1/4',
            component: {
              type: 'gauge',
              title: 'Bounce Rate',
              metrics: ['bounce_rate'],
            },
          },
          {
            id: 'col-avg-duration',
            width: '1/4',
            component: {
              type: 'scorecard',
              title: 'Avg. Session Duration',
              metrics: ['avg_session_duration'],
            },
          },
        ],
      },
      {
        id: 'row-traffic',
        columns: [
          {
            id: 'col-traffic-trend',
            width: '2/3',
            component: {
              type: 'area_chart',
              title: 'Traffic Trend',
              dimension: 'date',
              metrics: ['users', 'sessions'],
            },
          },
          {
            id: 'col-traffic-sources',
            width: '1/3',
            component: {
              type: 'pie_chart',
              title: 'Traffic Sources',
              dimension: 'source',
              metrics: ['sessions'],
            },
          },
        ],
      },
      {
        id: 'row-behavior',
        columns: [
          {
            id: 'col-top-pages',
            width: '1/2',
            component: {
              type: 'bar_chart',
              title: 'Top Landing Pages',
              dimension: 'landing_page',
              metrics: ['sessions'],
              chartConfig: {
                orientation: 'horizontal',
              },
            },
          },
          {
            id: 'col-devices',
            width: '1/2',
            component: {
              type: 'pie_chart',
              title: 'Device Distribution',
              dimension: 'device_category',
              metrics: ['sessions'],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Dashboard',
    description: 'Empty canvas to build your custom dashboard from scratch',
    datasource: 'gsc_performance_7days',
    rows: [
      {
        id: 'row-header',
        columns: [
          {
            id: 'col-title',
            width: '3/4',
            component: {
              type: 'title',
              title: 'New Dashboard',
            },
          },
          {
            id: 'col-date-filter',
            width: '1/4',
            component: {
              type: 'date_filter',
            },
          },
        ],
      },
    ],
  },
];
