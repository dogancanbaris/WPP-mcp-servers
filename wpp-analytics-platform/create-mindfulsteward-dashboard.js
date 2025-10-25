#!/usr/bin/env node
/**
 * Create MindfulSteward Dashboard with New Architecture
 * Uses Direct BigQuery API (no Cube.js)
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yobpdwgxmsbkmgwmxqab.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvYnBkd2d4bXNia21nd214cWFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTIxNDM5OSwiZXhwIjoyMDQ0NzkwMzk5fQ.kLy6YzGr2ufWpEh3S_bR8CtYHUKEb90Qb2nBfmqagGo';

const dashboardConfig = {
  title: 'MindfulSteward Organic Search Performance',
  description: 'Real-time SEO performance dashboard powered by BigQuery',
  rows: [
    // Row 1: Header
    {
      id: 'row-1',
      columns: [
        {
          id: 'col-1-1',
          width: '3/4',
          component: {
            id: 'header-title',
            type: 'title',
            title: '🧘 MindfulSteward Organic Search Performance',
            titleColor: '#ffffff',
            titleBackgroundColor: '#191D63',
            titleFontSize: '28',
            titleFontWeight: '700',
            titleAlignment: 'left',
            padding: 20,
            borderRadius: 8
          }
        },
        {
          id: 'col-1-2',
          width: '1/4',
          component: {
            id: 'header-date',
            type: 'title',
            title: '📅 Last 90 Days',
            titleColor: '#ffffff',
            titleBackgroundColor: '#191D63',
            titleFontSize: '16',
            titleFontWeight: '600',
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
            title: '📄 About This Report\\n\\nReal-time SEO performance for MindfulSteward.com powered by Google Search Console data. This dashboard demonstrates the new BigQuery-direct architecture with NO Cube.js dependency.',
            titleColor: '#5f6368',
            titleBackgroundColor: '#f8f9fa',
            titleFontSize: '14',
            titleFontWeight: '400',
            padding: 24,
            borderRadius: 8
          }
        }
      ]
    },

    // Row 3: 4 Scorecards
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
            platform: 'gsc',
            metrics: ['impressions'],
            dateRange: ['2025-10-17', '2025-10-23'],
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
            platform: 'gsc',
            metrics: ['clicks'],
            dateRange: ['2025-10-17', '2025-10-23'],
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
            platform: 'gsc',
            metrics: ['position'],
            dateRange: ['2025-10-17', '2025-10-23'],
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
            title: 'CTR',
            platform: 'gsc',
            metrics: ['ctr'],
            dateRange: ['2025-10-17', '2025-10-23'],
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
            title: 'Performance Trend',
            platform: 'gsc',
            dimension: 'date',
            metrics: ['clicks', 'impressions'],
            dateRange: ['2025-10-17', '2025-10-23'],
            showLegend: true,
            chartColors: ['#191D63', '#1E8E3E'],
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 20
          }
        }
      ]
    },

    // Row 5: Device Pie Chart
    {
      id: 'row-5',
      columns: [
        {
          id: 'col-5-1',
          width: '1/1',
          component: {
            id: 'pie-device',
            type: 'pie_chart',
            title: 'Traffic by Device',
            platform: 'gsc',
            dimension: 'device',
            metrics: ['clicks'],
            dateRange: ['2025-10-17', '2025-10-23'],
            showLegend: true,
            chartColors: ['#191D63', '#1E8E3E', '#fac858'],
            backgroundColor: '#ffffff',
            showBorder: true,
            borderRadius: 8,
            padding: 16
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
  }
};

async function createDashboard() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('🎨 Creating MindfulSteward dashboard with new architecture...');

  const { data, error } = await supabase
    .from('dashboards')
    .insert([{
      name: dashboardConfig.title,
      description: dashboardConfig.description,
      config: dashboardConfig,
      workspace_id: '4d2a6c8e-8f3a-4b5c-9d1e-2f4a7c9b1e3d' // Default workspace
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating dashboard:', error);
    process.exit(1);
  }

  console.log('✅ Dashboard created successfully!');
  console.log('📊 Dashboard ID:', data.id);
  console.log('🔗 URL: http://localhost:3000/dashboard/' + data.id + '/builder');
  console.log('\n🎉 New Architecture Features:');
  console.log('  - No Cube.js dependency');
  console.log('  - Direct BigQuery queries');
  console.log('  - Backend handles all data logic');
  console.log('  - Frontend is dumb renderer');
}

createDashboard();
