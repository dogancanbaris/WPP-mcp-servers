# Topbar Design Tokens Reference

Quick reference for the professional SaaS topbar design system.

---

## Layout Heights

```tsx
// Row 1: Menu Bar
className="h-10"  // 40px

// Row 2: Toolbar
className="h-12"  // 48px

// Menu Buttons (in Row 1)
className="h-10"  // Match row height

// Toolbar Buttons (in Row 2)
className="h-9"   // 36px (breathing room)
className="w-9"   // For icon-only buttons

// Avatar
className="h-9 w-9"

// Separators
className="h-5"   // Menu bar separators
className="h-6"   // Toolbar separators
```

---

## Spacing System

```tsx
// Tight groups (menu items within a group)
gap-1  // 4px

// Standard spacing (toolbar buttons, major sections)
gap-2  // 8px

// Major divisions (topbar padding)
gap-4  // 16px

// Button internal padding
px-3   // Text buttons: 12px horizontal
px-4   // Container padding: 16px

// Dropdown offsets
sideOffset={4}  // Menu dropdowns
sideOffset={8}  // Toolbar dropdowns and tooltips
```

---

## Color Tokens (Theme-Aware)

```tsx
// Backgrounds
bg-background       // Main topbar background (white/dark)
bg-muted/30        // Toolbar subtle background
bg-muted           // Hover state
bg-accent          // Active/selected state

// Borders
border             // Standard border
bg-border          // Separator color

// Text
// (default)       // Primary text
text-muted-foreground  // Secondary text (icons)

// Focus/Interaction
ring-ring          // Focus ring color
ring-primary       // Primary accent ring
```

---

## Typography Scale

```tsx
// Menu buttons
text-sm font-medium

// Toolbar button labels
text-sm font-medium

// Dropdown menu items
text-sm

// Tooltips
text-xs

// Avatar fallback
text-sm font-medium
```

---

## Icon Sizes

```tsx
// All toolbar/menu icons
h-4 w-4  // 16px × 16px

// ChevronDown (dropdown indicators)
h-3 w-3  // 12px × 12px

// Logo
h-7 w-7  // 28px × 28px
```

---

## Button Variants by Purpose

```tsx
// Primary actions (Add Chart, Save)
variant="default"  // Blue background, white text

// Secondary actions (Undo, Redo)
variant="outline"  // Border, white background

// Utility actions (Zoom, View)
variant="ghost"    // No border, transparent

// Menu items (File, Edit, etc.)
variant="ghost"    // Minimal visual weight
```

---

## Transitions

```tsx
// All interactive elements
transition-colors  // 150ms (shadcn default)

// Avatar (special case)
transition-all     // For ring animation
```

---

## Shadows

```tsx
// Logo
shadow-sm

// Dropdown menus
shadow-lg

// Dropdowns also need border
className="shadow-lg border"
```

---

## Focus States

```tsx
// All buttons
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-0  // No offset for compact UI
```

---

## Component Patterns

### Menu Button (Row 1)
```tsx
<Button
  variant="ghost"
  size="sm"
  className={cn(
    'h-10 px-3 text-sm font-medium',
    'hover:bg-muted',
    'transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ring'
  )}
>
  {label}
</Button>
```

### Icon-Only Toolbar Button (Row 2)
```tsx
<Button
  variant="outline"
  size="icon"
  className={cn(
    'h-9 w-9',
    'transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ring'
  )}
>
  <Icon className="h-4 w-4" />
</Button>

// ALWAYS wrap with Tooltip
<TooltipProvider delayDuration={300}>
  <Tooltip>
    <TooltipTrigger asChild>{button}</TooltipTrigger>
    <TooltipContent side="bottom" sideOffset={8}>
      {tooltip}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Text Toolbar Button (Row 2)
```tsx
<Button
  variant="default"  // or "outline" / "ghost"
  size="sm"
  className={cn(
    'h-9 gap-2 px-3',
    'transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ring'
  )}
>
  <Icon className="h-4 w-4" />
  <span className="text-sm font-medium">{label}</span>
</Button>
```

### Separator
```tsx
// Use shadcn/ui Separator
<Separator orientation="vertical" className="h-6" />

// Or manual (in Row 1 grouping)
<div className="h-5 w-px bg-border mx-1" />
```

### Dropdown Menu
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    {/* Button here */}
  </DropdownMenuTrigger>
  <DropdownMenuContent
    align="start"  // or "end" for right-aligned
    className="min-w-[200px] shadow-lg border"
    sideOffset={4}  // or {8} for toolbar
  >
    {/* Items here */}
  </DropdownMenuContent>
</DropdownMenu>
```

### Avatar with Dropdown
```tsx
<Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
  <AvatarImage src={image} />
  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
    {fallback}
  </AvatarFallback>
</Avatar>
```

---

## Accessibility Checklist

- ✅ All icon-only buttons have tooltips
- ✅ Focus rings visible on keyboard navigation
- ✅ Proper ARIA labels (from shadcn/ui)
- ✅ Keyboard navigation in dropdowns
- ✅ Color contrast meets WCAG AA standards
- ✅ Touch targets ≥ 36px (h-9 = 36px)

---

## Dark Mode Support

All color tokens automatically adapt:
- `bg-background` → dark background
- `bg-muted` → dark muted
- `text-foreground` → light text
- `border` → dark border
- `ring-ring` → theme accent

No manual dark mode classes needed!

---

## Quick Copy-Paste

### Menu Button
```tsx
<Button variant="ghost" size="sm" className="h-10 px-3 text-sm font-medium hover:bg-muted transition-colors">
  File
</Button>
```

### Icon Button with Tooltip
```tsx
<TooltipProvider delayDuration={300}>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline" size="icon" className="h-9 w-9 transition-colors">
        <Icon className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" sideOffset={8}>
      Button Name
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Primary Action Button
```tsx
<Button variant="default" size="sm" className="h-9 gap-2 px-3">
  <Icon className="h-4 w-4" />
  <span className="text-sm font-medium">Add Chart</span>
</Button>
```

### Separator
```tsx
<Separator orientation="vertical" className="h-6" />
```

---

## Browser Testing

Tested in:
- Chrome/Edge (Chromium)
- Firefox
- Safari

All transitions GPU-accelerated with `transition-colors`.
