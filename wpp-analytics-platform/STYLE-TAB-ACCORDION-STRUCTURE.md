# Style Tab Accordion Structure

## Visual Hierarchy

```
┌─────────────────────────────────────────────┐
│  Style Tab                                  │
├─────────────────────────────────────────────┤
│                                             │
│  ▼ Chart Title                             │
│    ├─ Show title                  [toggle] │
│    ├─ Title text              [input]      │
│    ├─ Font size              [select]      │
│    ├─ Font family            [select]      │
│    ├─ Font weight            [select]      │
│    ├─ Text color             [picker]      │
│    └─ Alignment              [← ■ →]       │
│                                             │
│  ▶ Table Options                           │
│                                             │
│  ▶ Table Header                            │
│                                             │
│  ▶ Table Body & Rows                       │
│                                             │
│  ▼ Conditional Formatting                  │
│    ├─ Rule #1                              │
│    │  ├─ Apply to metric     [select]      │
│    │  ├─ Condition           [select]      │
│    │  ├─ Value               [number]      │
│    │  ├─ Background color    [picker]      │
│    │  ├─ Text color          [picker]      │
│    │  └─ Font weight         [select]      │
│    ├─ Rule #2                   [×]        │
│    └─ [+ Add Formatting Rule]             │
│                                             │
│  ▼ Dimension Styles                        │
│    ├─ ▶ Dimension #1: Page URL            │
│    ├─ ▶ Dimension #2: Device Category     │
│    └─ ▶ Dimension #3: Country             │
│                                             │
│  ▼ Metric Styles                           │
│    ├─ ▼ Metric #1: Clicks                 │
│    │  ├─ Number format                     │
│    │  │  ○ Auto (1,234)                    │
│    │  │  ● Number (1,234)                  │
│    │  │  ○ Percent (12.34%)                │
│    │  │  ○ Currency ($1,234)               │
│    │  │  ○ Duration (1:23:45)              │
│    │  ├─ Decimal places      [select: 0]   │
│    │  ├─ Compact numbers     [toggle: off] │
│    │  ├─ Alignment           [← ■ →]       │
│    │  ├─ Text color          [picker]      │
│    │  ├─ Font weight         [select]      │
│    │  ├─ Show comparison     [toggle: off] │
│    │  └─ Show bars in cell   [toggle: off] │
│    ├─ ▶ Metric #2: Impressions            │
│    ├─ ▼ Metric #3: CTR                    │
│    │  ├─ Number format                     │
│    │  │  ○ Auto (1,234)                    │
│    │  │  ○ Number (1,234)                  │
│    │  │  ● Percent (12.34%)                │
│    │  │  ○ Currency ($1,234)               │
│    │  │  ○ Duration (1:23:45)              │
│    │  ├─ Decimal places      [select: 2]   │
│    │  ├─ Compact numbers     [toggle: off] │
│    │  ├─ Alignment           [← ■ →]       │
│    │  ├─ Text color          [picker]      │
│    │  ├─ Font weight         [select]      │
│    │  ├─ Show comparison     [toggle: on]  │
│    │  │  └─ Compare vs       [Previous]    │
│    │  └─ Show bars in cell   [toggle: on]  │
│    │     └─ Bar color        [picker: 🔵] │
│    └─ ▶ Metric #4: Cost                   │
│                                             │
│  ▶ Background & Border                     │
│                                             │
│  ▶ Header & Footer                         │
│                                             │
├─────────────────────────────────────────────┤
│  [Reset to Defaults]                       │
└─────────────────────────────────────────────┘
```

## Accordion Behavior

### Multiple Expand Mode
```tsx
<Accordion type="multiple" className="w-full">
  {/* All sections can be open simultaneously */}
</Accordion>
```

- Users can expand multiple sections at once
- Each section remembers its state
- Smooth animations on expand/collapse

### Nested Accordions
Some sections have nested accordions:

```
▼ Dimension Styles
  ├─ ▼ Dimension #1: Page URL
  │  ├─ Alignment
  │  ├─ Font size
  │  └─ Text color
  ├─ ▶ Dimension #2: Device Category
  └─ ▶ Dimension #3: Country

▼ Metric Styles
  ├─ ▼ Metric #1: Clicks
  │  ├─ Number format (radio group)
  │  ├─ Decimal places
  │  ├─ Compact numbers toggle
  │  └─ [8 more options...]
  ├─ ▶ Metric #2: Impressions
  └─ ▼ Metric #3: CTR
     └─ [All metric options...]
```

## Component Interaction Flow

### 1. User Opens Accordion
```
Click "Metric Styles" trigger
  → Accordion expands
  → Shows all metrics from config
  → Each metric as sub-accordion
```

### 2. User Edits Metric Format
```
User selects "Percent" radio
  → MetricStyleAccordion updates local state
  → Calls onChange({ ...config, format: 'percent' })
  → ChartStyle receives update
  → setMetricStyleConfig() called
  → useEffect detects change
  → syncToConfig() merges all configs
  → onUpdate() sends to parent
  → Dashboard re-renders with new format
```

### 3. User Adds Conditional Format Rule
```
Click "+ Add Formatting Rule"
  → New rule created with defaults
  → Rule #N appears in list
  → User configures:
    - Metric: "CTR"
    - Condition: "Greater than"
    - Value: 10
    - Background: Green (#22c55e)
    - Text: White (#ffffff)
  → Changes sync to config
  → Chart renderer applies rule to cells
```

### 4. User Enables Bars in Cell
```
Toggle "Show bars in cell" ON
  → Bar color picker appears
  → User selects blue (#3b82f6)
  → Config updated with:
    - showBars: true
    - barColor: '#3b82f6'
  → Chart renderer adds progress bar to cell:
    <div class="cell-content">
      <div class="bar" style="width: 75%; background: #3b82f6" />
      <span>1,234</span>
    </div>
```

## State Management

### ChartStyle.tsx State Structure
```tsx
const ChartStyle = ({ config, onUpdate }) => {
  // 9 separate state objects for each accordion
  const [titleConfig, setTitleConfig] = useState({...});
  const [tableConfig, setTableConfig] = useState({...});
  const [tableHeaderConfig, setTableHeaderConfig] = useState({...});
  const [tableBodyConfig, setTableBodyConfig] = useState({...});
  const [conditionalFormattingConfig, setConditionalFormattingConfig] = useState({...});
  const [dimensionStyleConfig, setDimensionStyleConfig] = useState({...});
  const [metricStyleConfig, setMetricStyleConfig] = useState({...});
  const [backgroundBorderConfig, setBackgroundBorderConfig] = useState({...});
  const [headerFooterConfig, setHeaderFooterConfig] = useState({...});

  // Sync all changes to parent
  useEffect(() => {
    onUpdate({
      title: titleConfig.text,
      style: { ...backgroundBorderConfig },
      styleConfigs: {
        title: titleConfig,
        table: tableConfig,
        // ... all configs
      }
    });
  }, [/* all config dependencies */]);
};
```

### Config Storage
```tsx
// Stored in ComponentConfig
interface ComponentConfig {
  id: string;
  type: 'table' | 'scorecard' | 'timeseries' | 'bar' | 'pie';
  title?: string;
  dimensions?: Dimension[];
  metrics?: Metric[];
  style?: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    padding: number;
  };
  styleConfigs?: {
    title: TitleStyleConfig;
    table: TableStyleConfig;
    tableHeader: TableHeaderConfig;
    tableBody: TableBodyConfig;
    conditionalFormatting: ConditionalFormattingConfig;
    dimensions: DimensionStyleConfig;
    metrics: MetricStyleConfig;
    backgroundBorder: BackgroundBorderConfig;
    headerFooter: HeaderFooterConfig;
  };
}
```

## Styling Application

### Chart Renderer Reads Config
```tsx
// In TableChart.tsx or other renderers
const TableChart = ({ config }) => {
  const styles = config.styleConfigs;

  return (
    <div style={{
      backgroundColor: styles?.backgroundBorder?.backgroundColor,
      borderColor: styles?.backgroundBorder?.borderColor,
      borderWidth: styles?.backgroundBorder?.borderWidth,
      padding: styles?.backgroundBorder?.padding
    }}>
      {/* Title */}
      {styles?.title?.show && (
        <h3 style={{
          fontSize: `${styles.title.fontSize}px`,
          fontFamily: styles.title.fontFamily,
          fontWeight: styles.title.fontWeight,
          color: styles.title.color,
          textAlign: styles.title.alignment
        }}>
          {styles.title.text}
        </h3>
      )}

      {/* Table */}
      <table>
        <thead style={{
          fontSize: `${styles.tableHeader.fontSize}px`,
          fontWeight: styles.tableHeader.fontWeight,
          color: styles.tableHeader.textColor,
          backgroundColor: styles.tableHeader.backgroundColor
        }}>
          {/* Headers */}
        </thead>
        <tbody style={{
          fontSize: `${styles.tableBody.fontSize}px`,
          color: styles.tableBody.textColor
        }}>
          {/* Rows with conditional formatting */}
          {data.map(row => (
            <tr style={getConditionalStyle(row, styles.conditionalFormatting)}>
              {/* Cells */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Reset Functionality

### Reset to Defaults Button
```tsx
const resetToDefaults = () => {
  // Reset all 9 configs to default values
  setTitleConfig({ text: '', show: true, ... });
  setTableConfig({ showRowNumbers: false, ... });
  // ... reset all configs
};

<Button onClick={resetToDefaults} variant="outline">
  Reset to Defaults
</Button>
```

### Default Values
All defaults match common dashboard conventions:
- Background: White (#ffffff)
- Border: Light gray (#e5e7eb)
- Text: Dark gray (#374151)
- Headers: Semi-bold, slightly lighter gray
- Padding: 16px
- Border radius: 8px
- Font sizes: 14px body, 16px title
- Alignment: Left for text, right for numbers

## Accessibility

### Keyboard Navigation
- Tab through accordion triggers
- Enter/Space to expand/collapse
- Tab through form controls within sections
- Esc to close color pickers

### Screen Reader Support
```tsx
<AccordionTrigger aria-expanded={isOpen}>
  Metric #1: Clicks
</AccordionTrigger>
<AccordionContent role="region" aria-labelledby="metric-1-trigger">
  {/* Controls */}
</AccordionContent>
```

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trap in color picker modals
- Focus returns to trigger after close

## Performance Considerations

### Optimizations
1. **Lazy rendering**: Accordion content only rendered when expanded
2. **Debounced updates**: Color picker changes debounced to reduce re-renders
3. **Memoization**: Child accordions memoized to prevent unnecessary updates
4. **Batched state**: useEffect batches all config changes into single parent update

### Best Practices
- Keep accordion sections focused and small
- Avoid complex calculations in render
- Use `React.memo()` for child components
- Debounce slider/input changes

## Future Enhancements

### Potential Additions
1. **Preset Themes**: Save/load style presets
2. **Style Templates**: Apply common style patterns
3. **Color Palettes**: Predefined color schemes
4. **Font Pairings**: Suggested font combinations
5. **Responsive Preview**: See styles at different screen sizes
6. **Export Styles**: Share style configs as JSON
7. **Import Styles**: Load styles from file
8. **Version History**: Undo/redo style changes

### Component Extensions
- ChartStyleAccordion (for chart-specific options)
- LegendStyleAccordion (legend customization)
- AxisStyleAccordion (axis labels, gridlines)
- TooltipStyleAccordion (tooltip appearance)
- AnimationAccordion (transition effects)

## Summary

The enhanced Style tab provides:
- **9 comprehensive accordion sections**
- **100+ individual style controls**
- **Nested accordions** for per-dimension and per-metric styling
- **Dynamic configuration** based on chart data
- **Real-time preview** (via parent component)
- **Reset functionality** for quick defaults
- **Modular architecture** for easy maintenance
- **Type-safe implementation** with TypeScript
- **Accessible interface** with keyboard support
- **Performance optimized** with lazy rendering

Ready for chart renderers to consume and apply these rich styling options!
