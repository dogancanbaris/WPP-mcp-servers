# TimelineChart Component

A comprehensive timeline/Gantt chart component built with ECharts and integrated with dataset API for visualizing events with start and end dates.

## Overview

The TimelineChart component displays events over time with:
- **Start and end dates** for each event
- **Automatic row assignment** to avoid overlaps
- **Category-based coloring** for event grouping
- **Progress indicators** for ongoing events
- **Current date line** marker
- **Interactive zoom and pan** capabilities
- **Duration display** in tooltips
- **Value metrics** for additional event information

## File Location

```
/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/charts/TimelineChart.tsx
```

## Core Features

### 1. Event Timeline Visualization
- Displays events as horizontal bars on a timeline
- Automatically positions events to avoid overlaps
- Shows multiple concurrent events across different rows

### 2. Date Range Management
- Supports any date format (ISO 8601, timestamps, date strings)
- Automatically calculates optimal date range with padding
- Custom date range filtering via dataset API

### 3. Category & Status Coloring
- Color events by category or status
- Pre-defined status colors: active, completed, pending, cancelled, planned
- Custom color mapping support

### 4. Interactive Features
- Zoom in/out on timeline
- Pan left/right through dates
- Hover tooltips with event details
- Click interactions for event selection

### 5. Progress Tracking
- Visual indicator for ongoing events (current time between start and end)
- "Today" marker line
- Highlighted borders for in-progress events

## Props Interface

### Required Props

```typescript
// Required for timeline to work
eventNameDimension: string;     // Dimension for event names
startDateDimension: string;     // Dimension for start dates
endDateDimension: string;       // Dimension for end dates
```

### Timeline-Specific Props

```typescript
categoryDimension?: string;     // Optional grouping dimension
valueMetric?: string;           // Optional value metric
timelineLayout?: 'horizontal' | 'vertical';  // Default: 'horizontal'
showProgress?: boolean;         // Default: true
currentDateLine?: boolean;      // Default: true
eventHeight?: number;           // Default: 20 (5-30)
rowHeight?: number;             // Default: 40 (30-100)
showEventLabels?: boolean;      // Default: true
showDuration?: boolean;         // Default: true
colorByCategory?: boolean;      // Default: true
eventOpacity?: number;          // Default: 0.8 (0-1)
allowZoom?: boolean;            // Default: true
allowPan?: boolean;             // Default: true
statusColors?: Record<string, string>;  // Custom status colors
```

### Inherited Props (from ComponentConfig)

All standard props from the dashboard builder:
- `title`, `showTitle`, `titleFontSize`, etc.
- `backgroundColor`, `borderColor`, `borderRadius`, etc.
- `showLegend`, `chartColors`
- `filters`, `dateRange`
- `metricsConfig` for value formatting

## Usage Examples

### Example 1: Basic Campaign Timeline

```tsx
<TimelineChart
  datasource="google_ads_campaigns"
  eventNameDimension="GoogleAdsCampaigns.campaignName"
  startDateDimension="GoogleAdsCampaigns.startDate"
  endDateDimension="GoogleAdsCampaigns.endDate"
  title="Campaign Timeline"
  showProgress={true}
  currentDateLine={true}
/>
```

### Example 2: Multi-Category Timeline with Custom Colors

```tsx
<TimelineChart
  datasource="marketing_events"
  eventNameDimension="Events.name"
  startDateDimension="Events.startDate"
  endDateDimension="Events.endDate"
  categoryDimension="Events.status"
  valueMetric="Events.budget"

  statusColors={{
    'active': '#10b981',
    'completed': '#3b82f6',
    'pending': '#f59e0b',
    'cancelled': '#ef4444'
  }}

  showProgress={true}
  currentDateLine={true}
  showDuration={true}
  allowZoom={true}
/>
```

### Example 3: Project Task Timeline

```tsx
<TimelineChart
  datasource="project_tasks"
  eventNameDimension="Tasks.taskName"
  startDateDimension="Tasks.startDate"
  endDateDimension="Tasks.dueDate"
  categoryDimension="Tasks.assignee"

  eventHeight={18}
  rowHeight={40}
  showEventLabels={false}
  colorByCategory={true}

  chartColors={[
    '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899'
  ]}
/>
```

### Example 4: Content Publishing Schedule

```tsx
<TimelineChart
  datasource="content_calendar"
  eventNameDimension="Content.title"
  startDateDimension="Content.scheduledDate"
  endDateDimension="Content.expiryDate"
  categoryDimension="Content.contentType"

  statusColors={{
    'blog': '#3b82f6',
    'video': '#ef4444',
    'social': '#10b981',
    'email': '#f59e0b'
  }}

  showDuration={false}
  eventOpacity={0.9}
  allowZoom={true}
  allowPan={true}
/>
```

## dataset API Integration

### Required Data Model Structure

Your dataset API data model needs:

```javascript
cube('MarketingCampaigns', {
  sql: `SELECT * FROM marketing_campaigns`,

  dimensions: {
    // Required: Event name
    campaignName: {
      sql: 'campaign_name',
      type: 'string'
    },

    // Required: Start date
    startDate: {
      sql: 'start_date',
      type: 'time'
    },

    // Required: End date
    endDate: {
      sql: 'end_date',
      type: 'time'
    },

    // Optional: Category for coloring
    status: {
      sql: 'status',
      type: 'string'
    }
  },

  measures: {
    // Optional: Value metric
    totalBudget: {
      sql: 'budget',
      type: 'sum'
    }
  }
});
```

### Example dataset API Query

The component generates queries like:

```javascript
{
  dimensions: [
    'MarketingCampaigns.campaignName',
    'MarketingCampaigns.startDate',
    'MarketingCampaigns.endDate',
    'MarketingCampaigns.status'
  ],
  measures: [
    'MarketingCampaigns.totalBudget'
  ],
  filters: [
    {
      member: 'MarketingCampaigns.status',
      operator: 'notEquals',
      values: ['deleted']
    }
  ],
  timeDimensions: [
    {
      dimension: 'MarketingCampaigns.startDate',
      dateRange: ['2025-01-01', '2025-12-31']
    }
  ],
  limit: 200
}
```

## Visual Features

### Event Rendering
- Events rendered as colored horizontal bars
- Bar width = duration (end date - start date)
- Bar position = event row (auto-assigned to avoid overlaps)
- Bar color = category color or status color

### Ongoing Events Highlighting
- Bold border (2px black) for events in progress
- Full opacity (1.0) vs configured opacity for completed
- "In Progress" badge in tooltip

### Current Date Line
- Red dashed vertical line at current date
- "Today" label at top of line
- Only shown if current date is within timeline range

### Overlap Prevention Algorithm
Simple row assignment algorithm:
1. Sort events by start date
2. For each event, find first available row where it doesn't overlap
3. If no row available, create new row
4. Assign event to row

### Duration Formatting
- Days + hours for events longer than 1 day: "5d 3h"
- Hours only for events shorter than 1 day: "8h"
- Minutes for very short events: "45m"

## Styling & Customization

### Container Styling
```typescript
backgroundColor = '#ffffff'
showBorder = true
borderColor = '#e0e0e0'
borderWidth = 1
borderRadius = 8
showShadow = false
shadowColor = '#000000'
shadowBlur = 10
padding = 16
```

### Timeline Sizing
```typescript
eventHeight = 20        // Height of each event bar (5-30px)
rowHeight = 40          // Height of each timeline row (30-100px)
```

### Colors & Opacity
```typescript
eventOpacity = 0.8      // Transparency of event bars (0-1)
colorByCategory = true  // Use category for coloring
chartColors = [...]     // Fallback colors if no statusColors match
statusColors = {        // Custom status-to-color mapping
  'active': '#10b981',
  'completed': '#3b82f6',
  ...
}
```

### Labels & Information
```typescript
showEventLabels = true  // Show event name on bar (if width > 50px)
showDuration = true     // Show duration in tooltip
showProgress = true     // Highlight ongoing events
currentDateLine = true  // Show "Today" marker
```

## Performance Considerations

### Token Efficiency
- Default limit: 200 events (adjustable via dataset API query)
- Events aggregated/filtered in dataset API before reaching frontend
- Use `filters` prop to reduce data volume

### Rendering Performance
- Canvas rendering for smooth interactions
- Lazy loading with loading states
- Efficient row calculation algorithm

### Date Parsing
- Supports ISO 8601, timestamps, and date strings
- Graceful error handling for invalid dates
- Validates dates before rendering

## Accessibility

- Keyboard navigation support
- ARIA labels for events
- Screen reader friendly tooltips
- High contrast color options

## Error States

### Configuration Required
Shown when missing required dimensions:
- "Timeline Configuration Required"
- Instructions to select event name, start date, end date

### Loading State
- Animated spinner while fetching data
- "Loading..." indicator

### Error State
- Red error message
- Display error details for debugging

### Empty State
- "No timeline events available"
- Suggestion to adjust filters or date range

## Footer Information

Displays useful metadata:
```
12 events across 4 rows | 3 categories | Jan 15 - Mar 30, 2025
```

## Component States

### States Handled
1. **Empty** - No configuration
2. **Loading** - Fetching data from Supabase dataset
3. **Error** - Failed to load data
4. **Empty Data** - Query returned no results
5. **Success** - Data rendered as timeline

## Integration with Dashboard Builder

The TimelineChart is fully integrated with the dashboard builder:

### ChartWrapper Integration
Added to `/frontend/src/components/dashboard-builder/ChartWrapper.tsx`:

```typescript
case 'timeline':
  return <TimelineChart {...config} />;
```

### Component Type
Use `type: 'timeline'` in ComponentConfig

### Example Config Object
```typescript
const timelineConfig: ComponentConfig = {
  id: 'timeline-1',
  type: 'timeline',
  name: 'Campaign Timeline',
  datasource: 'google_ads_campaigns',

  // Timeline-specific
  eventNameDimension: 'GoogleAdsCampaigns.campaignName',
  startDateDimension: 'GoogleAdsCampaigns.startDate',
  endDateDimension: 'GoogleAdsCampaigns.endDate',
  categoryDimension: 'GoogleAdsCampaigns.status',

  // Styling
  title: 'Q4 Campaign Timeline',
  showTitle: true,
  backgroundColor: '#ffffff',

  // Layout
  width: 12,
  height: 6
};
```

## Real-World Use Cases

### 1. Marketing Campaign Planning
- Visualize campaign start/end dates
- Track overlapping campaigns
- Monitor active vs completed campaigns
- Budget allocation over time

### 2. Project Management
- Task timeline across team members
- Milestone tracking
- Resource allocation
- Dependency visualization

### 3. Content Calendar
- Publishing schedule
- Content type distribution
- Expiry date tracking
- Multi-channel coordination

### 4. Ad Campaign Lifecycle
- Multi-platform campaign coordination
- Budget pacing visualization
- Campaign overlap analysis
- Performance period tracking

### 5. SEO Campaign Timeline
- Content production schedule
- Link building phases
- Technical SEO sprints
- Campaign priority visualization

## Technical Implementation Details

### ECharts Configuration
Uses ECharts `custom` series type with custom `renderItem` function:
- Full control over event bar rendering
- Custom label positioning
- Dynamic styling based on event status

### Date Handling
Uses `date-fns` for date operations:
- `parseISO()` - Parse ISO date strings
- `format()` - Format dates for display
- Type-safe date manipulations

### Row Assignment Algorithm
```typescript
const rows: { maxEnd: Date }[] = [];
events.forEach(event => {
  let assignedRow = -1;

  // Find first available row
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].maxEnd <= event.start) {
      assignedRow = i;
      rows[i].maxEnd = event.end;
      break;
    }
  }

  // Create new row if needed
  if (assignedRow === -1) {
    assignedRow = rows.length;
    rows.push({ maxEnd: event.end });
  }

  event.row = assignedRow;
});
```

## Dependencies

- `react` - Component framework
- `dataset query hook` - dataset API integration
- `echarts` - Charting library
- `echarts-for-react` - React wrapper for ECharts
- `date-fns` - Date manipulation
- `lucide-react` - Icons (Loader2)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Potential improvements:
1. Vertical timeline layout support
2. Dependency lines between events
3. Drag-and-drop event rescheduling
4. Event grouping/collapsing
5. Multiple timelines (swimlanes)
6. Resource allocation visualization
7. Critical path highlighting
8. Export to iCal/Google Calendar

## Testing Recommendations

### Unit Tests
- Date parsing edge cases
- Row assignment algorithm
- Color assignment logic
- Duration formatting

### Integration Tests
- dataset API query generation
- Empty state handling
- Error state handling
- Loading state timing

### Visual Tests
- Event overlap prevention
- Color contrast ratios
- Label positioning
- Responsive behavior

## Troubleshooting

### Events Not Showing
- Verify date dimensions return valid dates
- Check date range filter encompasses event dates
- Ensure limit (default 200) is sufficient

### Overlapping Events
- Algorithm should prevent overlaps automatically
- If overlaps occur, check date parsing

### Colors Not Showing
- Verify `colorByCategory` is true
- Check `statusColors` keys match category values (case-insensitive)
- Fallback to `chartColors` if no match

### Performance Issues
- Reduce limit to fewer events (50-100)
- Add more specific filters
- Consider date range pagination

## Support

For issues or questions:
- Check example file: `TimelineChart.example.tsx`
- Review dataset API data model requirements
- Verify date format in source data

## License

Part of the WPP Analytics Platform frontend components.
