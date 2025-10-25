# Dashboard Builder Testing Guide

## Overview

Comprehensive end-to-end test suite for the Dashboard Builder application, covering the complete workflow from creation to export.

## Test Suite Summary

**File:** `/frontend/src/__tests__/dashboard-builder.e2e.test.tsx`

**Total Tests:** 55 ✅
**Test Suites:** 15 distinct test categories
**Coverage:** Full workflow from dashboard creation to export

## Running Tests

```bash
# Run all E2E tests
npm test -- --testPathPatterns=e2e.test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only E2E tests
npm run test:e2e
```

## Test Categories

### 1. Create New Dashboard (3 tests)
- ✅ Initialize with empty dashboard
- ✅ Set dashboard title
- ✅ Initialize with default theme

**Validates:** Initial state, configuration, theme setup

### 2. Add Rows with Different Layouts (6 tests)
- ✅ Single column row (1/1)
- ✅ Two column row (1/2 + 1/2)
- ✅ Three column row (1/3 + 1/3 + 1/3)
- ✅ Asymmetric row (1/3 + 2/3)
- ✅ Multiple rows with different layouts
- ✅ Mark dashboard as dirty after changes

**Validates:** Row creation, layout flexibility, state management

### 3. Add Components to Rows (5 tests)
- ✅ Add bar chart component
- ✅ Add scorecard component
- ✅ Add table component
- ✅ Select component after adding
- ✅ Add multiple different chart types

**Validates:** Component insertion, type variety, selection state

### 4. Configure Data Sources and Metrics (7 tests)
- ✅ Configure data source
- ✅ Configure dimension
- ✅ Configure metrics
- ✅ Configure date range
- ✅ Configure filters
- ✅ Complete component data configuration

**Validates:** Data binding, metric selection, filtering, date ranges

### 5. Style Components (4 tests)
- ✅ Configure title styles
- ✅ Configure background and border styles
- ✅ Configure chart appearance
- ✅ Configure metric formatting for scorecard

**Validates:** Visual customization, theming, metric formatting

### 6. Save Dashboard - Auto-save and Manual (6 tests)
- ✅ Trigger auto-save after changes
- ✅ Save manually
- ✅ Update save status during save
- ✅ Handle save errors with retry
- ✅ Don't save if no changes
- ✅ Force save when requested

**Validates:** Auto-save mechanism, manual save, error handling, retry logic

### 7. Export Dashboard (2 tests)
- ✅ Prepare dashboard for JSON export
- ✅ Include all component configurations in export

**Validates:** Serialization, data completeness

### 8. Undo/Redo Functionality (6 tests)
- ✅ Undo title change
- ✅ Redo undone changes
- ✅ Undo adding row
- ✅ Undo adding component
- ✅ Handle multiple undo/redo operations
- ✅ Limit history to 50 steps

**Validates:** History management, undo/redo stack, memory limits

### 9. Conflict Resolution (3 tests)
- ✅ Detect save conflict
- ✅ Resolve conflict by choosing local version
- ✅ Resolve conflict by choosing remote version

**Validates:** Concurrent edit detection, conflict resolution strategies

### 10. Load Existing Dashboard (3 tests)
- ✅ Load dashboard from API
- ✅ Handle load errors
- ✅ Reset history after loading

**Validates:** API integration, error handling, state reset

### 11. Component Operations (4 tests)
- ✅ Remove component
- ✅ Duplicate component
- ✅ Move component between columns
- ✅ Select and deselect component

**Validates:** CRUD operations, drag-and-drop, selection

### 12. Row Operations (3 tests)
- ✅ Remove row
- ✅ Reorder rows
- ✅ Update row height

**Validates:** Row manipulation, reordering, height adjustment

### 13. Complete E2E Workflow (1 test)
- ✅ Full dashboard creation workflow (create → add → configure → style → save)

**Validates:** End-to-end integration, complete user journey

### 14. Zoom Controls (2 tests)
- ✅ Set zoom level
- ✅ Limit zoom to valid range (50-200%)

**Validates:** Zoom functionality, boundary constraints

### 15. Store Reset (1 test)
- ✅ Reset store to initial state

**Validates:** Cleanup, memory management

## Test Architecture

### Mocking Strategy

1. **API Mocks**: All dashboard API calls are mocked
   ```typescript
   jest.mock('@/lib/api/dashboards', () => ({
     saveDashboard: jest.fn(),
     loadDashboard: jest.fn(),
     getAvailableFields: jest.fn(),
     executeQuery: jest.fn(),
   }));
   ```

2. **Component Mocks**: Large UI components are mocked for faster tests
   - DashboardCanvas
   - SettingsSidebar
   - EditorTopbar

3. **Next.js Router**: Mocked in `jest.setup.js`

### Test Fixtures

**Mock Dashboard Structure:**
- 2 rows with mixed layouts
- 3 components (bar chart, scorecard, table)
- Complete configuration with data sources
- Theme configuration

**Mock Data Sources:**
- Google Ads (campaigns, metrics)
- Google Search Console (queries, metrics)

## Key Test Patterns

### 1. State Management Testing
```typescript
act(() => {
  store.addRow(['1/2', '1/2']);
});

const updatedStore = useDashboardStore.getState();
expect(updatedStore.config.rows).toHaveLength(1);
```

### 2. Async Operations
```typescript
await act(async () => {
  await store.save('dashboard-id');
});

expect(dashboardAPI.saveDashboard).toHaveBeenCalled();
```

### 3. History Mechanism
```typescript
// History stores state BEFORE changes
// After setTitle('New'), history contains OLD state
act(() => {
  store.setTitle('New Title');
  store.undo(); // Reverts to previous state
});
```

## Configuration Files

### `jest.config.js`
- Uses Next.js Jest configuration
- jsdom environment for React testing
- Module path mapping for `@/` imports
- Coverage collection from `src/**`

### `jest.setup.js`
- Testing library setup
- Next.js router mocks
- window.matchMedia mock
- IntersectionObserver mock

### `package.json` Scripts
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:e2e": "jest --testPathPattern=e2e.test"
}
```

## Coverage Goals

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

## Performance Benchmarks

- **Total Test Time:** ~0.7 seconds
- **Average Test Time:** ~13ms per test
- **Slowest Test:** Auto-save retry (25ms)

## Continuous Integration

### Pre-commit Hook (Recommended)
```bash
#!/bin/sh
npm test -- --bail --findRelatedTests
```

### CI Pipeline
```yaml
- name: Run Tests
  run: npm test -- --ci --coverage --maxWorkers=2
```

## Debugging Tests

### Enable Verbose Output
```bash
npm test -- --testPathPatterns=e2e.test --verbose
```

### Run Single Test
```bash
npm test -- --testPathPatterns=e2e.test -t "should save manually"
```

### Debug in VS Code
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--testPathPattern=e2e.test"],
  "console": "integratedTerminal"
}
```

## Future Test Additions

### Planned Tests
1. **Accessibility Testing**
   - Keyboard navigation
   - Screen reader compatibility
   - ARIA attributes

2. **Visual Regression Testing**
   - Screenshot comparisons
   - Component rendering
   - Theme variations

3. **Performance Testing**
   - Large dashboard handling (100+ components)
   - Memory leak detection
   - Render performance

4. **Integration Testing**
   - Real API calls (separate test suite)
   - Cube.js integration
   - BigQuery connection

5. **Cross-browser Testing**
   - Chrome, Firefox, Safari
   - Mobile browsers
   - IE11 polyfills

## Troubleshooting

### Common Issues

**Issue:** Tests timeout
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

**Issue:** Module not found
```bash
# Clear cache
npm test -- --clearCache
```

**Issue:** Async state updates
```typescript
// Use waitFor for async updates
await waitFor(() => {
  expect(useDashboardStore.getState().saveStatus).toBe('saved');
});
```

**Issue:** Timer-based tests failing
```typescript
// Use fake timers
jest.useFakeTimers();
act(() => {
  jest.advanceTimersByTime(2500);
});
jest.useRealTimers();
```

## Best Practices

1. **Test Isolation**: Each test resets store via `beforeEach`
2. **Descriptive Names**: Test names describe exact behavior
3. **Arrange-Act-Assert**: Clear test structure
4. **Mock Boundaries**: Mock at API layer, test store logic
5. **Avoid Implementation Details**: Test user-facing behavior
6. **Fast Tests**: Complete suite runs in <1 second

## Contributing

When adding new features, ensure:
1. Add corresponding test cases
2. Maintain 80%+ code coverage
3. Update this document with new test categories
4. Follow existing test patterns
5. Ensure all tests pass before submitting PR

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Zustand Testing Guide](https://github.com/pmndrs/zustand#testing)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Last Updated:** 2025-10-22
**Test Suite Version:** 1.0.0
**Maintainer:** Frontend Development Team
