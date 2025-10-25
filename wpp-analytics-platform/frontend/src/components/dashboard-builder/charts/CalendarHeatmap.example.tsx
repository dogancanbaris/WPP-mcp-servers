'use client';

import React from 'react';
import { CalendarHeatmap } from './CalendarHeatmap';

/**
 * CalendarHeatmap Component Examples
 *
 * Demonstrates various use cases and configurations for the CalendarHeatmap component.
 */

// Example 1: GitHub-Style Contribution Calendar
export const ContributionCalendar = () => (
  <CalendarHeatmap
    title="Daily Activity Contributions"
    datasource="user_activity"
    dimension="user_activity.date"
    metrics={['user_activity.contributions']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31',
    }}
    metricsConfig={[
      {
        id: 'user_activity.contributions',
        name: 'Contributions',
        format: 'number',
        decimals: 0,
        compact: false,
        alignment: 'left',
        textColor: '#111827',
        fontWeight: '400',
        showComparison: false,
        showBars: false,
      },
    ]}
    chartColors={[
      '#ebedf0', // No activity
      '#9be9a8', // Low
      '#40c463', // Medium
      '#30a14e', // High
      '#216e39', // Very high
    ]}
  />
);

// Example 2: Search Console Daily Clicks
export const GSCClicksCalendar = () => (
  <CalendarHeatmap
    title="Search Console Daily Clicks - 2025"
    datasource="gsc_performance"
    dimension="gsc_performance.date"
    metrics={['gsc_performance.clicks']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31',
    }}
    metricsConfig={[
      {
        id: 'gsc_performance.clicks',
        name: 'Clicks',
        format: 'number',
        decimals: 0,
        compact: true,
        alignment: 'left',
        textColor: '#111827',
        fontWeight: '400',
        showComparison: false,
        showBars: false,
      },
    ]}
    chartColors={[
      '#f3f4f6', // No clicks
      '#dbeafe', // Low
      '#93c5fd', // Medium
      '#3b82f6', // High
      '#1e40af', // Very high
    ]}
    backgroundColor="#ffffff"
    showBorder={true}
    borderColor="#e5e7eb"
  />
);

// Example 3: Google Ads Daily Spend
export const AdsSpendCalendar = () => (
  <CalendarHeatmap
    title="Daily Ad Spend Calendar"
    datasource="google_ads"
    dimension="google_ads.date"
    metrics={['google_ads.cost']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31',
    }}
    filters={[
      {
        field: 'google_ads.campaign_status',
        operator: 'equals',
        values: ['ENABLED'],
      },
    ]}
    metricsConfig={[
      {
        id: 'google_ads.cost',
        name: 'Cost',
        format: 'currency',
        decimals: 2,
        compact: false,
        alignment: 'left',
        textColor: '#111827',
        fontWeight: '400',
        showComparison: false,
        showBars: false,
      },
    ]}
    chartColors={[
      '#fef3c7', // Low spend
      '#fde68a', // Medium-low
      '#fcd34d', // Medium
      '#fbbf24', // Medium-high
      '#f59e0b', // High spend
    ]}
  />
);

// Example 4: Analytics Daily Sessions
export const SessionsCalendar = () => (
  <CalendarHeatmap
    title="Daily Website Sessions"
    datasource="google_analytics"
    dimension="google_analytics.date"
    metrics={['google_analytics.sessions']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31',
    }}
    metricsConfig={[
      {
        id: 'google_analytics.sessions',
        name: 'Sessions',
        format: 'number',
        decimals: 0,
        compact: true,
        alignment: 'left',
        textColor: '#111827',
        fontWeight: '400',
        showComparison: false,
        showBars: false,
      },
    ]}
    chartColors={[
      '#fce7f3', // Very low
      '#fbcfe8', // Low
      '#f9a8d4', // Medium
      '#f472b6', // High
      '#ec4899', // Very high
    ]}
    backgroundColor="#fafafa"
    showBorder={true}
    borderColor="#d1d5db"
    borderWidth={2}
    borderRadius={12}
  />
);

// Example 5: Multi-Year View (Past 2 Years)
export const TwoYearCalendar = () => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <div className="space-y-4">
      <CalendarHeatmap
        title={`Search Performance ${currentYear}`}
        datasource="gsc_performance"
        dimension="gsc_performance.date"
        metrics={['gsc_performance.impressions']}
        dateRange={{
          start: `${currentYear}-01-01`,
          end: `${currentYear}-12-31`,
        }}
        metricsConfig={[
          {
            id: 'gsc_performance.impressions',
            name: 'Impressions',
            format: 'number',
            decimals: 0,
            compact: true,
            alignment: 'left',
            textColor: '#111827',
            fontWeight: '400',
            showComparison: false,
            showBars: false,
          },
        ]}
      />

      <CalendarHeatmap
        title={`Search Performance ${previousYear}`}
        datasource="gsc_performance"
        dimension="gsc_performance.date"
        metrics={['gsc_performance.impressions']}
        dateRange={{
          start: `${previousYear}-01-01`,
          end: `${previousYear}-12-31`,
        }}
        metricsConfig={[
          {
            id: 'gsc_performance.impressions',
            name: 'Impressions',
            format: 'number',
            decimals: 0,
            compact: true,
            alignment: 'left',
            textColor: '#111827',
            fontWeight: '400',
            showComparison: false,
            showBars: false,
          },
        ]}
      />
    </div>
  );
};

// Example 6: Custom Color Scheme (Dark Mode)
export const DarkModeCalendar = () => (
  <CalendarHeatmap
    title="Dark Theme Calendar"
    datasource="gsc_performance"
    dimension="gsc_performance.date"
    metrics={['gsc_performance.clicks']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31',
    }}
    metricsConfig={[
      {
        id: 'gsc_performance.clicks',
        name: 'Clicks',
        format: 'number',
        decimals: 0,
        compact: false,
        alignment: 'left',
        textColor: '#f3f4f6',
        fontWeight: '400',
        showComparison: false,
        showBars: false,
      },
    ]}
    chartColors={[
      '#1f2937', // No data
      '#374151', // Low
      '#4b5563', // Medium
      '#6b7280', // High
      '#9ca3af', // Very high
    ]}
    backgroundColor="#111827"
    titleColor="#f3f4f6"
    showBorder={true}
    borderColor="#374151"
    showShadow={true}
    shadowColor="#000000"
    shadowBlur={20}
  />
);

// Example 7: Conversion Rate Calendar
export const ConversionRateCalendar = () => (
  <CalendarHeatmap
    title="Daily Conversion Rate"
    datasource="google_ads"
    dimension="google_ads.date"
    metrics={['google_ads.conversion_rate']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31',
    }}
    metricsConfig={[
      {
        id: 'google_ads.conversion_rate',
        name: 'Conversion Rate',
        format: 'percent',
        decimals: 2,
        compact: false,
        alignment: 'left',
        textColor: '#111827',
        fontWeight: '400',
        showComparison: false,
        showBars: false,
      },
    ]}
    chartColors={[
      '#fee2e2', // Very low
      '#fecaca', // Low
      '#fca5a5', // Medium
      '#f87171', // High
      '#ef4444', // Very high
    ]}
  />
);

// Example 8: Year-over-Year Comparison (Side by Side)
export const YoYComparisonCalendars = () => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CalendarHeatmap
        title={`${currentYear} Performance`}
        datasource="gsc_performance"
        dimension="gsc_performance.date"
        metrics={['gsc_performance.clicks']}
        dateRange={{
          start: `${currentYear}-01-01`,
          end: `${currentYear}-12-31`,
        }}
        metricsConfig={[
          {
            id: 'gsc_performance.clicks',
            name: 'Clicks',
            format: 'number',
            decimals: 0,
            compact: true,
            alignment: 'left',
            textColor: '#111827',
            fontWeight: '400',
            showComparison: false,
            showBars: false,
          },
        ]}
        chartColors={['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']}
      />

      <CalendarHeatmap
        title={`${previousYear} Performance`}
        datasource="gsc_performance"
        dimension="gsc_performance.date"
        metrics={['gsc_performance.clicks']}
        dateRange={{
          start: `${previousYear}-01-01`,
          end: `${previousYear}-12-31`,
        }}
        metricsConfig={[
          {
            id: 'gsc_performance.clicks',
            name: 'Clicks',
            format: 'number',
            decimals: 0,
            compact: true,
            alignment: 'left',
            textColor: '#111827',
            fontWeight: '400',
            showComparison: false,
            showBars: false,
          },
        ]}
        chartColors={['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']}
        backgroundColor="#f9fafb"
      />
    </div>
  );
};

// Example 9: Filtered Calendar (Specific Campaign)
export const FilteredCampaignCalendar = () => (
  <CalendarHeatmap
    title="Campaign-Specific Daily Performance"
    datasource="google_ads"
    dimension="google_ads.date"
    metrics={['google_ads.conversions']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31',
    }}
    filters={[
      {
        field: 'google_ads.campaign_name',
        operator: 'equals',
        values: ['Brand Campaign'],
      },
      {
        field: 'google_ads.campaign_status',
        operator: 'equals',
        values: ['ENABLED'],
      },
    ]}
    metricsConfig={[
      {
        id: 'google_ads.conversions',
        name: 'Conversions',
        format: 'number',
        decimals: 0,
        compact: false,
        alignment: 'left',
        textColor: '#111827',
        fontWeight: '400',
        showComparison: false,
        showBars: false,
      },
    ]}
    chartColors={[
      '#e0f2fe', // No conversions
      '#bae6fd', // Low
      '#7dd3fc', // Medium
      '#38bdf8', // High
      '#0284c7', // Very high
    ]}
  />
);

// Example 10: Compact Calendar (Small Space)
export const CompactCalendar = () => (
  <CalendarHeatmap
    title="Compact View"
    showTitle={true}
    titleFontSize="14"
    datasource="gsc_performance"
    dimension="gsc_performance.date"
    metrics={['gsc_performance.clicks']}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31',
    }}
    metricsConfig={[
      {
        id: 'gsc_performance.clicks',
        name: 'Clicks',
        format: 'number',
        decimals: 0,
        compact: true,
        alignment: 'left',
        textColor: '#111827',
        fontWeight: '400',
        showComparison: false,
        showBars: false,
      },
    ]}
    chartColors={['#f3f4f6', '#dbeafe', '#93c5fd', '#3b82f6', '#1e40af']}
    padding={8}
    borderRadius={6}
    showBorder={true}
    borderWidth={1}
  />
);

// Demo Page
export default function CalendarHeatmapExamples() {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calendar Heatmap Examples</h1>
        <p className="text-gray-600">
          GitHub-style calendar visualizations with Cube.js integration
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Contribution Calendar</h2>
        <ContributionCalendar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">2. Search Console Clicks</h2>
        <GSCClicksCalendar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">3. Daily Ad Spend</h2>
        <AdsSpendCalendar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">4. Website Sessions</h2>
        <SessionsCalendar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Multi-Year View</h2>
        <TwoYearCalendar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">6. Dark Mode</h2>
        <DarkModeCalendar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Conversion Rate</h2>
        <ConversionRateCalendar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">8. Year-over-Year Comparison</h2>
        <YoYComparisonCalendars />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">9. Filtered Campaign</h2>
        <FilteredCampaignCalendar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">10. Compact View</h2>
        <CompactCalendar />
      </section>
    </div>
  );
}
