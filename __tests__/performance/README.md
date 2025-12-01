# Performance Test Suite

Automated tests to verify and monitor performance optimizations.

## Test Categories

### 1. Component Rendering Tests (`component-rendering.test.tsx`)
Tests React optimization techniques:
- ✅ React.memo effectiveness on WorkLogForm
- ✅ React.memo effectiveness on PendingSubmissions
- ✅ useMemo for project options memoization
- ✅ useCallback for memoized function references

**What it validates:**
- Components don't re-render unnecessarily
- Memoization works correctly
- Parent re-renders don't cause child re-renders

### 2. API Payload Tests (`api-payload.test.ts`)
Tests database query projections and payload optimization:
- ✅ Projects API returns only projected fields
- ✅ WorkLogs API returns only essential list view fields
- ✅ Payload size reduction metrics
- ✅ Exclusion of large/unnecessary fields

**What it validates:**
- Database queries use projections
- API responses are lean
- ~40-60% payload reduction achieved

### 3. Bundle Size Tests (`bundle-size.test.ts`)
Tests code splitting and bundle optimization:
- ✅ Dynamic import for PDF export
- ✅ Separate chunks for exportToPDF
- ✅ Overall bundle size within budget
- ✅ React Compiler optimizations applied
- ✅ Code splitting for different routes

**What it validates:**
- PDF export is dynamically loaded (not in initial bundle)
- Bundle size reduced by ~97% for work log detail page
- Total bundle under 5MB

### 4. Integration Tests (`integration.test.ts`)
End-to-end performance tests:
- ✅ Database connection performance
- ✅ Connection caching/reuse
- ✅ API response times
- ✅ Parallel request handling
- ✅ Performance regression detection

**What it validates:**
- Database connects within 1 second
- Cached connections are nearly instant
- APIs respond within 500ms
- Parallel requests are efficient

## Running Tests

### Run All Performance Tests
```bash
npm run test:performance
```

### Run Tests in Watch Mode
```bash
npm run test:perf:watch
```

### Run Tests with UI
```bash
npm run test:perf:ui
```

### Run Specific Test File
```bash
npm test __tests__/performance/component-rendering.test.tsx
```

## Performance Budgets

The tests enforce these performance budgets:

| Metric | Budget | Status |
|--------|--------|--------|
| DB Connection (first) | <1000ms | ✅ |
| DB Connection (cached) | <50ms | ✅ |
| API Response Time | <500ms | ✅ |
| Projects API Payload Reduction | >40% | ✅ |
| WorkLog Detail Bundle | <50KB | ✅ |
| Total JS Bundle | <5MB | ✅ |

## Test Output

Tests include detailed console output showing:

### Component Tests
```
📊 Component Render Tracking:
- Initial renders: X
- Re-renders after prop change: Y
```

### API Payload Tests
```
📊 Payload Reduction Metrics:
- Full payload: XXXX bytes
- Projected payload: XXXX bytes
- Reduction: XX.XX%
```

### Bundle Size Tests
```
📦 Dynamic Import Verification:
- /worklogs/[id]/page.js size: X.XX KB
- Contains dynamic import: ✓

📦 PDF Export Module:
- exportToPDF.js size: XX.XX KB
- Loaded on-demand: ✓
```

### Integration Tests
```
📊 Performance Metrics Summary:
--------------------------------
- DB Connection: XXms
- API /projects: XXms
- API /worklogs: XXms
```

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Performance Tests
  run: npm run test:performance

- name: Build and Test
  run: npm run test:all
```

## Continuous Monitoring

These tests should be run:
- ✅ Before every commit (pre-commit hook)
- ✅ On every PR (CI/CD)
- ✅ After dependency updates
- ✅ When making performance-related changes

## Troubleshooting

### "Build directory not found" warnings
Run `npm run build` before running bundle size tests.

### MongoDB connection errors
The tests use mongodb-memory-server for in-memory testing. Ensure it's installed:
```bash
npm install --save-dev mongodb-memory-server
```

### Test timeouts
Increase timeout in vitest.config.ts if needed:
```typescript
export default defineConfig({
  test: {
    testTimeout: 30000
  }
})
```

## Performance Regression Detection

If tests fail:
1. Check the console output for specific metrics that exceeded budgets
2. Compare with previous runs
3. Identify the change that caused regression
4. Optimize or adjust budget if justified

## Future Enhancements

Potential additions:
- [ ] Lighthouse CI integration
- [ ] Real browser performance testing with Playwright
- [ ] Memory leak detection
- [ ] Network waterfall analysis
- [ ] Core Web Vitals tracking
