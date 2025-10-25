/**
 * Dashboard Creation API
 *
 * POST /api/dashboards/create
 *
 * Creates a dashboard from a template or custom configuration.
 * Handles dataset registration and dashboard config generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Load templates
const TEMPLATES: any = {
  seo_overview: {
    id: 'seo_overview',
    name: 'SEO Overview',
    rows: [
      // Header row
      {
        id: 'row-header',
        height: 'auto',
        minHeight: '60px',
        columns: [
          {
            id: 'col-header-title',
            width: '3/4',
            component: {
              type: 'title',
              title: '{{TITLE}}',
              titleColor: '#ffffff',
              titleBackgroundColor: '#191D63',
              titleFontSize: '24',
              titleFontWeight: '700',
              titleAlignment: 'left',
              padding: 16,
              borderRadius: 8
            }
          },
          {
            id: 'col-header-date',
            width: '1/4',
            component: {
              type: 'title',
              title: '📅 Date Range',
              titleColor: '#ffffff',
              titleBackgroundColor: '#191D63',
              titleFontSize: '16',
              titleFontWeight: '600',
              titleAlignment: 'right',
              padding: 16,
              borderRadius: 8
            }
          }
        ]
      },
      // Description row
      {
        id: 'row-description',
        height: 'auto',
        minHeight: '80px',
        columns: [
          {
            id: 'col-description',
            width: '1/1',
            component: {
              type: 'title',
              title: '📄 About This Report\n\nThis dashboard provides comprehensive SEO performance powered by Google Search Console data.',
              titleColor: '#5f6368',
              titleBackgroundColor: '#f8f9fa',
              titleFontSize: '13',
              titleFontWeight: '400',
              titleAlignment: 'left',
              padding: 20,
              borderRadius: 8
            }
          }
        ]
      },
      // Scorecards row
      {
        id: 'row-scorecards',
        height: 'auto',
        minHeight: '120px',
        columns: [
          { id: 'col-sc-1', width: '1/4', component: { type: 'scorecard', title: 'Total Impressions', dataset_id: '{{DATASET_ID}}', metrics: ['impressions'], dateRange: '{{DATE_RANGE}}' }},
          { id: 'col-sc-2', width: '1/4', component: { type: 'scorecard', title: 'Total Clicks', dataset_id: '{{DATASET_ID}}', metrics: ['clicks'], dateRange: '{{DATE_RANGE}}' }},
          { id: 'col-sc-3', width: '1/4', component: { type: 'scorecard', title: 'Avg Position', dataset_id: '{{DATASET_ID}}', metrics: ['position'], dateRange: '{{DATE_RANGE}}' }},
          { id: 'col-sc-4', width: '1/4', component: { type: 'scorecard', title: 'Click-Through Rate', dataset_id: '{{DATASET_ID}}', metrics: ['ctr'], dateRange: '{{DATE_RANGE}}' }}
        ]
      },
      // Time series row
      {
        id: 'row-timeseries',
        height: '480px',
        columns: [
          { id: 'col-ts', width: '1/1', component: { type: 'time_series', title: 'Performance Trend', dataset_id: '{{DATASET_ID}}', dimension: 'date', metrics: ['clicks', 'impressions'], dateRange: '{{DATE_RANGE}}' }}
        ]
      },
      // Tables row
      {
        id: 'row-tables',
        height: '420px',
        columns: [
          { id: 'col-tbl-1', width: '1/2', component: { type: 'table', title: 'Top Landing Pages', dataset_id: '{{DATASET_ID}}', dimension: 'page', metrics: ['clicks', 'impressions', 'ctr'], dateRange: '{{DATE_RANGE}}' }},
          { id: 'col-tbl-2', width: '1/2', component: { type: 'table', title: 'Top Search Queries', dataset_id: '{{DATASET_ID}}', dimension: 'query', metrics: ['clicks', 'impressions', 'position'], dateRange: '{{DATE_RANGE}}' }}
        ]
      },
      // Pies row
      {
        id: 'row-pies',
        height: '380px',
        columns: [
          { id: 'col-pie-1', width: '1/2', component: { type: 'pie_chart', title: 'Traffic by Device', dataset_id: '{{DATASET_ID}}', dimension: 'device', metrics: ['clicks'], dateRange: '{{DATE_RANGE}}' }},
          { id: 'col-pie-2', width: '1/2', component: { type: 'pie_chart', title: 'Traffic by Country', dataset_id: '{{DATASET_ID}}', dimension: 'country', metrics: ['clicks'], dateRange: '{{DATE_RANGE}}' }}
        ]
      }
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bigqueryTable, template, title, dateRange, platform, rows: customRows, workspace_id } = body;

    if (!bigqueryTable) {
      return NextResponse.json(
        { error: 'bigqueryTable required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const workspaceId = workspace_id || '945907d8-7e88-45c4-8fde-9db35d5f5ce2';

    // STEP 1: Register dataset if not already registered
    const [projectId, datasetId, tableId] = bigqueryTable.split('.');

    const { data: existingDataset } = await supabase
      .from('datasets')
      .select('id')
      .eq('bigquery_table_id', tableId)
      .single();

    let datasetId_uuid: string;

    if (existingDataset) {
      datasetId_uuid = existingDataset.id;
    } else {
      // Register new dataset
      const registerResponse = await fetch(`http://localhost:3000/api/datasets/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title || 'Dashboard Dataset',
          bigquery_table: bigqueryTable,
          platform: platform || 'gsc',
          workspace_id: workspaceId
        })
      });

      const registerData = await registerResponse.json();
      if (!registerData.success) {
        throw new Error(`Failed to register dataset: ${registerData.error}`);
      }

      datasetId_uuid = registerData.dataset.id;
    }

    // STEP 2: Load template or use custom rows
    let dashboardRows;

    if (template && TEMPLATES[template]) {
      dashboardRows = JSON.parse(JSON.stringify(TEMPLATES[template].rows));

      // Replace template variables
      const replaceInObject = (obj: any) => {
        if (typeof obj === 'string') {
          return obj
            .replace(/\{\{DATASET_ID\}\}/g, datasetId_uuid)
            .replace(/\{\{DATE_RANGE\}\}/g, JSON.stringify(dateRange))
            .replace(/\{\{TITLE\}\}/g, title || TEMPLATES[template].name);
        }
        if (Array.isArray(obj)) {
          return obj.map(replaceInObject);
        }
        if (obj && typeof obj === 'object') {
          const newObj: any = {};
          for (const key in obj) {
            newObj[key] = replaceInObject(obj[key]);
          }
          return newObj;
        }
        return obj;
      };

      dashboardRows = replaceInObject(dashboardRows);
    } else if (customRows) {
      dashboardRows = customRows;
    } else {
      return NextResponse.json(
        { error: 'Either template or rows required' },
        { status: 400 }
      );
    }

    // STEP 3: Create dashboard
    const dashboardId = crypto.randomUUID();

    const { error } = await supabase
      .from('dashboards')
      .insert([{
        id: dashboardId,
        name: title || (template ? TEMPLATES[template].name : 'Custom Dashboard'),
        description: `Dashboard for ${platform || 'platform'} data`,
        workspace_id: workspaceId,
        dataset_id: datasetId_uuid,
        config: {
          title: title || TEMPLATES[template]?.name,
          rows: dashboardRows,
          theme: {
            primaryColor: '#191D63',
            backgroundColor: '#ffffff',
            textColor: '#111827',
            borderColor: '#e5e7eb'
          }
        }
      }]);

    if (error) {
      return NextResponse.json(
        { error: `Failed to create dashboard: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dashboard_id: dashboardId,
      dashboard_url: `/dashboard/${dashboardId}/builder`,
      view_url: `/dashboard/${dashboardId}/view`,
      dataset_id: datasetId_uuid
    });

  } catch (error) {
    console.error('[Dashboard Create API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
