# Dashboard Builder Implementation - Master Plan

**Date**: 2025-10-22
**Goal**: Build complete Looker Studio-style dashboard builder
**Reference**: VISUAL-MOCKUP-BLUEPRINT.md
**Timeline**: 3-4 days with parallel agent execution
**Agents Used**: frontend-developer, backend-api-specialist, database-analytics-architect

---

## EXECUTION STRATEGY

### Parallel Execution Rules:
1. ✅ **Parallel**: Tasks that don't depend on each other (different files/components)
2. ❌ **Sequential**: Tasks that have dependencies (must complete before next)
3. 🔄 **Batch**: Group similar tasks to same agent for efficiency

### Agent Workflow:
```
Phase 1 (Backend Foundation) → SEQUENTIAL
  ↓ Must complete before frontend can build
Phase 2 (Core Components) → PARALLEL (5 agents)
  ↓ All build simultaneously
Phase 3 (Integration) → SEQUENTIAL
  ↓ Wire everything together
Phase 4 (Testing & Polish) → PARALLEL (2 agents)
```

---

## PHASE 1: BACKEND FOUNDATION (SEQUENTIAL - 2 hours)

**Execute First** - Frontend needs this data to build against.

### Task 1.1: Expand Cube.js Schema
**Agent**: `database-analytics-architect`
**Priority**: CRITICAL - Must complete first
**Time**: 1 hour

**What to Build**:

Create file: `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/cube-backend/schema/AvailableFields.js`

```javascript
// Returns all available dimensions and metrics for each data source
cube(`AvailableFields`, {
  sql: `SELECT 1`, // Dummy table

  measures: {
    // Data source metadata
  },

  dimensions: {
    dataSourceName: {
      sql: `'gsc_performance_7days'`,
      type: `string`
    },

    availableDimensions: {
      sql: `'date,query,page,device,country'`,
      type: `string`
    },

    availableMetrics: {
      sql: `'clicks,impressions,ctr,position'`,
      type: `string`
    }
  }
});
```

**Why**: Frontend needs to know what dimensions/metrics exist for dropdowns.

**Deliverable**:
- AvailableFields.js cube created
- API endpoint returns field lists
- Test: `curl http://localhost:4000/cubejs-api/v1/meta` shows new cube

---

### Task 1.2: Create Dashboard API Endpoints
**Agent**: `backend-api-specialist`
**Priority**: CRITICAL
**Time**: 1 hour
**Depends on**: None (parallel with 1.1)

**What to Build**:

Create file: `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/backend/api/dashboards.ts`

**Endpoints needed**:

1. **GET /api/dashboards/fields**
   ```typescript
   // Returns available dimensions/metrics per data source
   Response: {
     gsc_performance_7days: {
       dimensions: ['date', 'query', 'page', 'device', 'country'],
       metrics: ['clicks', 'impressions', 'ctr', 'position']
     },
     google_ads: {
       dimensions: ['date', 'campaign', 'ad_group', 'keyword'],
       metrics: ['cost', 'clicks', 'conversions', 'ctr', 'cpc']
     }
   }
   ```

2. **GET /api/dashboards/:id**
   ```typescript
   // Load dashboard config from Supabase
   Response: DashboardConfig
   ```

3. **POST /api/dashboards**
   ```typescript
   // Create new dashboard
   Body: { title, rows }
   Response: { id, url }
   ```

4. **PUT /api/dashboards/:id**
   ```typescript
   // Update dashboard
   Body: DashboardConfig
   Response: { success: true }
   ```

**Why**: Frontend needs APIs to load field options and save dashboards.

**Deliverable**:
- 4 API routes created in Next.js
- Supabase integration working
- Test: Can create and load dashboard via API

---

**CHECKPOINT 1**: ✋ Wait for both Task 1.1 and 1.2 to complete before Phase 2

---

## PHASE 2: CORE COMPONENTS (PARALLEL - 4 hours)

**Execute in Parallel** - All agents work simultaneously on different components.

Launch all 5 tasks at once in a single message.

### Task 2.1: Enhanced Topbar
**Agent**: `frontend-developer` (Agent #1)
**Time**: 2 hours
**Depends on**: None

**Files to Create**:

1. `/frontend/src/components/dashboard-builder/topbar/EditorMenu.tsx`
   ```tsx
   // File | Edit | View | Insert | Arrange | Help menus
   // Each menu is a dropdown with options
   ```

2. `/frontend/src/components/dashboard-builder/topbar/QuickTools.tsx`
   ```tsx
   // Undo, Redo, Cursor, Add Row, Add Chart, Add Control buttons
   // Center section of topbar
   ```

3. `/frontend/src/components/dashboard-builder/topbar/ActionButtons.tsx`
   ```tsx
   // Agent Assistant, Share, View, Save, User profile
   // Right section of topbar
   ```

4. Update `/frontend/src/components/dashboard-builder/EditorTopbar.tsx`
   ```tsx
   // Combine all three sections into full topbar
   // Match VISUAL-MOCKUP-BLUEPRINT.md Section 2
   ```

**Specifications**:
- Use Lucide React icons (see blueprint Section 10)
- All dropdowns use shadcn DropdownMenu
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo), Ctrl+S (save)
- Responsive: On mobile, collapse some buttons into "..." menu

**Deliverable**:
- 4 files created
- Topbar matches mockup exactly
- All buttons functional (connect to store actions)

---

### Task 2.2: Enhanced Setup Tab
**Agent**: `frontend-developer` (Agent #2)
**Time**: 3 hours
**Depends on**: Task 1.2 (needs /api/dashboards/fields)

**Files to Update**:

Update `/frontend/src/components/dashboard-builder/ChartSetup.tsx`

**Add these sections** (reference blueprint Section 3):

1. **Chart Type Selector** (with icons)
   ```tsx
   <Select value={config.type} onValueChange={handleTypeChange}>
     <SelectItem value="table">
       <TableIcon /> Table
     </SelectItem>
     // ... all 13 chart types
   </Select>

   // Chart preview icons (quick switcher)
   <div className="flex gap-2">
     <ChartTypeIcon type="table" onClick={switchTo('table')} />
     <ChartTypeIcon type="time_series" onClick={switchTo('time_series')} />
     // ... quick switcher for all types
   </div>
   ```

2. **Data Source with Blend**
   ```tsx
   <Select value={dataSource}>
     <SelectItem value="gsc">GSC Performance 7 Days</SelectItem>
     <SelectItem value="ads">Google Ads</SelectItem>
     <SelectItem value="analytics">Google Analytics</SelectItem>
   </Select>

   <Toggle checked={blendData} onCheckedChange={setBlendData}>
     Blend data
   </Toggle>

   {blendData && <Button>Configure blending →</Button>}
   ```

3. **Dimension with Drill-down**
   ```tsx
   <Select value={dimension}>
     <Badge>DIM</Badge> // Green badge
     {dimensions.map(d => <SelectItem>{d}</SelectItem>)}
   </Select>

   <Button onClick={addDimension}>+ Add dimension</Button>
   <Toggle>Enable drill down</Toggle>
   ```

4. **Metrics with Drag/Sort/Compare** (CRITICAL - match Looker exactly)
   ```tsx
   {metrics.map((metric, index) => (
     <div className="metric-row">
       <GripVertical /> {/* Drag handle */}
       <span>{metric.name}</span>

       {/* Aggregation dropdown */}
       <Select value={metric.aggregation}>
         <SelectItem value="sum">SUM</SelectItem>
         <SelectItem value="avg">AVG</SelectItem>
         <SelectItem value="count">COUNT</SelectItem>
         <SelectItem value="min">MIN</SelectItem>
         <SelectItem value="max">MAX</SelectItem>
         <SelectItem value="median">MEDIAN</SelectItem>
       </Select>

       {/* Sort button */}
       <Button onClick={toggleSort(index)}>
         <ArrowUpDown />
       </Button>

       {/* Compare button */}
       <Button onClick={toggleCompare(index)}>
         <Scale />
       </Button>

       {/* Remove button */}
       <Button onClick={removeMetric(index)}>
         <X />
       </Button>
     </div>
   ))}

   <Button onClick={addMetric}>+ Add metric</Button>
   <Toggle>Optional metrics</Toggle>
   <Toggle>Metric sliders</Toggle> {/* Shows bars in table cells */}
   ```

5. **Filter Section**
   ```tsx
   <div className="filters">
     {filters.map(filter => (
       <Badge>{filter.field} {filter.operator} {filter.value} <X /></Badge>
     ))}
     <Button onClick={addFilter}>+ Add filter</Button>
   </div>
   ```

6. **Date Range Picker**
   ```tsx
   <Select value={dateRange}>
     <SelectItem value="auto_7">Auto: Last 7 days</SelectItem>
     <SelectItem value="auto_28">Auto: Last 28 days</SelectItem>
     <SelectItem value="auto_90">Auto: Last 90 days</SelectItem>
     <SelectItem value="this_month">This month</SelectItem>
     <SelectItem value="last_month">Last month</SelectItem>
     <SelectItem value="this_quarter">This quarter</SelectItem>
     <SelectItem value="this_year">This year</SelectItem>
     <SelectItem value="custom">Custom...</SelectItem>
   </Select>

   {dateRange === 'custom' && (
     <DateRangePicker
       start={customStart}
       end={customEnd}
       onChange={handleDateChange}
     />
   )}
   ```

**Deliverable**:
- ChartSetup.tsx completely rebuilt (match blueprint Section 3)
- Fetch dimensions/metrics from /api/dashboards/fields
- All Looker features implemented
- Multi-metric drag-to-reorder working

---

### Task 2.3: Enhanced Style Tab
**Agent**: `frontend-developer` (Agent #3)
**Time**: 3 hours
**Depends on**: None

**Files to Update**:

Update `/frontend/src/components/dashboard-builder/ChartStyle.tsx`

**Rebuild with Accordion sections** (reference blueprint Section 4):

1. **Chart Title Accordion**
   ```tsx
   <AccordionItem value="title">
     <AccordionTrigger>Chart title</AccordionTrigger>
     <AccordionContent>
       <Toggle checked={showTitle}>Show title</Toggle>

       <Input
         value={title}
         onChange={setTitle}
         placeholder="Enter chart title"
       />

       <div className="flex gap-2">
         <Select value={fontFamily}>
           <SelectItem value="inter">Inter</SelectItem>
           <SelectItem value="roboto">Roboto</SelectItem>
           <SelectItem value="arial">Arial</SelectItem>
         </Select>

         <Select value={fontSize}>
           <SelectItem value="12px">12px</SelectItem>
           <SelectItem value="14px">14px</SelectItem>
           <SelectItem value="16px">16px</SelectItem>
           <SelectItem value="18px">18px</SelectItem>
           <SelectItem value="20px">20px</SelectItem>
         </Select>

         <Select value={fontWeight}>
           <SelectItem value="normal">Normal</SelectItem>
           <SelectItem value="medium">Medium</SelectItem>
           <SelectItem value="semibold">Semi-bold</SelectItem>
           <SelectItem value="bold">Bold</SelectItem>
         </Select>
       </div>

       <div className="flex gap-2">
         <ColorPicker
           label="Text color"
           value={textColor}
           onChange={setTextColor}
         />

         <ColorPicker
           label="Background"
           value={bgColor}
           onChange={setBgColor}
         />
       </div>

       <div className="flex gap-1">
         <Button size="sm" onClick={alignLeft}>←</Button>
         <Button size="sm" onClick={alignCenter}>■</Button>
         <Button size="sm" onClick={alignRight}>→</Button>
       </div>
     </AccordionContent>
   </AccordionItem>
   ```

2. **Table Style Accordion** (only for table charts)
   ```tsx
   <AccordionItem value="table-style">
     <AccordionTrigger>Table style</AccordionTrigger>
     <AccordionContent>
       <div className="display-options">
         <Button variant={display === 'default' ? 'solid' : 'outline'}>
           Default
         </Button>
         <Button variant={display === 'compact' ? 'solid' : 'outline'}>
           Compact
         </Button>
         <Button variant={display === 'expanded' ? 'solid' : 'outline'}>
           Expanded
         </Button>
       </div>

       <Slider
         label="Table density"
         min={0} max={2} step={1}
         value={density}
         onChange={setDensity}
         labels={['Tight', 'Medium', 'Loose']}
       />

       <Toggle checked={showRowNumbers}>Show row numbers</Toggle>
       <Toggle checked={wrapText}>Wrap text in cells</Toggle>
       <Toggle checked={enableSorting}>Enable sorting</Toggle>
     </AccordionContent>
   </AccordionItem>
   ```

3. **Table Header Accordion**
4. **Table Body Accordion**
5. **Conditional Formatting Accordion**
6. **Dimensions Styling Accordion** (per dimension)
7. **Metrics Styling Accordion** (per metric - DETAILED)
   ```tsx
   {metrics.map((metric, idx) => (
     <AccordionItem value={`metric-${idx}`}>
       <AccordionTrigger>Metric #{idx + 1}: {metric.name}</AccordionTrigger>
       <AccordionContent>
         {/* Number format */}
         <RadioGroup value={metric.format}>
           <RadioItem value="auto">Auto (1,234)</RadioItem>
           <RadioItem value="number">Number (1,234)</RadioItem>
           <RadioItem value="percent">Percent (12.34%)</RadioItem>
           <RadioItem value="currency">Currency ($1,234)</RadioItem>
         </RadioGroup>

         <Select value={metric.decimalPlaces}>
           <SelectItem value="0">0 decimals</SelectItem>
           <SelectItem value="1">1 decimal</SelectItem>
           <SelectItem value="2">2 decimals</SelectItem>
         </Select>

         <Toggle checked={metric.compact}>
           Compact numbers (1.2K)
         </Toggle>

         {/* Alignment */}
         <div className="flex gap-1">
           <Button onClick={alignLeft}>←</Button>
           <Button onClick={alignCenter}>■</Button>
           <Button onClick={alignRight}>→</Button>
         </div>

         <ColorPicker
           label="Text color"
           value={metric.textColor}
         />

         {/* Comparison */}
         <Toggle checked={metric.showComparison}>
           Show comparison
         </Toggle>
         {metric.showComparison && (
           <Select value={metric.compareVs}>
             <SelectItem value="previous">Previous period</SelectItem>
             <SelectItem value="custom">Custom date</SelectItem>
             <SelectItem value="target">Target value</SelectItem>
           </Select>
         )}

         {/* Bars in cells (for tables) */}
         <Toggle checked={metric.showBars}>
           Show bars in cell
         </Toggle>
         {metric.showBars && (
           <ColorPicker label="Bar color" value={metric.barColor} />
         )}
       </AccordionContent>
     </AccordionItem>
   ))}
   ```

8. **Background and Border Accordion**
9. **Chart Header Accordion**
10. **Chart Footer Accordion**

**Deliverable**:
- ChartStyle.tsx completely rebuilt
- 10 accordion sections
- Matches blueprint Section 4 exactly
- All style options functional

---

### Task 2.4: Color Picker Component
**Agent**: `frontend-developer` (Agent #4)
**Time**: 1 hour
**Depends on**: None

**Files to Create**:

`/frontend/src/components/dashboard-builder/ColorPicker.tsx`

```tsx
// Reusable color picker with:
// - Color swatch showing current color
// - Hex code input
// - react-colorful picker (already installed)
// - Recent colors
// - Preset palette
// Match blueprint Section 8
```

**Deliverable**:
- ColorPicker component
- Works in Setup and Style tabs
- Shows recent colors
- Preset palette included

---

### Task 2.5: Layout & Component Pickers Enhancement
**Agent**: `frontend-developer` (Agent #5)
**Time**: 1.5 hours
**Depends on**: None

**Files to Update**:

1. `/frontend/src/components/dashboard-builder/ComponentPicker.tsx`
   - Add chart type icons (ECharts icons or custom SVGs)
   - Organize in categories: Charts | Controls | Content
   - Add search/filter functionality
   - Show description for each component type

2. Create `/frontend/src/components/dashboard-builder/LayoutPicker.tsx`
   - Extract layout picker from DashboardCanvas
   - Make it reusable
   - Add visual previews (ASCII art from blueprint)
   - 6 layout options

**Deliverable**:
- ComponentPicker enhanced with icons and search
- LayoutPicker separated and improved
- Match blueprint interaction patterns

---

**CHECKPOINT 2**: ✋ Wait for all 5 parallel tasks (2.1-2.5) to complete

---

## PHASE 3: INTEGRATION & WIRING (SEQUENTIAL - 3 hours)

**Execute Sequentially** - Each task depends on previous.

### Task 3.1: Wire Up Data Loading
**Agent**: `frontend-developer`
**Time**: 1 hour
**Depends on**: Phase 1 complete

**Files to Update**:

1. `/frontend/src/components/dashboard-builder/ChartSetup.tsx`
   ```tsx
   // Fetch available fields on mount
   useEffect(() => {
     fetch('/api/dashboards/fields')
       .then(res => res.json())
       .then(data => {
         setAvailableDimensions(data[dataSource].dimensions);
         setAvailableMetrics(data[dataSource].metrics);
       });
   }, [dataSource]);
   ```

2. `/frontend/src/components/dashboard-builder/ChartWrapper.tsx`
   ```tsx
   // Update to use ComponentConfig properly
   // Pass all style props to charts
   // Handle all 13 chart types
   ```

**Deliverable**:
- Dimension/metric dropdowns populated from API
- Chart data source switching works
- Charts receive correct props

---

### Task 3.2: Connect Charts to Cube.js
**Agent**: `frontend-developer`
**Time**: 2 hours
**Depends on**: Task 3.1 complete

**Files to Update**:

Update all 13 chart files to use config from ComponentConfig:

Pattern for each chart:
```tsx
export const TimeSeriesChart: React.FC<ComponentConfig> = ({
  dimension,
  metrics = [],
  breakdownDimension,
  dataSource = 'gsc_performance_7days',
  dateRange,
  // All style props
  backgroundColor,
  borderColor,
  borderWidth,
  borderRadius,
  padding,
  // Title props
  title,
  titleFontSize,
  titleFontWeight,
  titleColor,
  ...rest
}) => {
  // Build Cube.js query
  const query = {
    measures: metrics,
    dimensions: [dimension, breakdownDimension].filter(Boolean),
    timeDimensions: dimension === 'date' ? [{
      dimension: `${dataSource}.date`,
      granularity: 'day',
      dateRange: [dateRange.start, dateRange.end]
    }] : undefined
  };

  const { resultSet, isLoading, error } = useCubeQuery(query);

  // Apply style props to chart container
  return (
    <div style={{
      backgroundColor,
      border: `${borderWidth}px solid ${borderColor}`,
      borderRadius: `${borderRadius}px`,
      padding: `${padding}px`
    }}>
      {/* Title */}
      {title && (
        <h3 style={{
          fontSize: titleFontSize,
          fontWeight: titleFontWeight,
          color: titleColor
        }}>
          {title}
        </h3>
      )}

      {/* Chart rendering logic */}
      <ReactECharts option={chartOptions} />
    </div>
  );
};
```

**Apply to all 13 charts**:
- TimeSeriesChart.tsx
- BarChart.tsx
- LineChart.tsx
- PieChart.tsx
- TableChart.tsx
- Scorecard.tsx
- GaugeChart.tsx
- TreemapChart.tsx
- AreaChart.tsx
- ScatterChart.tsx
- HeatmapChart.tsx
- FunnelChart.tsx
- RadarChart.tsx

**Deliverable**:
- All charts use full ComponentConfig interface
- All charts apply style props
- All charts query Cube.js correctly
- Charts respond to Setup/Style tab changes

---

**CHECKPOINT 3**: ✋ Test integration before Phase 4

---

## PHASE 4: TESTING & POLISH (PARALLEL - 2 hours)

### Task 4.1: Chrome DevTools Testing
**Agent**: Manual testing (you) + Chrome DevTools MCP
**Time**: 1 hour

**Test Plan**:

Navigate to: http://localhost:3002/dashboard/example/builder

**Test Checklist**:
1. ✅ Topbar renders with all sections
2. ✅ Add Row → Layout picker opens → Row created
3. ✅ Add Component → Component picker opens → Component added
4. ✅ Click component → Sidebar shows Setup tab
5. ✅ Select dimension → Dropdown shows options from API
6. ✅ Add metrics → Metric rows appear with drag/sort/compare
7. ✅ Switch to Style tab → All accordions present
8. ✅ Change title font → Chart title updates
9. ✅ Change background color → Chart background updates
10. ✅ Add multiple metrics → Chart shows multiple series
11. ✅ Drag row → Rows reorder
12. ✅ Undo (Ctrl+Z) → Last action reverts
13. ✅ Save → Dashboard persists to Supabase
14. ✅ Reload page → Dashboard loads correctly

**Deliverable**: Testing report with screenshots

---

### Task 4.2: Agent MCP Tool Testing
**Agent**: `wpp-practitioner-assistant`
**Time**: 30 minutes
**Depends on**: MCP tools from Phase 1

**Test Script**:
```
Prompt to agent: "Create a comprehensive SEO performance dashboard with:
- Header row with title 'SEO Dashboard' and date filter
- 4 scorecards for Clicks, Impressions, CTR, Position
- Time series chart showing Clicks and Impressions over time
- Table showing top 10 queries with Clicks and CTR
- Bar chart comparing device performance"
```

**Expected**:
- Agent uses create_dashboard MCP tool
- Dashboard created with 4 rows
- All components configured correctly
- Dashboard loads in browser

**Deliverable**:
- Agent successfully creates dashboard
- Dashboard URL returned
- Visual verification in browser

---

### Task 4.3: Documentation & Polish
**Agent**: `frontend-developer`
**Time**: 30 minutes
**Depends on**: None (parallel with testing)

**Files to Create**:

1. `/frontend/src/components/dashboard-builder/COMPONENT-GUIDE.md`
   - How each component works
   - Props interfaces
   - Usage examples

2. Update `/src/wpp-analytics/tools/dashboards.ts`
   - Add comprehensive JSDoc comments
   - Add examples for each tool
   - Document all parameters

**Deliverable**:
- Complete documentation
- Agent-friendly tool descriptions
- Developer guide for maintenance

---

## PHASE 5: ADDITIONAL FEATURES (OPTIONAL - 2 hours)

These can be done after core is working.

### Task 5.1: Conditional Formatting
**Agent**: `frontend-developer`
**Time**: 1 hour

Add conditional formatting rules for table/scorecard charts:
- If value > threshold, color green
- If value < threshold, color red
- Custom rules with operators

### Task 5.2: Data Blending UI
**Agent**: `frontend-developer` + `database-analytics-architect`
**Time**: 2 hours

Build UI for blending multiple data sources:
- Select primary source
- Add secondary sources
- Define join keys
- Preview blended data

### Task 5.3: Export Functionality
**Agent**: `frontend-developer`
**Time**: 1 hour

Add export buttons:
- Export to PDF (jspdf already installed)
- Export to PNG (html2canvas already installed)
- Export to CSV (for tables)

---

## COMPLETE TASK EXECUTION ORDER

### WAVE 1 (Sequential - MUST complete first):
1. `database-analytics-architect` → Task 1.1 (Cube.js schema)
2. `backend-api-specialist` → Task 1.2 (API endpoints)

**WAIT for completion** ✋

### WAVE 2 (Parallel - Launch all at once):
3. `frontend-developer` Agent #1 → Task 2.1 (Enhanced topbar)
4. `frontend-developer` Agent #2 → Task 2.2 (Enhanced Setup tab)
5. `frontend-developer` Agent #3 → Task 2.3 (Enhanced Style tab)
6. `frontend-developer` Agent #4 → Task 2.4 (Color picker)
7. `frontend-developer` Agent #5 → Task 2.5 (Pickers enhancement)

**WAIT for all 5 to complete** ✋

### WAVE 3 (Sequential - One at a time):
8. `frontend-developer` → Task 3.1 (Wire data loading)
   **WAIT** ✋
9. `frontend-developer` → Task 3.2 (Connect charts to Cube.js)
   **WAIT** ✋

### WAVE 4 (Testing):
10. Manual testing with Chrome DevTools MCP
11. `wpp-practitioner-assistant` → Agent testing

### WAVE 5 (Optional - Can do anytime):
12. Additional features (conditional formatting, blending, export)

---

## AGENT INSTRUCTION TEMPLATE

For each agent, provide:

```markdown
## Your Mission
[Clear goal statement]

## What to Build
[Specific files and components]

## Reference
See VISUAL-MOCKUP-BLUEPRINT.md Section [X] for exact visual design

## Technical Specifications
[Props interfaces, state management, API calls]

## Success Criteria
- [ ] Files created at exact paths
- [ ] Matches mockup visually
- [ ] TypeScript compiles without errors
- [ ] All interactions work
- [ ] Tested manually

## Deliverables
[List of files and confirmations]
```

---

## CRITICAL SUCCESS FACTORS

### For Smooth Execution:
1. ✅ **Reference mockup**: All agents must check VISUAL-MOCKUP-BLUEPRINT.md
2. ✅ **Wait for dependencies**: Don't start Phase 2 until Phase 1 done
3. ✅ **Parallel when possible**: Launch Wave 2 all at once
4. ✅ **Test after each phase**: Verify before moving forward
5. ✅ **Use exact file paths**: No guessing, provide full paths

### Quality Checks:
- Zero TypeScript errors
- Matches mockup exactly
- All Looker features implemented
- Dark mode works
- Responsive on mobile
- Agent MCP tools tested

---

## TIMELINE

**Day 1** (8 hours):
- Morning: Phase 1 (2 hours)
- Afternoon: Phase 2 (4 hours with parallel agents)
- Evening: Phase 3 Task 3.1 (1 hour)

**Day 2** (6 hours):
- Morning: Phase 3 Task 3.2 (2 hours)
- Afternoon: Phase 4 Testing (2 hours)
- Evening: Polish and bug fixes (2 hours)

**Day 3** (Optional - 4 hours):
- Phase 5 additional features

**Total**: 2 days for core features, 3 days for complete

---

## DELIVERABLES CHECKLIST

### Frontend Components:
- [ ] Enhanced EditorTopbar (3 sections, all menus)
- [ ] Enhanced ChartSetup (10+ sections, match Looker)
- [ ] Enhanced ChartStyle (10 accordions, comprehensive)
- [ ] ColorPicker component (reusable)
- [ ] Enhanced ComponentPicker (icons, search, categories)
- [ ] Enhanced LayoutPicker (visual previews)
- [ ] All 13 charts updated (style props, Cube.js connection)

### Backend:
- [ ] AvailableFields Cube.js schema
- [ ] 4 API endpoints (/api/dashboards/*)
- [ ] Field metadata endpoint
- [ ] Save/load working

### Integration:
- [ ] Setup tab fetches from API
- [ ] Charts query Cube.js
- [ ] Style changes apply to charts
- [ ] Auto-save working
- [ ] Undo/redo working

### Testing:
- [ ] Manual testing complete
- [ ] Agent MCP testing complete
- [ ] All features verified
- [ ] No critical bugs

### Documentation:
- [ ] VISUAL-MOCKUP-BLUEPRINT.md (done)
- [ ] IMPLEMENTATION-MASTER-PLAN.md (this file)
- [ ] Component guide
- [ ] Agent tool guide

---

## READY TO EXECUTE

This plan is designed for efficient parallel execution while respecting dependencies.

**Next Command**: Launch Wave 1 (backend foundation) agents:
```
Launch database-analytics-architect and backend-api-specialist in parallel
```

**After Wave 1 completes**: Launch Wave 2 (all 5 frontend agents at once)

**After Wave 2 completes**: Launch Wave 3 (integration, sequential)

**After Wave 3 completes**: Test everything

---

**Estimated Total Time**: 14-16 hours of work, compressed to 2 days with parallel agents

Ready to start execution?
