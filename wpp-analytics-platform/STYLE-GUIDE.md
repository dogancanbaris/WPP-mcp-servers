# WPP Analytics Platform - Style Guide

## 🎨 Brand Colors

### Primary Palette
- **WPP Blue:** `#191D63` - Primary brand color
  - Use for: Primary buttons, active states, links, focus rings
  - Hover: `#14173E` (darker)
  - Light: `#2A2F8F` (lighter for gradients)

- **Accent Green:** `#1E8E3E` - Secondary actions
  - Use for: Success states, enabled filters, positive trends

### Semantic Color Tokens (Use These!)

```css
/* Light Mode */
--background: #ffffff
--foreground: #0f172a
--primary: #191D63          /* WPP Blue */
--primary-foreground: #ffffff
--accent: #1E8E3E           /* Green */
--accent-foreground: #ffffff
--muted: #f8f9fa
--muted-foreground: #5f6368
--border: #e0e0e0

/* Dark Mode */
--background: #0f172a
--foreground: #f8fafc
--primary: #2A2F8F          /* Lighter WPP Blue for dark mode */
--primary-foreground: #ffffff
```

**RULE:** Always use semantic tokens, never hardcoded hex colors in components

## 🎯 Typography

### Font Families
- **Primary:** `font-sans` (Geist Sans)
- **Monospace:** `font-mono` (Geist Mono)
- **Headings:** `font-semibold` or `font-bold`

### Scale
- `text-xs` (12px) - Captions, helper text
- `text-sm` (14px) - Body text, buttons, form labels
- `text-base` (16px) - Default paragraph text
- `text-lg` (18px) - Section headings
- `text-xl` (20px) - Page headings
- `text-2xl` (24px) - Hero headings

### Weights
- `font-normal` (400) - Body text
- `font-medium` (500) - Emphasis, labels
- `font-semibold` (600) - Headings, buttons
- `font-bold` (700) - Strong emphasis

## 📏 Spacing

### Gap Scale (Between Elements)
- `gap-1` (4px) - Tight grouping (menu items)
- `gap-2` (8px) - Standard spacing (buttons in group)
- `gap-3` (12px) - Section spacing
- `gap-4` (16px) - Major divisions
- `gap-6` (24px) - Page sections

### Padding Scale
- `p-1` (4px) - Compact (dropdown content)
- `p-2` (8px) - Standard button padding
- `p-3` (12px) - Comfortable button padding
- `p-4` (16px) - Card padding
- `p-6` (24px) - Major container padding

## 🔘 Component Sizing

### Button Heights
- **Menu buttons (Row 1):** `h-10` (40px)
- **Toolbar buttons (Row 2):** `h-9` (36px)
- **Icon-only buttons:** `h-9 w-9` (square)
- **Form buttons:** `h-10`

### Icon Sizes
- **Toolbar icons:** `h-4 w-4` (16px)
- **Large icons:** `h-6 w-6` (24px)
- **Extra large (empty states):** `h-16 w-16` (64px)
- **Chevron down:** `h-3 w-3` (12px)

### Container Widths
- **Sidebar:** `w-80` (320px)
- **Max content:** `max-w-7xl` (1280px)
- **Dialogs:** `max-w-4xl` (896px)
- **Cards:** `max-w-md` (448px)

## 🎭 Hover States - CRITICAL RULES!

### ⚠️ Visibility Rule
**Hover text must ALWAYS be readable with good contrast (WCAG AA: 4.5:1)**

### Correct Semantic Pairs

```tsx
/* ✅ CORRECT - Always readable */
hover:bg-accent hover:text-accent-foreground       // White on green
hover:bg-primary hover:text-primary-foreground     // White on WPP blue
hover:bg-muted hover:text-foreground              // Dark on light gray
hover:bg-destructive hover:text-destructive-foreground  // White on red

/* ❌ WRONG - Text becomes invisible */
hover:bg-white hover:text-white          // White on white!
hover:bg-background hover:text-background  // Same color!
hover:bg-muted hover:text-white          // Poor contrast
```

### Testing Hover States
After implementing hover, verify:
1. Hover over element in browser
2. Check text is clearly visible
3. Use browser DevTools contrast checker
4. Test in both light and dark modes

## 🧩 shadcn/ui Component Patterns

### Button Variants
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Primary Action</Button>    // Solid WPP blue
<Button variant="outline">Secondary</Button>         // Border only
<Button variant="ghost">Subtle Action</Button>       // No background
<Button variant="destructive">Delete</Button>        // Red
<Button variant="link">Text Link</Button>            // Underlined text

// Sizes
<Button size="default">Normal</Button>               // h-10 px-4 py-2
<Button size="sm">Compact</Button>                   // h-9 px-3
<Button size="lg">Large</Button>                     // h-11 px-8
<Button size="icon">Icon Only</Button>               // h-10 w-10 (square)
```

### Dialog/Modal Pattern
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Dialog</Button>

{/* ✅ MUST render Dialog component */}
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Dropdown Menu Pattern
```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleAction}>Action</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Another</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**⚠️ CRITICAL:** Do NOT nest TooltipTrigger inside DropdownMenuTrigger if both use `asChild`!

### Tooltip Pattern
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <HelpCircle className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Help text here</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Select/Dropdown Pattern
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Card Pattern
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Optional footer actions */}
  </CardFooter>
</Card>
```

### Input Pattern
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="grid w-full gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input
    type="email"
    id="email"
    placeholder="Email"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>
```

### Checkbox Pattern
```tsx
import { Checkbox } from '@/components/ui/checkbox';

<div className="flex items-center space-x-2">
  <Checkbox
    id="terms"
    checked={checked}
    onCheckedChange={setChecked}
  />
  <label
    htmlFor="terms"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Accept terms and conditions
  </label>
</div>
```

### Tabs Pattern
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    {/* Overview content */}
  </TabsContent>
  <TabsContent value="analytics">
    {/* Analytics content */}
  </TabsContent>
</Tabs>
```

## 📊 Data Visualization Standards

### Chart Colors
```tsx
// Use semantic color palette for charts
const chartColors = {
  primary: 'hsl(var(--primary))',      // #191D63 WPP Blue
  accent: 'hsl(var(--accent))',        // #1E8E3E Green
  warning: '#f59e0b',                  // Amber
  destructive: 'hsl(var(--destructive))', // Red
  muted: 'hsl(var(--muted))',          // Light gray
};

// Multi-series chart palette (up to 8 series)
const seriesColors = [
  '#191D63', // WPP Blue
  '#1E8E3E', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
];
```

### Chart Component Pattern
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<Card>
  <CardHeader>
    <CardTitle>Performance Trend</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

### Empty State Pattern
```tsx
import { FileQuestion } from 'lucide-react';

<div className="flex flex-col items-center justify-center p-8 text-center">
  <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No data available</h3>
  <p className="text-sm text-muted-foreground mb-4">
    Get started by creating your first item
  </p>
  <Button>Create Item</Button>
</div>
```

### Loading State Pattern
```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Table skeleton
<div className="space-y-2">
  <Skeleton className="h-10 w-full" />
  <Skeleton className="h-10 w-full" />
  <Skeleton className="h-10 w-full" />
</div>

// Card skeleton
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-48" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-[200px] w-full" />
  </CardContent>
</Card>
```

## 🎨 Layout Patterns

### Two-Row Navigation Layout
```tsx
<div className="flex flex-col h-screen">
  {/* Row 1: Main Menu (40px) */}
  <div className="h-10 border-b bg-background flex items-center px-4 gap-4">
    <div className="font-semibold">WPP Analytics</div>
    <nav className="flex gap-1">
      <Button variant="ghost" size="sm">Dashboards</Button>
      <Button variant="ghost" size="sm">Data Sources</Button>
      <Button variant="ghost" size="sm">Settings</Button>
    </nav>
  </div>

  {/* Row 2: Toolbar (36px) */}
  <div className="h-9 border-b bg-muted/30 flex items-center px-4 gap-2">
    <Button variant="ghost" size="sm">
      <Plus className="h-4 w-4 mr-2" />
      New
    </Button>
    {/* More toolbar actions */}
  </div>

  {/* Main Content Area */}
  <div className="flex-1 overflow-auto">
    {/* Page content */}
  </div>
</div>
```

### Sidebar Layout
```tsx
<div className="flex h-screen">
  {/* Sidebar (320px) */}
  <aside className="w-80 border-r bg-muted/30 overflow-y-auto">
    <div className="p-4">
      {/* Sidebar content */}
    </div>
  </aside>

  {/* Main Content */}
  <main className="flex-1 overflow-auto">
    <div className="max-w-7xl mx-auto p-6">
      {/* Page content */}
    </div>
  </main>
</div>
```

### Grid Layout
```tsx
{/* Responsive grid - 1 col mobile, 2 col tablet, 3 col desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>{/* Card 1 */}</Card>
  <Card>{/* Card 2 */}</Card>
  <Card>{/* Card 3 */}</Card>
</div>

{/* Dashboard grid - 2 col desktop, 1 col mobile */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card className="lg:col-span-2">{/* Full width chart */}</Card>
  <Card>{/* Metric 1 */}</Card>
  <Card>{/* Metric 2 */}</Card>
</div>
```

## ♿ Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use `tabIndex={0}` for custom interactive elements
- Provide keyboard shortcuts with visible hints
- Use `aria-label` for icon-only buttons

```tsx
// ✅ CORRECT - Accessible icon button
<Button variant="ghost" size="icon" aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>

// ❌ WRONG - No accessible name
<Button variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>
```

### ARIA Labels
```tsx
// Dialogs
<Dialog>
  <DialogContent aria-describedby="dialog-description">
    <DialogHeader>
      <DialogTitle>Delete Item</DialogTitle>
    </DialogHeader>
    <p id="dialog-description">
      Are you sure you want to delete this item?
    </p>
  </DialogContent>
</Dialog>

// Forms
<Label htmlFor="email">Email Address</Label>
<Input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
/>
```

### Focus Management
```tsx
// Trap focus in modals
import { FocusTrap } from '@/components/ui/focus-trap';

<Dialog open={open}>
  <DialogContent>
    <FocusTrap>
      {/* Dialog content - focus stays inside */}
    </FocusTrap>
  </DialogContent>
</Dialog>

// Restore focus after close
const triggerRef = useRef<HTMLButtonElement>(null);

const handleClose = () => {
  setOpen(false);
  triggerRef.current?.focus();
};
```

## 🎯 Responsive Design

### Breakpoints (Tailwind default)
```tsx
// Mobile first approach
<div className="
  p-4              /* Mobile: 16px padding */
  md:p-6           /* Tablet (768px+): 24px padding */
  lg:p-8           /* Desktop (1024px+): 32px padding */
">

// Responsive visibility
<div className="
  hidden           /* Hidden on mobile */
  md:block         /* Visible on tablet+ */
">

// Responsive grid
<div className="
  grid-cols-1      /* 1 column on mobile */
  sm:grid-cols-2   /* 2 columns on small (640px+) */
  lg:grid-cols-3   /* 3 columns on large (1024px+) */
">
```

### Mobile Navigation Pattern
```tsx
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Mobile: Hamburger menu
// Desktop: Horizontal nav
<div className="flex items-center gap-4">
  {/* Mobile Menu */}
  <Sheet>
    <SheetTrigger asChild className="md:hidden">
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
    <SheetContent side="left">
      <nav className="flex flex-col gap-2">
        <Button variant="ghost">Dashboards</Button>
        <Button variant="ghost">Data Sources</Button>
      </nav>
    </SheetContent>
  </Sheet>

  {/* Desktop Nav */}
  <nav className="hidden md:flex gap-2">
    <Button variant="ghost">Dashboards</Button>
    <Button variant="ghost">Data Sources</Button>
  </nav>
</div>
```

## 🚨 Common Pitfalls to Avoid

### ❌ DON'T: Hardcode colors
```tsx
// ❌ WRONG
<div className="bg-blue-600 text-white">

// ✅ CORRECT
<div className="bg-primary text-primary-foreground">
```

### ❌ DON'T: Use inline styles for theming
```tsx
// ❌ WRONG
<div style={{ backgroundColor: '#191D63', color: '#ffffff' }}>

// ✅ CORRECT
<div className="bg-primary text-primary-foreground">
```

### ❌ DON'T: Forget hover state contrast
```tsx
// ❌ WRONG - Text becomes invisible
<Button className="hover:bg-white hover:text-white">

// ✅ CORRECT
<Button className="hover:bg-accent hover:text-accent-foreground">
```

### ❌ DON'T: Nest asChild triggers
```tsx
// ❌ WRONG - Breaks accessibility
<DropdownMenuTrigger asChild>
  <TooltipTrigger asChild>
    <Button>Nested Triggers</Button>
  </TooltipTrigger>
</DropdownMenuTrigger>

// ✅ CORRECT - Separate or remove asChild
<Tooltip>
  <TooltipTrigger asChild>
    <Button>Just Button</Button>
  </TooltipTrigger>
  <TooltipContent>Tooltip text</TooltipContent>
</Tooltip>
```

### ❌ DON'T: Render Dialog without Dialog component
```tsx
// ❌ WRONG - Only renders trigger, dialog never appears
<DialogTrigger>
  <Button>Open</Button>
</DialogTrigger>

// ✅ CORRECT - Include full Dialog component
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### ❌ DON'T: Skip loading states
```tsx
// ❌ WRONG - No loading indicator
const { data } = useQuery();
return <Table data={data} />;

// ✅ CORRECT - Show skeleton while loading
const { data, isLoading } = useQuery();
if (isLoading) return <Skeleton className="h-[400px]" />;
return <Table data={data} />;
```

### ❌ DON'T: Ignore empty states
```tsx
// ❌ WRONG - Blank screen if no data
return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;

// ✅ CORRECT - Show helpful empty state
if (data.length === 0) {
  return (
    <div className="text-center p-8">
      <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">No items found</p>
    </div>
  );
}
return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
```

## 📝 Code Organization

### Component File Structure
```tsx
// components/features/dashboard/dashboard-card.tsx

import { type FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 1. Types
interface DashboardCardProps {
  title: string;
  value: string | number;
  trend?: number;
}

// 2. Component
export const DashboardCard: FC<DashboardCardProps> = ({
  title,
  value,
  trend
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend > 0 ? '+' : ''}{trend}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
};
```

### Import Order
```tsx
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Icons
import { Plus, Trash2 } from 'lucide-react';

// 5. Local components
import { DataTable } from '@/components/data-table';
import { DashboardCard } from './dashboard-card';

// 6. Utils and hooks
import { cn } from '@/lib/utils';
import { useDashboard } from '@/hooks/use-dashboard';

// 7. Types
import { type Dashboard } from '@/types';
```

## 🧪 Testing Checklist

Before deploying any component:

- [ ] Test in light mode and dark mode
- [ ] Test all hover states for text visibility
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test on mobile (320px width minimum)
- [ ] Test on desktop (1920px+ width)
- [ ] Verify ARIA labels on icon-only buttons
- [ ] Check loading states work correctly
- [ ] Check empty states are helpful
- [ ] Verify error states display properly
- [ ] Test with screen reader (if possible)

## 📚 Additional Resources

### Internal Documentation
- `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/COMPONENT-CATALOG.md` - Component library reference
- `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/DEVELOPER-GUIDE.md` - Development workflows

### External Resources
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Lucide Icons](https://lucide.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated:** 2025-10-23
**Maintained By:** WPP Analytics Platform Team
