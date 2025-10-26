/**
 * GET /api/dashboards/fields
 *
 * Returns available data sources and their fields (dimensions + metrics)
 * Used by Setup tab to populate field selectors
 *
 * Response format matches backend-api-specialist's specification:
 * {
 *   sources: [
 *     {
 *       id: "google_search_console",
 *       name: "Google Search Console",
 *       type: "bigquery",
 *       fields: [
 *         { id: "query", name: "Search Query", type: "dimension", dataType: "string" },
 *         { id: "clicks", name: "Clicks", type: "metric", dataType: "number" }
 *       ]
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: In production, this would query:
    // 1. BigQuery INFORMATION_SCHEMA to discover tables/columns
    // 2. Dataset metadata registry for pre-defined dimensions/metrics
    // 3. Cached metadata from database
    //
    // For now, we return mock data that matches the schema database-analytics-architect created

    const sources = [
      {
        id: 'google_search_console',
        name: 'Google Search Console',
        type: 'bigquery',
        fields: [
          // Dimensions
          {
            id: 'query',
            name: 'Search Query',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'The search query performed by the user'
          },
          {
            id: 'page',
            name: 'Landing Page',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'The URL of the landing page'
          },
          {
            id: 'country',
            name: 'Country',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'Country where the search originated'
          },
          {
            id: 'device',
            name: 'Device Type',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'Device used (desktop, mobile, tablet)'
          },
          {
            id: 'date',
            name: 'Date',
            type: 'dimension' as const,
            dataType: 'date',
            description: 'Date of the search impression'
          },
          // Metrics
          {
            id: 'clicks',
            name: 'Clicks',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Number of clicks from search results'
          },
          {
            id: 'impressions',
            name: 'Impressions',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Number of times page appeared in search'
          },
          {
            id: 'ctr',
            name: 'Click-Through Rate',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Clicks divided by impressions (percentage)'
          },
          {
            id: 'position',
            name: 'Average Position',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Average ranking position in search results'
          }
        ]
      },
      {
        id: 'google_ads',
        name: 'Google Ads',
        type: 'bigquery',
        fields: [
          // Dimensions
          {
            id: 'campaign_name',
            name: 'Campaign Name',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'Name of the ad campaign'
          },
          {
            id: 'ad_group_name',
            name: 'Ad Group Name',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'Name of the ad group'
          },
          {
            id: 'keyword',
            name: 'Keyword',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'Keyword triggering the ad'
          },
          {
            id: 'date',
            name: 'Date',
            type: 'dimension' as const,
            dataType: 'date',
            description: 'Date of ad performance'
          },
          // Metrics
          {
            id: 'impressions',
            name: 'Impressions',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Number of times ad was shown'
          },
          {
            id: 'clicks',
            name: 'Clicks',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Number of clicks on the ad'
          },
          {
            id: 'cost',
            name: 'Cost',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Total cost in account currency'
          },
          {
            id: 'conversions',
            name: 'Conversions',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Number of conversions'
          },
          {
            id: 'ctr',
            name: 'Click-Through Rate',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Clicks divided by impressions'
          },
          {
            id: 'cpc',
            name: 'Cost Per Click',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Average cost per click'
          },
          {
            id: 'roas',
            name: 'Return on Ad Spend',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Revenue divided by cost'
          }
        ]
      },
      {
        id: 'google_analytics',
        name: 'Google Analytics 4',
        type: 'bigquery',
        fields: [
          // Dimensions
          {
            id: 'page_path',
            name: 'Page Path',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'URL path of the page'
          },
          {
            id: 'event_name',
            name: 'Event Name',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'Name of the tracked event'
          },
          {
            id: 'source',
            name: 'Traffic Source',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'Source of the traffic'
          },
          {
            id: 'medium',
            name: 'Traffic Medium',
            type: 'dimension' as const,
            dataType: 'string',
            description: 'Medium of the traffic'
          },
          {
            id: 'date',
            name: 'Date',
            type: 'dimension' as const,
            dataType: 'date',
            description: 'Date of the event'
          },
          // Metrics
          {
            id: 'sessions',
            name: 'Sessions',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Number of sessions'
          },
          {
            id: 'users',
            name: 'Users',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Number of unique users'
          },
          {
            id: 'pageviews',
            name: 'Pageviews',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Total number of pageviews'
          },
          {
            id: 'bounce_rate',
            name: 'Bounce Rate',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Percentage of single-page sessions'
          },
          {
            id: 'avg_session_duration',
            name: 'Avg. Session Duration',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Average session length in seconds'
          },
          {
            id: 'goal_completions',
            name: 'Goal Completions',
            type: 'metric' as const,
            dataType: 'number',
            description: 'Number of goal completions'
          }
        ]
      }
    ];

    return NextResponse.json({
      sources
    });

  } catch (error) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
