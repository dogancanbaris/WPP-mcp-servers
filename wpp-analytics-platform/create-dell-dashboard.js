#!/usr/bin/env node
/**
 * Create Dell Concept Dashboard Directly in Supabase
 *
 * Run: node create-dell-dashboard.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nbjlehblqctblhpbwgry.supabase.co';
const supabaseKey = 'sb_secret_0zts4N-yamqVK2cGYOB1CA_u05lhtCG'; // Service role key

const supabase = createClient(supabaseUrl, supabaseKey);

const dashboardConfig = {
  title: 'Dell Organic Search Performance Report',
  description: 'Comprehensive SEO performance dashboard for leadership presentation',
  rows: [
    // Row 1: Header with Title + Date Filter
    {
      id: 'row-1',
      columns: [
        {
          id: 'col-1-1',
          width: '3/4',
          component: {
            id: 'title-header',
            type: 'title',
            title: '🔍 Dell Organic Search Performance Report',
            showTitle: true,
            titleFontSize: '28',
            titleFontWeight: '700',
            titleColor: '#ffffff',
            titleBackgroundColor: '#191D63',
            titleAlignment: 'left',
            padding: 20,
            borderRadius: 8
          }
        },
        {
          id: 'col-1-2',
          width: '1/4',
          component: {
            id: 'date-filter',
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

    // Row 2: Description
    {
      id: 'row-2',
      columns: [
        {
          id: 'col-2-1',
          width: '1/1',
          component: {
            id: 'description',
            type: 'title',
            title: '📄 About This Report\n\nThis dashboard provides a comprehensive view of Dell\'s organic search performance over the past 3 months. Data sourced from Google Search Console includes:\n\n• Search impressions and clicks across all Dell properties  • Average position in search results  • Click-through rates by query, page, device, and geography  • Performance trends and top-performing content',
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

    // Row 3: Scorecards
    {
      id: 'row-3',
      columns: [
        {
          id: 'col-3-1',
          width: '1/4',
          component: {
            id: 'scorecard-impressions',
            type: 'scorecard',
            title: 'Total Impressions',
            metrics: ['impressions'],
            showTitle: true,
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16
          }
        },
        {
          id: 'col-3-2',
          width: '1/4',
          component: {
            id: 'scorecard-clicks',
            type: 'scorecard',
            title: 'Total Clicks',
            metrics: ['clicks'],
            showTitle: true,
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16
          }
        },
        {
          id: 'col-3-3',
          width: '1/4',
          component: {
            id: 'scorecard-position',
            type: 'scorecard',
            title: 'Avg Position',
            metrics: ['position'],
            showTitle: true,
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16
          }
        },
        {
          id: 'col-3-4',
          width: '1/4',
          component: {
            id: 'scorecard-ctr',
            type: 'scorecard',
            title: 'Click-Through Rate',
            metrics: ['ctr'],
            showTitle: true,
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16
          }
        }
      ]
    },

    // Row 4: Time Series
    {
      id: 'row-4',
      columns: [
        {
          id: 'col-4-1',
          width: '1/1',
          component: {
            id: 'timeseries-performance',
            type: 'time_series',
            title: 'Performance Trend - Last 3 Months',
            dimension: 'date',
            metrics: ['clicks', 'impressions'],
            showTitle: true,
            titleFontSize: '18',
            titleFontWeight: '600',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 20,
            showLegend: true,
            chartColors: ['#191D63', '#1E8E3E']
          }
        }
      ]
    },

    // Row 5: Tables
    {
      id: 'row-5',
      columns: [
        {
          id: 'col-5-1',
          width: '1/2',
          component: {
            id: 'table-pages',
            type: 'table',
            title: 'Top Landing Pages',
            dimension: 'page',
            metrics: ['clicks', 'impressions', 'ctr'],
            showTitle: true,
            titleFontSize: '16',
            titleFontWeight: '600',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16
          }
        },
        {
          id: 'col-5-2',
          width: '1/2',
          component: {
            id: 'table-queries',
            type: 'table',
            title: 'Top Search Queries',
            dimension: 'query',
            metrics: ['clicks', 'impressions', 'position'],
            showTitle: true,
            titleFontSize: '16',
            titleFontWeight: '600',
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16
          }
        }
      ]
    },

    // Row 6: Pie Charts
    {
      id: 'row-6',
      columns: [
        {
          id: 'col-6-1',
          width: '1/3',
          component: {
            id: 'pie-device',
            type: 'pie_chart',
            title: 'Traffic by Device',
            dimension: 'device',
            metrics: ['clicks'],
            showTitle: true,
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showLegend: true,
            chartColors: ['#191D63', '#1E8E3E', '#fac858']
          }
        },
        {
          id: 'col-6-2',
          width: '1/3',
          component: {
            id: 'pie-country',
            type: 'pie_chart',
            title: 'Traffic by Country',
            dimension: 'country',
            metrics: ['clicks'],
            showTitle: true,
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showLegend: true,
            chartColors: ['#191D63', '#1E8E3E', '#fac858', '#ee6666', '#73c0de']
          }
        },
        {
          id: 'col-6-3',
          width: '1/3',
          component: {
            id: 'pie-category',
            type: 'pie_chart',
            title: 'Content Category',
            dimension: 'page',
            metrics: ['clicks'],
            showTitle: true,
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16,
            showLegend: true,
            chartColors: ['#191D63', '#1E8E3E', '#fac858', '#ee6666']
          }
        }
      ]
    }
  ],
  theme: {
    primaryColor: '#191D63',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderColor: '#e5e7eb'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function createDashboard() {
  try {
    console.log('Creating Dell Concept Dashboard...');

    // First, get or create a workspace
    const { data: workspaceData } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1)
      .single();

    if (!workspaceData) {
      console.error('No workspace found. Please create a workspace first.');
      process.exit(1);
    }

    const { data, error } = await supabase
      .from('dashboards')
      .insert({
        name: dashboardConfig.title,
        description: dashboardConfig.description,
        config: dashboardConfig,
        workspace_id: workspaceData.id,
        bigquery_table: 'gsc_performance_7days'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dashboard:', error);
      process.exit(1);
    }

    console.log('✅ Dashboard created successfully!');
    console.log('Dashboard ID:', data.id);
    console.log('View at: http://localhost:3000/dashboard/' + data.id + '/builder');

  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

createDashboard();
