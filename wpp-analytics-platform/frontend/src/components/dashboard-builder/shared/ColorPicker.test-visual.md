# ColorPicker Visual Test Guide

## Quick Visual Test

To test the ColorPicker component, you can add it to any existing page or create a test page:

### Option 1: Add to Existing Dashboard Page

```tsx
// In any dashboard-builder page or component
import { ColorPicker } from '@/components/dashboard-builder/shared';

function TestSection() {
  const [color, setColor] = useState('#1A73E8');

  return (
    <div className="p-8">
      <ColorPicker
        label="Test Color"
        value={color}
        onChange={setColor}
      />
      
      <div 
        className="mt-4 p-4 rounded-md"
        style={{ backgroundColor: color }}
      >
        Selected color: {color}
      </div>
    </div>
  );
}
```

### Option 2: Create Test Page

Create `/frontend/src/app/test/color-picker/page.tsx`:

```tsx
"use client"

import { useState } from 'react';
import { ColorPicker } from '@/components/dashboard-builder/shared';

export default function ColorPickerTestPage() {
  const [color1, setColor1] = useState('#1A73E8');
  const [color2, setColor2] = useState('#EA4335');
  const [color3, setColor3] = useState('#34A853');

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">ColorPicker Component Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Primary Color</h2>
          <ColorPicker
            label="Primary"
            value={color1}
            onChange={setColor1}
          />
          <div 
            className="h-20 rounded-md"
            style={{ backgroundColor: color1 }}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Secondary Color</h2>
          <ColorPicker
            label="Secondary"
            value={color2}
            onChange={setColor2}
          />
          <div 
            className="h-20 rounded-md"
            style={{ backgroundColor: color2 }}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Accent Color</h2>
          <ColorPicker
            label="Accent"
            value={color3}
            onChange={setColor3}
          />
          <div 
            className="h-20 rounded-md"
            style={{ backgroundColor: color3 }}
          />
        </div>
      </div>

      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div 
          className="p-6 rounded-md"
          style={{ backgroundColor: color1 }}
        >
          <h4 
            className="text-2xl font-bold"
            style={{ color: color2 }}
          >
            Sample Chart Title
          </h4>
          <p 
            className="mt-2"
            style={{ color: color3 }}
          >
            This is a preview using your selected colors
          </p>
        </div>
      </div>
    </div>
  );
}
```

Then navigate to: `http://localhost:3000/test/color-picker`

## Visual Checks

When testing, verify:

### ✅ Color Swatch
- [ ] Shows current color correctly
- [ ] Has hover effect
- [ ] Has focus ring on keyboard focus
- [ ] Opens popover on click

### ✅ Hex Input
- [ ] Displays current hex value
- [ ] Accepts uppercase/lowercase
- [ ] Auto-adds # if missing
- [ ] Validates on blur
- [ ] Updates swatch in real-time

### ✅ Color Picker Popover
- [ ] Opens below swatch button
- [ ] Has smooth animation
- [ ] Closes on click outside
- [ ] Shows color gradient picker
- [ ] Allows dragging to select color

### ✅ Recent Colors
- [ ] Shows after first selection
- [ ] Displays last 8 colors
- [ ] Clicking applies color
- [ ] Has hover effects

### ✅ Preset Colors
- [ ] Shows 24 default colors
- [ ] Arranged in 8x3 grid
- [ ] Clicking applies color
- [ ] Has hover effects
- [ ] Tooltips show hex values

### ✅ Responsive Behavior
- [ ] Works on mobile (320px+)
- [ ] Popover doesn't overflow screen
- [ ] Touch targets adequate (44px+)

### ✅ Accessibility
- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader friendly

## Manual Test Scenarios

### Scenario 1: Basic Usage
1. Click color swatch
2. Drag in color picker
3. Verify hex updates
4. Click outside to close
5. Click swatch again
6. Verify recent colors appear

### Scenario 2: Hex Input
1. Type "FF0000" (without #)
2. Tab out
3. Verify it becomes "#FF0000"
4. Type "#1A73E8"
5. Verify swatch updates

### Scenario 3: Presets
1. Click color swatch
2. Click any preset color
3. Verify color applies
4. Open again
5. Verify color in recent

### Scenario 4: Multiple Pickers
1. Open multiple ColorPickers
2. Change one
3. Open another
4. Verify first closes
5. Verify each maintains state

## Integration Test

Test in real ChartStyle component:

```tsx
// In ChartStyle.tsx, add:
<AccordionSection title="Test Colors">
  <ColorPicker
    label="Title Color"
    value={style.titleColor}
    onChange={(color) => updateStyle({ titleColor: color })}
  />
</AccordionSection>
```

Verify:
- [ ] Works in sidebar
- [ ] Popover doesn't overflow
- [ ] State persists
- [ ] Integrates with form

## Performance Check

Monitor performance with React DevTools:
- ColorPicker should not re-render unnecessarily
- Opening popover should be instant
- Dragging should be smooth (60fps)
- No memory leaks when opening/closing

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

## Known Limitations

- Recent colors reset on page refresh (by design)
- Alpha channel not implemented yet (showAlpha prop reserved)
- Popover position fixed (always below, future: smart positioning)
