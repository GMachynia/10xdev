# Testing Guide

This project uses Vitest for unit tests and Playwright for end-to-end tests.

## Unit Tests (Vitest)

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

- Place test files next to the source files with `.test.ts` or `.test.tsx` extension
- Or create `__tests__` directories for grouped tests
- Use `vi.fn()`, `vi.spyOn()`, and `vi.mock()` for mocking
- Use `@testing-library/react` for component testing
- Use `@testing-library/user-event` for user interaction simulation

### Example Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## End-to-End Tests (Playwright)

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Generate tests using codegen
npm run test:e2e:codegen
```

### Writing Tests

- Place E2E tests in `tests/e2e/` directory
- Use Page Object Model for maintainable tests
- Use locators for resilient element selection
- Implement visual comparison with `expect(page).toHaveScreenshot()`

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/App Name/i);
  });
});
```

## Test Configuration

- **Vitest**: `vitest.config.ts`
- **Playwright**: `playwright.config.ts`
- **Vitest Setup**: `vitest.setup.ts`

## Best Practices

1. **Unit Tests**: Test individual functions and components in isolation
2. **E2E Tests**: Test user flows and critical paths
3. **Mocking**: Use MSW for API mocking in tests
4. **Coverage**: Aim for meaningful coverage, not just high percentages
5. **Maintainability**: Keep tests simple and readable

