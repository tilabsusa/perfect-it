# Test Coverage Requirements and Reporting

## Coverage Requirements

The project enforces the following minimum coverage thresholds:

### Global Coverage

- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Component-Specific Requirements

#### Components (`./components/**/*.{ts,tsx}`)

- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

#### Utilities (`./lib/utils/**/*.ts`)

- **Branches**: 90%
- **Functions**: 95%
- **Lines**: 95%
- **Statements**: 95%

#### Hooks (`./hooks/**/*.ts`)

- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%
- **Statements**: 90%

#### Lambda Functions (`./amplify/functions/**/*.{js,ts}`)

- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 85%
- **Statements**: 85%

## Running Coverage Reports

### Generate Coverage Report

```bash
npm run test:coverage
```

### View Coverage in Terminal

```bash
npm run test:unit
```

This will display a coverage summary in the terminal after running tests.

### Watch Mode with Coverage

```bash
npm run test:watch -- --coverage
```

### CI Coverage Report

```bash
npm run test:ci
```

This runs tests with coverage in CI mode, optimized for continuous integration environments.

## Viewing Coverage Reports

### HTML Report

After running coverage, open the detailed HTML report:

```bash
# On macOS
open coverage/index.html

# On Windows
start coverage/index.html

# On Linux
xdg-open coverage/index.html
```

The HTML report provides:

- File-by-file coverage breakdown
- Line-by-line coverage visualization
- Uncovered lines highlighted in red
- Partially covered branches in yellow
- Fully covered code in green

### Coverage Report Formats

The project generates coverage reports in multiple formats:

1. **text**: Console output for quick overview
2. **text-summary**: Condensed console summary
3. **lcov**: For CI/CD integration and coverage badges
4. **html**: Interactive browser-based report

## Coverage Files Location

- **HTML Report**: `coverage/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Report**: `coverage/coverage-final.json`

## Improving Coverage

### Finding Uncovered Code

1. Run `npm run test:coverage`
2. Open `coverage/index.html`
3. Click on files with low coverage
4. Look for red (uncovered) and yellow (partially covered) lines

### Writing Tests for Uncovered Code

#### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('expected');
  });
});
```

#### Utility Testing

```typescript
import { myUtilityFunction } from './myUtility';

describe('myUtilityFunction', () => {
  it('handles edge cases', () => {
    expect(myUtilityFunction(null)).toBe('default');
    expect(myUtilityFunction('input')).toBe('output');
  });
});
```

## Excluding Files from Coverage

Files can be excluded from coverage using:

### In jest.config.js

Already configured to exclude:

- `*.d.ts` (TypeScript declarations)
- `node_modules/`
- `.next/` (build output)
- `coverage/` (coverage reports)
- `*.config.js` (configuration files)
- `generated/` (auto-generated code)

### Using Istanbul Comments

```typescript
/* istanbul ignore next */
function difficultToTest() {
  // Code that's hard to test
}

/* istanbul ignore if */
if (process.env.NODE_ENV === 'production') {
  // Production-only code
}
```

## CI/CD Integration

### GitHub Actions

Coverage reports are automatically generated in CI using:

```yaml
- name: Run tests with coverage
  run: npm run test:ci
```

### Coverage Badges

To add coverage badges to README:

1. Use the generated `lcov.info` file
2. Integrate with services like Codecov or Coveralls
3. Add badge markdown to README.md

Example:

```markdown
![Coverage](https://img.shields.io/codecov/c/github/username/repo)
```

## Troubleshooting

### Coverage Not Updating

1. Clear Jest cache: `jest --clearCache`
2. Delete coverage folder: `rm -rf coverage`
3. Run tests again: `npm run test:coverage`

### Missing Coverage for Files

Ensure files are included in `collectCoverageFrom` in `jest.config.js`

### Coverage Thresholds Failing

1. Check current coverage: `npm run test:coverage`
2. Identify files below threshold in the report
3. Add tests for uncovered code
4. Re-run coverage check

## Best Practices

1. **Aim for meaningful coverage**: Focus on testing business logic and edge cases
2. **Don't chase 100%**: Some code (like configuration) doesn't need testing
3. **Test behavior, not implementation**: Write tests that survive refactoring
4. **Review coverage regularly**: Make it part of PR reviews
5. **Set realistic thresholds**: Start where you are and gradually improve

## Resources

- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#collectcoverage-boolean)
- [Istanbul Documentation](https://istanbul.js.org/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
