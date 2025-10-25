/**
 * TimelineChart Usage Examples
 *
 * Demonstrates various configurations for timeline charts with event start/end dates
 */

import { TimelineChart } from './TimelineChart';

// Example 1: Marketing Campaign Timeline
export const CampaignTimelineExample = () => (
  <TimelineChart
    title="Marketing Campaign Timeline"
    datasource="google_ads_campaigns"
    eventNameDimension="GoogleAdsCampaigns.campaignName"
    startDateDimension="GoogleAdsCampaigns.startDate"
    endDateDimension="GoogleAdsCampaigns.endDate"
    categoryDimension="GoogleAdsCampaigns.status"
    valueMetric="GoogleAdsCampaigns.totalSpend"

    // Layout options
    timelineLayout="horizontal"
    showProgress={true}
    currentDateLine={true}
    eventHeight={24}
    rowHeight={50}

    // Display options
    showEventLabels={true}
    showDuration={true}
    colorByCategory={true}
    eventOpacity={0.85}

    // Interaction
    allowZoom={true}
    allowPan={true}

    // Custom status colors
    statusColors={{
      'active': '#10b981',
      'completed': '#3b82f6',
      'pending': '#f59e0b',
      'paused': '#ef4444',
      'draft': '#8b5cf6'
    }}

    showLegend={true}
    dateRange={{
      start: '2025-01-01',
      end: '2025-12-31'
    }}
  />
);

// Example 2: Project Task Timeline
export const ProjectTaskTimelineExample = () => (
  <TimelineChart
    title="Project Task Timeline"
    datasource="project_tasks"
    eventNameDimension="Tasks.taskName"
    startDateDimension="Tasks.startDate"
    endDateDimension="Tasks.dueDate"
    categoryDimension="Tasks.assignee"
    valueMetric="Tasks.hoursEstimated"

    // Highlight ongoing tasks
    showProgress={true}
    currentDateLine={true}

    // Minimal styling
    eventHeight={18}
    rowHeight={40}
    showEventLabels={false} // Hide labels for compact view
    showDuration={true}

    // Color by assignee
    colorByCategory={true}
    chartColors={[
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#ec4899'  // Pink
    ]}

    allowZoom={true}
    showLegend={true}
  />
);

// Example 3: Content Publishing Schedule
export const ContentScheduleExample = () => (
  <TimelineChart
    title="Content Publishing Schedule"
    datasource="content_calendar"
    eventNameDimension="Content.title"
    startDateDimension="Content.scheduledDate"
    endDateDimension="Content.expiryDate"
    categoryDimension="Content.contentType"

    // Show ongoing content pieces
    showProgress={true}
    currentDateLine={true}

    // Styling
    eventHeight={22}
    rowHeight={45}
    showEventLabels={true}
    showDuration={false} // Don't show duration for content
    eventOpacity={0.9}

    // Category colors (blog, video, social, etc.)
    statusColors={{
      'blog': '#3b82f6',
      'video': '#ef4444',
      'social': '#10b981',
      'email': '#f59e0b',
      'whitepaper': '#8b5cf6'
    }}
    colorByCategory={true}

    // Enable interaction
    allowZoom={true}
    allowPan={true}
    showLegend={true}

    // Styling
    backgroundColor="#f9fafb"
    borderRadius={12}
    padding={20}
  />
);

// Example 4: Ad Campaign Lifecycle (Multi-Platform)
export const AdLifecycleTimelineExample = () => (
  <TimelineChart
    title="Multi-Platform Ad Campaign Lifecycle"
    datasource="ad_campaigns"
    eventNameDimension="AdCampaigns.campaignName"
    startDateDimension="AdCampaigns.launchDate"
    endDateDimension="AdCampaigns.endDate"
    categoryDimension="AdCampaigns.platform"
    valueMetric="AdCampaigns.budget"

    // Timeline configuration
    showProgress={true}
    currentDateLine={true}
    eventHeight={20}
    rowHeight={45}

    // Labels and formatting
    showEventLabels={true}
    showDuration={true}

    // Platform colors
    statusColors={{
      'google ads': '#4285f4',
      'facebook': '#1877f2',
      'linkedin': '#0077b5',
      'twitter': '#1da1f2',
      'tiktok': '#000000'
    }}
    colorByCategory={true}
    eventOpacity={0.85}

    // Interaction
    allowZoom={true}
    allowPan={true}
    showLegend={true}

    filters={[
      {
        field: 'AdCampaigns.status',
        operator: 'notEquals',
        values: ['deleted']
      }
    ]}
  />
);

// Example 5: SEO Campaign Timeline (Minimal)
export const SEOTimelineExample = () => (
  <TimelineChart
    title="SEO Campaign Timeline"
    datasource="seo_campaigns"
    eventNameDimension="SEOCampaigns.campaignName"
    startDateDimension="SEOCampaigns.startDate"
    endDateDimension="SEOCampaigns.endDate"
    categoryDimension="SEOCampaigns.priority"

    // Minimal configuration
    showProgress={false}
    currentDateLine={false}
    eventHeight={16}
    rowHeight={35}

    // Clean styling
    showEventLabels={false}
    showDuration={false}
    eventOpacity={0.75}

    // Priority colors
    statusColors={{
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    }}
    colorByCategory={true}

    // No zoom/pan for static view
    allowZoom={false}
    allowPan={false}
    showLegend={true}

    // Clean borders
    showBorder={true}
    borderColor="#d1d5db"
    borderRadius={8}
  />
);

// Example 6: Event Timeline with Filters
export const FilteredTimelineExample = () => (
  <TimelineChart
    title="Q4 Campaign Timeline - Active Only"
    datasource="marketing_events"
    eventNameDimension="Events.eventName"
    startDateDimension="Events.startDate"
    endDateDimension="Events.endDate"
    categoryDimension="Events.department"
    valueMetric="Events.estimatedReach"

    // Date range for Q4
    dateRange={{
      start: '2025-10-01',
      end: '2025-12-31'
    }}

    // Filter to active events only
    filters={[
      {
        field: 'Events.status',
        operator: 'equals',
        values: ['active', 'scheduled']
      },
      {
        field: 'Events.estimatedReach',
        operator: 'gte',
        values: ['10000'] // Only events with 10k+ reach
      }
    ]}

    // Timeline options
    showProgress={true}
    currentDateLine={true}
    eventHeight={24}
    rowHeight={50}

    // Display
    showEventLabels={true}
    showDuration={true}
    colorByCategory={true}

    // Department colors
    chartColors={[
      '#2563eb', // Paid Search
      '#dc2626', // Paid Social
      '#059669', // SEO
      '#d97706', // Content
      '#7c3aed', // Email
      '#db2777'  // PR
    ]}

    allowZoom={true}
    showLegend={true}
  />
);

// Example 7: Compact Timeline View
export const CompactTimelineExample = () => (
  <TimelineChart
    title="Campaign Overview (Compact)"
    datasource="campaigns"
    eventNameDimension="Campaigns.name"
    startDateDimension="Campaigns.start"
    endDateDimension="Campaigns.end"

    // Compact configuration
    eventHeight={12}
    rowHeight={25}
    showEventLabels={false}
    showDuration={false}
    showProgress={false}
    currentDateLine={true}

    // Minimal styling
    eventOpacity={0.7}
    colorByCategory={false}

    // No legend for compact view
    showLegend={false}

    // Small padding
    padding={12}

    // Disable zoom for fixed view
    allowZoom={false}
    allowPan={false}

    // Styling
    backgroundColor="#ffffff"
    showBorder={true}
    borderColor="#e5e7eb"
    borderRadius={6}
  />
);

// Example 8: Timeline with Value-Based Sizing
export const ValueBasedTimelineExample = () => (
  <TimelineChart
    title="Campaign Budget Timeline"
    datasource="campaign_budgets"
    eventNameDimension="Budgets.campaignName"
    startDateDimension="Budgets.startDate"
    endDateDimension="Budgets.endDate"
    categoryDimension="Budgets.budgetTier"
    valueMetric="Budgets.allocatedBudget"

    // Use value for visual emphasis
    showProgress={true}
    currentDateLine={true}

    // Larger events for visibility
    eventHeight={26}
    rowHeight={55}

    // Full labels
    showEventLabels={true}
    showDuration={true}

    // Budget tier colors
    statusColors={{
      'premium': '#8b5cf6',
      'standard': '#3b82f6',
      'economy': '#10b981'
    }}
    colorByCategory={true}
    eventOpacity={0.9}

    // Enable full interaction
    allowZoom={true}
    allowPan={true}
    showLegend={true}

    // Metric formatting for budget
    metricsConfig={[
      {
        id: 'Budgets.allocatedBudget',
        label: 'Budget',
        format: 'currency',
        decimalPlaces: 0,
        prefix: '$',
        suffix: ''
      }
    ]}
  />
);

/**
 * Integration with Cube.js data models:
 *
 * The TimelineChart expects your Cube.js data model to have:
 * 1. Event name dimension (string)
 * 2. Start date dimension (date/time)
 * 3. End date dimension (date/time)
 * 4. Optional: Category dimension (string) for color coding
 * 5. Optional: Value metric (number) for tooltip display
 *
 * Example Cube.js model:
 *
 * cube('MarketingCampaigns', {
 *   sql: `SELECT * FROM marketing_campaigns`,
 *
 *   dimensions: {
 *     campaignName: {
 *       sql: 'campaign_name',
 *       type: 'string'
 *     },
 *     startDate: {
 *       sql: 'start_date',
 *       type: 'time'
 *     },
 *     endDate: {
 *       sql: 'end_date',
 *       type: 'time'
 *     },
 *     status: {
 *       sql: 'status',
 *       type: 'string'
 *     }
 *   },
 *
 *   measures: {
 *     totalBudget: {
 *       sql: 'budget',
 *       type: 'sum'
 *     }
 *   }
 * });
 */
