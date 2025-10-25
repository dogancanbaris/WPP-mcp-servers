import React from 'react';
import { WaterfallChart } from './WaterfallChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Real-world usage examples for WaterfallChart in dashboard contexts
 */

// Example 1: Marketing Dashboard with Revenue Bridge
export function MarketingDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Q1 to Q2 Revenue Analysis</CardTitle>
          <CardDescription>
            Breaking down revenue changes from Q1 to Q2 by component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaterfallChart
            query={{
              measures: ['Revenue.amount'],
              dimensions: ['Revenue.component'],
              timeDimensions: [{
                dimension: 'Revenue.date',
                dateRange: ['2025-01-01', '2025-06-30']
              }],
              order: { 'Revenue.sequenceOrder': 'asc' }
            }}
            startLabel="Q1 Total"
            endLabel="Q2 Total"
            valueFormat={(val) => `$${(val / 1000000).toFixed(1)}M`}
            height={450}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Example 2: Campaign Performance Dashboard
export function CampaignPerformanceDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Budget Utilization</CardTitle>
          <CardDescription>
            How your weekly budget is allocated across active campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaterfallChart
            query={{
              measures: ['GoogleAds.dailyBudget'],
              dimensions: ['GoogleAds.campaignName'],
              filters: [{
                member: 'GoogleAds.status',
                operator: 'equals',
                values: ['ENABLED']
              }],
              timeDimensions: [{
                dimension: 'GoogleAds.date',
                dateRange: 'this week'
              }],
              order: { 'GoogleAds.dailyBudget': 'desc' },
              limit: 10
            }}
            title="Campaign Budget Allocation"
            startLabel="Total Budget"
            endLabel="Remaining"
            valueFormat={(val) => `$${val.toLocaleString()}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CPA Optimization Progress</CardTitle>
          <CardDescription>
            Tracking cost per acquisition improvements over the last 8 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaterfallChart
            query={{
              measures: ['GoogleAds.costPerConversion'],
              dimensions: ['GoogleAds.week'],
              timeDimensions: [{
                dimension: 'GoogleAds.date',
                dateRange: 'last 8 weeks',
                granularity: 'week'
              }],
              order: { 'GoogleAds.date': 'asc' }
            }}
            startLabel="Week 1"
            endLabel="Current Week"
            valueFormat={(val) => `$${val.toFixed(2)}`}
            positiveColor="#ef4444"
            negativeColor="#10b981"
            height={400}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Example 3: E-commerce Funnel Dashboard
export function EcommerceFunnelDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel Drop-off Analysis</CardTitle>
        <CardDescription>
          User progression through checkout process (last 30 days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WaterfallChart
          query={{
            measures: ['Analytics.users'],
            dimensions: ['Analytics.funnelStep'],
            timeDimensions: [{
              dimension: 'Analytics.date',
              dateRange: 'last 30 days'
            }],
            order: { 'Analytics.funnelStepOrder': 'asc' }
          }}
          startLabel="Landing Page"
          endLabel="Purchase Complete"
          valueFormat={(val) => val.toLocaleString()}
          negativeColor="#f59e0b"
          height={500}
        />

        {/* Additional context */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Optimization Tip:</strong> The largest drop-off is at the checkout step.
            Consider implementing guest checkout and simplifying the payment form.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Example 4: Multi-Channel Attribution Dashboard
export function AttributionDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Source Changes</CardTitle>
          <CardDescription>
            Month-over-month traffic changes by source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaterfallChart
            query={{
              measures: ['SearchConsole.clicks'],
              dimensions: ['SearchConsole.sourceType'],
              timeDimensions: [{
                dimension: 'SearchConsole.date',
                dateRange: ['2025-09-01', '2025-10-31'],
                granularity: 'month'
              }],
              order: { 'SearchConsole.clicks': 'desc' }
            }}
            startLabel="September"
            endLabel="October"
            valueFormat={(val) => `${(val / 1000).toFixed(1)}K`}
            height={400}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel ROI Contribution</CardTitle>
          <CardDescription>
            How each channel contributes to overall marketing ROI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaterfallChart
            query={{
              measures: ['Marketing.roi'],
              dimensions: ['Marketing.channel'],
              filters: [{
                member: 'Marketing.date',
                operator: 'inDateRange',
                values: ['last quarter']
              }],
              order: { 'Marketing.roi': 'desc' },
              limit: 8
            }}
            startLabel="Baseline"
            endLabel="Total ROI"
            valueFormat={(val) => `${(val * 100).toFixed(1)}%`}
            height={400}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Example 5: Executive Dashboard with Multiple Waterfalls
export function ExecutiveDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Bridge */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Bridge</CardTitle>
            <CardDescription>Q3 to Q4 changes</CardDescription>
          </CardHeader>
          <CardContent>
            <WaterfallChart
              query={{
                measures: ['Revenue.amount'],
                dimensions: ['Revenue.category'],
                timeDimensions: [{
                  dimension: 'Revenue.date',
                  dateRange: ['2025-07-01', '2025-12-31']
                }],
                order: { 'Revenue.sequenceOrder': 'asc' }
              }}
              startLabel="Q3"
              endLabel="Q4"
              valueFormat={(val) => `$${(val / 1000000).toFixed(1)}M`}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Profit Bridge */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Bridge</CardTitle>
            <CardDescription>Q3 to Q4 changes</CardDescription>
          </CardHeader>
          <CardContent>
            <WaterfallChart
              query={{
                measures: ['Profit.amount'],
                dimensions: ['Profit.category'],
                timeDimensions: [{
                  dimension: 'Profit.date',
                  dateRange: ['2025-07-01', '2025-12-31']
                }],
                order: { 'Profit.sequenceOrder': 'asc' }
              }}
              startLabel="Q3"
              endLabel="Q4"
              valueFormat={(val) => `$${(val / 1000000).toFixed(1)}M`}
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Marketing Spend Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Budget Allocation</CardTitle>
          <CardDescription>
            How the quarterly marketing budget is distributed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaterfallChart
            query={{
              measures: ['Marketing.budget'],
              dimensions: ['Marketing.channel'],
              timeDimensions: [{
                dimension: 'Marketing.date',
                dateRange: 'this quarter'
              }],
              order: { 'Marketing.budget': 'desc' }
            }}
            startLabel="Total Budget"
            endLabel="Unallocated"
            valueFormat={(val) => `$${(val / 1000).toFixed(0)}K`}
            height={450}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Example 6: Responsive Layout for Mobile
export function ResponsiveWaterfallDashboard() {
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Revenue Analysis</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Quarter-over-quarter comparison
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          <WaterfallChart
            query={{
              measures: ['Revenue.amount'],
              dimensions: ['Revenue.category'],
              order: { 'Revenue.sequenceOrder': 'asc' },
              limit: 6
            }}
            valueFormat={(val) => {
              // Shorter format on mobile
              if (window.innerWidth < 640) {
                return `$${(val / 1000000).toFixed(0)}M`;
              }
              return `$${(val / 1000000).toFixed(1)}M`;
            }}
            height={window.innerWidth < 640 ? 300 : 400}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Example 7: Integration with Filters
export function FilteredWaterfallDashboard() {
  const [selectedRegion, setSelectedRegion] = React.useState<string>('US');
  const [dateRange, setDateRange] = React.useState<string>('last quarter');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Regional Revenue Bridge</CardTitle>
            <CardDescription>Revenue changes by region and period</CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="rounded border px-3 py-1 text-sm"
            >
              <option value="US">United States</option>
              <option value="EU">Europe</option>
              <option value="APAC">Asia Pacific</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded border px-3 py-1 text-sm"
            >
              <option value="last quarter">Last Quarter</option>
              <option value="last 6 months">Last 6 Months</option>
              <option value="last year">Last Year</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <WaterfallChart
          query={{
            measures: ['Revenue.amount'],
            dimensions: ['Revenue.category'],
            filters: [{
              member: 'Revenue.region',
              operator: 'equals',
              values: [selectedRegion]
            }],
            timeDimensions: [{
              dimension: 'Revenue.date',
              dateRange
            }],
            order: { 'Revenue.sequenceOrder': 'asc' }
          }}
          valueFormat={(val) => `$${(val / 1000000).toFixed(1)}M`}
          height={450}
        />
      </CardContent>
    </Card>
  );
}
