# Frontend Developer Agent Update Summary

## File Updated
`/home/dogancanbaris/projects/MCP Servers/.claude/agents/frontend-developer.md`

## Sections Added (While Preserving All Existing Content)

### 1. ⚠️ CRITICAL RULES - READ FIRST! (Line 20)
Added 5 critical rules that address recurring agent mistakes:

**Rule #1: Always Use shadcn/ui Components**
- Never create custom UI primitives
- Complete list of available components
- Examples of wrong vs correct patterns

**Rule #2: WPP Branding Colors - MANDATORY**
- Primary brand color: #191D63 (WPP Deep Blue)
- Where to use it (buttons, active states, links, charts)
- How to apply using semantic tokens
- What NEVER to use (Google blue, random colors)

**Rule #3: Hover Color Visibility - CRITICAL!**
- Problem: Text becoming invisible on hover
- Bad patterns to avoid (white on white, mismatched pairs)
- Correct patterns (semantic color pairs)
- WCAG AA contrast requirement (4.5:1)

**Rule #4: No Nested asChild Props**
- Why nested Radix UI asChild breaks functionality
- Correct pattern for combining Tooltip + Dropdown
- Technical explanation (event handler conflicts)

**Rule #5: Always Render Modals/Dialogs**
- Common mistake: Creating state but not rendering component
- Checklist for dialog implementation
- Complete working example

### 2. 🏗️ Dashboard Builder Architecture (Line 288)
Current implementation details agents must know:

**Tech Stack - FINAL DECISIONS**
- ✅ What we ARE using (Next.js 15, React 19, Zustand, dnd-kit, ECharts, shadcn/ui)
- ❌ What we REMOVED (Craft.js, react-grid-layout, Ant Design, Chart.js/Recharts)
- WHY: These were in original plans but abandoned - don't reference them!

**Component Prop Pattern**
- All components extend Partial<ComponentConfig>
- Complete prop interface example
- Shows data props, title props, background/border props, chart appearance

**State Management with Zustand**
- Central store location
- Available store actions and state
- What store handles automatically (undo/redo, auto-save, conflict resolution)
- Important: Use store actions for critical data

**Date Range Format (CRITICAL - Common Bug!)**
- Type definition
- Wrong pattern that causes "Invalid time value" errors
- Correct pattern using utility functions
- Examples for Cube.js timeDimensions and filters

**File Structure**
- Complete directory tree for frontend/src/
- Where to find components, stores, utilities, hooks, types

### 3. 🎨 Common Component Patterns (Line 900)
Production-ready code examples:

**Pattern: Chart Component with Data Fetching**
- Complete BarChart component (140 lines)
- useCubeQuery integration
- Loading/Error/Empty states
- ECharts configuration
- Date range handling with utilities

**Pattern: Form with Controlled Inputs**
- Select dropdown with shadcn/ui
- Controlled state management
- Form submission handling

**Pattern: Modal with Confirmation**
- Dialog with confirmation flow
- State management
- Proper component rendering

### 4. 🔧 Debugging Common Issues (Line 1113)
Solutions to the 5 most common problems:

**Issue #1: "Invalid time value" in Charts**
- Symptom, cause, fix with code

**Issue #2: Dropdown/Dialog Not Opening**
- Symptom, cause, fix with code

**Issue #3: Text Invisible on Hover**
- Symptom, cause, fix with code

**Issue #4: Component Not Updating**
- Symptom, cause, fix with code

**Issue #5: Chart Data Not Refreshing**
- Symptom, cause, fix with code

### 5. 📋 Pre-Flight Checklist (Line 1183)
Quality checklist before submitting work:

- **UI Components** (5 checks)
- **Data Fetching** (5 checks)
- **State Management** (4 checks)
- **Accessibility** (4 checks)
- **Performance** (4 checks)
- **TypeScript** (4 checks)

### 6. Updated "Remember" Section (Line 1225)
Expanded from 8 to 15 critical reminders:

1-7: New frontend-specific rules (shadcn/ui, WPP Blue, semantic colors, asChild, modals, date utilities, Zustand)
8-15: Existing best practices (aggregate first, semantic layer, multi-tenant, performance, parallel work, safety, Context7, token efficiency)

## Impact

**Before:** Generic frontend guidance, missing critical project-specific details
**After:** Comprehensive guide with:
- 5 critical rules preventing recurring mistakes
- Current tech stack (what to use and NOT use)
- Production-ready code patterns
- Debugging solutions for common issues
- Quality checklist for all work
- 15 consolidated best practices

**Total Lines:** 1,243 (increased from ~621)
**New Content:** ~622 lines of critical project context

## Files Modified
- `/home/dogancanbaris/projects/MCP Servers/.claude/agents/frontend-developer.md` (UPDATED)

## Next Steps
This agent file is now complete with all critical missing context. Future frontend work should reference these patterns and rules.
