# Frontend Dependencies Guide

This document explains the purpose of each dependency category in our Next.js application.

## Removed Dependencies (2025-10-23)

The following unused dependencies were removed:

- `@craftjs/core` (^0.2.12) - Page builder library, not used (project abandoned)
- `react-grid-layout` (^1.5.2) - Layout system, replaced by @dnd-kit

## Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.5.6 | Next.js App Router framework |
| `react` | 19.1.0 | React library |
| `react-dom` | 19.1.0 | React DOM renderer |

## UI Components (shadcn/ui with Radix Primitives)

All `@radix-ui/*` packages provide unstyled, accessible UI primitives that are styled with Tailwind CSS:

| Package | Purpose |
|---------|---------|
| `@radix-ui/react-accordion` | Collapsible content panels |
| `@radix-ui/react-alert-dialog` | Modal confirmation dialogs |
| `@radix-ui/react-avatar` | User avatar component |
| `@radix-ui/react-checkbox` | Checkbox inputs |
| `@radix-ui/react-dialog` | Modal dialogs |
| `@radix-ui/react-dropdown-menu` | Dropdown menus |
| `@radix-ui/react-label` | Form labels |
| `@radix-ui/react-popover` | Floating popover content |
| `@radix-ui/react-radio-group` | Radio button groups |
| `@radix-ui/react-scroll-area` | Custom scrollbars |
| `@radix-ui/react-select` | Select dropdowns |
| `@radix-ui/react-separator` | Visual dividers |
| `@radix-ui/react-slider` | Range sliders |
| `@radix-ui/react-slot` | Component composition utility |
| `@radix-ui/react-switch` | Toggle switches |
| `@radix-ui/react-tabs` | Tabbed interfaces |
| `@radix-ui/react-toggle` | Toggle buttons |
| `@radix-ui/react-toggle-group` | Toggle button groups |
| `@radix-ui/react-tooltip` | Tooltips |

## State Management & Data Fetching

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.8 | Global state management with undo/redo |
| `@tanstack/react-query` | ^5.90.5 | Server state & caching |
| `@refinedev/core` | ^5.0.4 | Data provider abstraction |
| `@refinedev/nextjs-router` | ^7.0.3 | Next.js routing integration |

## Data Layer

| Package | Version | Purpose |
|---------|---------|---------|
| `@cubejs-client/core` | ^1.3.82 | Cube.js analytics client |
| `@cubejs-client/react` | ^1.3.82 | React hooks for Cube.js |
| `@supabase/supabase-js` | ^2.76.1 | Supabase client (auth + database) |
| `@supabase/ssr` | ^0.7.0 | Server-side rendering support |

## Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| `echarts` | ^5.6.0 | Apache ECharts charting library |
| `echarts-for-react` | ^3.0.2 | React wrapper for ECharts |
| `recharts` | ^3.3.0 | Alternative chart library (lightweight) |

## Drag & Drop

| Package | Version | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | ^6.3.1 | Drag and drop core functionality |
| `@dnd-kit/sortable` | ^10.0.0 | Sortable lists and grids |
| `@dnd-kit/utilities` | ^3.2.2 | Helper utilities |

**Note:** Replaced `react-grid-layout` for better accessibility and performance.

## Rich Text Editing

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/react` | ^3.7.2 | Headless rich text editor |
| `@tiptap/starter-kit` | ^3.7.2 | Basic editor extensions |

## Notifications

| Package | Version | Purpose |
|---------|---------|---------|
| `sonner` | ^2.0.7 | Toast notification system |

## Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `date-fns` | ^4.1.0 | Date manipulation and formatting |
| `react-day-picker` | ^9.11.1 | Date picker component |
| `clsx` | ^2.1.1 | Conditional className builder |
| `tailwind-merge` | ^3.3.1 | Merge Tailwind classes intelligently |
| `class-variance-authority` | ^0.7.1 | Component variant system (cva) |
| `lucide-react` | ^0.546.0 | Icon library |
| `lz-string` | ^1.5.0 | String compression for URL state |
| `zod` | ^4.1.12 | Schema validation |

## Export/Import

| Package | Version | Purpose |
|---------|---------|---------|
| `html2canvas` | ^1.4.1 | HTML to canvas for PDF screenshots |
| `jspdf` | ^3.0.3 | PDF generation |
| `jspdf-autotable` | ^5.0.2 | PDF table generation |
| `jszip` | ^3.10.1 | ZIP file creation |
| `@types/jszip` | ^3.4.0 | TypeScript types for jszip |
| `xlsx` | ^0.18.5 | Excel file export/import |

## Theming & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `next-themes` | ^0.4.6 | Dark mode theme switching |
| `react-colorful` | ^5.6.1 | Color picker component |

## Development Dependencies

See `devDependencies` section in package.json for:
- TypeScript and type definitions
- ESLint and linting configuration
- Jest testing framework
- Tailwind CSS and PostCSS
- Testing utilities (@testing-library/*)

## Security Notes

### Known Vulnerabilities (as of 2025-10-23)

**xlsx (^0.18.5) - HIGH severity**
- Issue: Prototype Pollution and ReDoS vulnerabilities
- CVE: GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9
- Fix: Upgrade to ^0.20.2 or later
- Status: Pending update (requires testing)
- Mitigation: Only process trusted Excel files, validate inputs

**Action Required:** Update xlsx to latest secure version in next maintenance cycle.

## Maintenance Notes

### When to Update Dependencies

1. **Security updates**: Apply immediately
2. **Minor/patch updates**: Apply monthly
3. **Major updates**: Test thoroughly, may require migration
4. **Breaking changes**: Review changelog and update code

### Before Removing Dependencies

1. Search codebase for imports: `grep -r "from 'package-name'" src/`
2. Check if used in any config files
3. Run build after removal to catch issues
4. Test critical user flows

### Dependency Size Budget

Keep bundle size under control:
- Run `npm run build` to check bundle size
- Use `next/dynamic` for code splitting
- Consider tree-shaking friendly alternatives
- Monitor with `@next/bundle-analyzer`

## Related Documentation

- [Component Catalog](./COMPONENT-CATALOG.md) - UI component usage
- [Developer Guide](./DEVELOPER-GUIDE.md) - Development setup
- [README.md](./README.md) - Project overview
