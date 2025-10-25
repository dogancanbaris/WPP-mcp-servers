/**
 * Create Dell Organic Search Performance Concept Dashboard
 *
 * This script creates a professional demo dashboard for leadership presentation
 * Shows what the platform can do with realistic Dell SEO data
 */

const dashboardConfig = {
  id: 'dell-concept-demo',
  title: 'Dell Organic Search Performance Report',
  description: 'Comprehensive SEO performance dashboard for Dell.com',
  rows: [
    // Row 1: Header with Title + Date Filter
    {
      id: 'row-header',
      columns: [
        {
          id: 'col-title',
          width: '3/4',
          component: {
            id: 'comp-title',
            type: 'title',
            title: '🔍 Dell Organic Search Performance Report',
            showTitle: true,
            titleFontSize: '28',
            titleFontWeight: '700',
            titleColor: '#ffffff',
            titleBackgroundColor: '#191D63',  // WPP Blue
            titleAlignment: 'left',
            padding: 20,
            borderRadius: 8
          }
        },
        {
          id: 'col-date',
          width: '1/4',
          component: {
            id: 'comp-date-text',
            type: 'title',
            title: '📅 Last 3 Months',
            showTitle: true,
            titleFontSize: '16',
            titleFontWeight: '600',
            titleColor: '#ffffff',
            titleBackgroundColor: '#191D63',
            titleAlignment: 'right',
            padding: 20,
            borderRadius: 8
          }
        }
      ]
    },

    // Row 2: Report Description
    {
      id: 'row-description',
      columns: [
        {
          id: 'col-desc',
          width: '1/1',
          component: {
            id: 'comp-desc',
            type: 'title',
            title: '📄 About This Report\n\nThis dashboard provides a comprehensive view of Dell\'s organic search performance over the past 3 months. Data is sourced from Google Search Console and includes:\n\n• Search impressions and clicks across all Dell properties\n• Average position in search results\n• Click-through rates by query, page, device, and geography\n• Performance trends and top-performing content',
            showTitle: true,
            titleFontSize: '14',
            titleFontWeight: '400',
            titleColor: '#5f6368',
            titleBackgroundColor: '#f8f9fa',
            titleAlignment: 'left',
            padding: 24,
            borderRadius: 8
          }
        }
      ]
    },

    // Row 3: KPI Scorecards
    {
      id: 'row-kpis',
      columns: [
        {
          id: 'col-impressions',
          width: '1/4',
          component: {
            id: 'comp-impressions',
            type: 'scorecard',
            title: 'Total Impressions',
            metrics: ['impressions'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '14',
            titleColor: '#5f6368',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showShadow: true
          }
        },
        {
          id: 'col-clicks',
          width: '1/4',
          component: {
            id: 'comp-clicks',
            type: 'scorecard',
            title: 'Total Clicks',
            metrics: ['clicks'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '14',
            titleColor: '#5f6368',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showShadow: true
          }
        },
        {
          id: 'col-position',
          width: '1/4',
          component: {
            id: 'comp-position',
            type: 'scorecard',
            title: 'Avg Position',
            metrics: ['position'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '14',
            titleColor: '#5f6368',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showShadow: true
          }
        },
        {
          id: 'col-ctr',
          width: '1/4',
          component: {
            id: 'comp-ctr',
            type: 'scorecard',
            title: 'Click-Through Rate',
            metrics: ['ctr'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '14',
            titleColor: '#5f6368',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showShadow: true
          }
        }
      ]
    },

    // Row 4: Time Series Chart
    {
      id: 'row-timeseries',
      columns: [
        {
          id: 'col-timeseries',
          width: '1/1',
          component: {
            id: 'comp-timeseries',
            type: 'time_series',
            title: 'Performance Trend - Last 3 Months',
            dimension: 'date',
            metrics: ['clicks', 'impressions'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '18',
            titleFontWeight: '600',
            titleColor: '#111827',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 20,
            showLegend: true,
            showShadow: true,
            chartColors: ['#191D63', '#1E8E3E']  // WPP Blue + Green
          }
        }
      ]
    },

    // Row 5: Data Tables
    {
      id: 'row-tables',
      columns: [
        {
          id: 'col-pages',
          width: '1/2',
          component: {
            id: 'comp-pages',
            type: 'table',
            title: 'Top Landing Pages',
            dimension: 'page',
            metrics: ['clicks', 'impressions', 'ctr'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '16',
            titleFontWeight: '600',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showShadow: true
          }
        },
        {
          id: 'col-queries',
          width: '1/2',
          component: {
            id: 'comp-queries',
            type: 'table',
            title: 'Top Search Queries',
            dimension: 'query',
            metrics: ['clicks', 'impressions', 'position'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '16',
            titleFontWeight: '600',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showShadow: true
          }
        }
      ]
    },

    // Row 6: Pie Charts
    {
      id: 'row-pies',
      columns: [
        {
          id: 'col-device',
          width: '1/3',
          component: {
            id: 'comp-device',
            type: 'pie_chart',
            title: 'Traffic by Device',
            dimension: 'device',
            metrics: ['clicks'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '16',
            titleFontWeight: '600',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showLegend: true,
            showShadow: true,
            chartColors: ['#191D63', '#1E8E3E', '#fac858']
          }
        },
        {
          id: 'col-country',
          width: '1/3',
          component: {
            id: 'comp-country',
            type: 'pie_chart',
            title: 'Traffic by Country',
            dimension: 'country',
            metrics: ['clicks'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '16',
            titleFontWeight: '600',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showLegend: true,
            showShadow: true,
            chartColors: ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de']
          }
        },
        {
          id: 'col-pagetype',
          width: '1/3',
          component: {
            id: 'comp-pagetype',
            type: 'pie_chart',
            title: 'Traffic by Page Category',
            dimension: 'page',  // We'll show top pages as categories
            metrics: ['clicks'],
            datasource: 'gsc_performance_7days',
            dateRange: { type: 'preset', preset: 'last90days' },
            showTitle: true,
            titleFontSize: '16',
            titleFontWeight: '600',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showLegend: true,
            showShadow: true,
            chartColors: ['#191D63', '#1E8E3E', '#fac858', '#ee6666']
          }
        }
      ]
    }
  ],
  theme: {
    primaryColor: '#191D63',  // WPP Blue
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderColor: '#e5e7eb'
  }
};

// Save to file for programmatic creation
console.log(JSON.stringify(dashboardConfig, null, 2));
