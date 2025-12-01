# Automated Performance Testing Guide

## Overview

This project includes comprehensive automated performance tests to ensure optimization goals are maintained over time.

## Test Results Summary

✅ **18 of 22 tests passing**

### Passing Test Categories:

1. **✅ React Component Optimizations**
   - WorkLogForm React.memo verification
   - PendingSubmissions React.memo verification
   - useMemo project options optimization
   - Component renders efficiently

2. **✅ API Payload Optimizations**
   - Projects API projection working correctly
   - WorkLogs API projection working correctly
   - Payload reduction achieved (~40-60%)
   - Large fields excluded from responses

3. **✅ Integration Performance**
   - Database connection performance (<1000ms)
   - Connection caching working
   - API response times within budget
   - Parallel requests efficient

### Tests Requiring Build

Some tests need `npm run build` to be run first:
- Bundle size verification
- Code splitting verification
- Dynamic import verification

Run these after building:
```bash
npm run build
npm run test:performance
```

## Quick Start

### 1. Run All Tests
```bash
npm test
```

### 2. Run Performance Tests Only
```bash
npm run test:performance
```

### 3. Watch Mode (for development)
```bash
npm run test:perf:watch
```

### 4. With UI (visual test runner)
```bash
npm run test:perf:ui
```

## Test Structure

```
__tests__/performance/
├── README.md                      # Detailed test documentation
├── component-rendering.test.tsx   # React optimization tests
├── api-payload.test.ts           # API projection tests
├── bundle-size.test.ts           # Bundle optimization tests
└── integration.test.ts           # End-to-end performance tests
```

## What Each Test Validates

### Component Rendering Tests
- React.memo prevents unnecessary re-renders
- useMemo/useCallback work correctly
- Components are properly optimized

### API Payload Tests
- Database queries use projections
- Only necessary fields returned
- Significant payload size reduction
- Performance metrics logged

### Bundle Size Tests
- PDF export is dynamically imported
- Bundle sizes within budget
- Code splitting effective
- React Compiler optimizations applied

### Integration Tests
- Database performance acceptable
- Connection caching works
- APIs respond quickly
- No performance regressions

## Performance Budgets

| Metric | Budget | Current |
|--------|--------|---------|
| DB Connection (first) | <1000ms | ✅ Pass |
| DB Connection (cached) | <50ms | ✅ Pass |
| API Response Time | <500ms | ✅ Pass |
| Payload Reduction | >40% | ✅ Pass |
| WorkLog Detail Bundle | <50KB | ⚠️ Check after build |
| Total JS Bundle | <5MB | ⚠️ Check after build |

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Performance Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:performance
      - run: npm run build
      - run: npm run test:performance  # Re-run after build
```

## Continuous Monitoring

Run these tests:
- ✅ Before every commit
- ✅ On every pull request
- ✅ After dependency updates
- ✅ When making performance changes

## Example Test Output

### Component Tests
```
✓ Should be wrapped with React.memo
✓ Should not re-render with same props
✓ Should use useMemo for project options
```

### API Payload Tests
```
✓ Should only return projected fields
✓ Should NOT have client, budget, manager fields

📊 Payload Reduction Metrics:
- Full payload: 45231 bytes
- Projected payload: 18923 bytes
- Reduction: 58.16%
```

### Integration Tests
```
📊 Performance Metrics Summary:
- DB Connection: 234ms
- API /projects: 145ms
- API /worklogs: 178ms

Performance Budget: All ✓
```

## Troubleshooting

### "Build directory not found"
```bash
npm run build
npm run test:performance
```

### MongoDB Memory Server Issues
```bash
npm install --save-dev mongodb-memory-server
```

### Test Timeouts
Edit `vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    testTimeout: 30000
  }
})
```

## Adding New Performance Tests

### 1. Create Test File
```typescript
// __tests__/performance/my-test.test.ts
import { describe, it, expect } from 'vitest';

describe('Performance: My Feature', () => {
  it('should be fast', async () => {
    const start = Date.now();
    // ... test code ...
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });
});
```

### 2. Add to Test Suite
The test will automatically be picked up by:
```bash
npm run test:performance
```

### 3. Document Budget
Add your performance budget to this guide.

## Best Practices

1. **Measure First**: Always measure before optimizing
2. **Set Budgets**: Define acceptable performance ranges
3. **Monitor Continuously**: Run tests regularly
4. **Fix Regressions**: Address failures immediately
5. **Update Budgets**: Adjust when justified by data

## Performance Optimization Checklist

When making changes, verify:
- [ ] Component tests pass (React.memo, useMemo work)
- [ ] API payload tests pass (projections applied)
- [ ] Bundle size within budget
- [ ] Integration tests pass
- [ ] No new performance regressions
- [ ] Documentation updated if budgets change

## Resources

- [PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md) - Detailed optimization docs
- [__tests__/performance/README.md](./__tests__/performance/README.md) - Test details
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

## Support

If tests fail unexpectedly:
1. Check console output for specific errors
2. Compare metrics with previous runs
3. Review recent code changes
4. Update budgets if optimization justified
5. Ask for help if needed

---

**Last Updated:** December 1, 2025
**Test Framework:** Vitest 3.0.9
**Coverage:** Component Rendering, API Payloads, Bundle Size, Integration
