# 10x Astro Starter

A modern, opinionated starter template for building fast, accessible, and AI-friendly web applications.

## Tech Stack

- [Astro](https://astro.build/) v5.5.5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19.0.0 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework

### Testing

- **Unit & Integration Tests**:
  - [Vitest](https://vitest.dev/) - Fast unit test framework (recommended for Astro/Vite projects)
  - [React Testing Library](https://testing-library.com/react) - Testing utilities for React components
  - [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) - User interaction simulation
  - [MSW (Mock Service Worker)](https://mswjs.io/) - API mocking for tests
  - [@vitest/coverage-v8](https://vitest.dev/guide/coverage.html) - Code coverage reporting

- **End-to-End Tests**:
  - [Playwright](https://playwright.dev/) - Cross-browser E2E testing framework
  - Alternative: [Cypress](https://www.cypress.io/) (if preferred by the team)

- **Performance Testing**:
  - [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated performance testing
  - [k6](https://k6.io/) - Load testing for API endpoints
  - Chrome DevTools Performance - Performance profiling

- **Security Testing**:
  - [OWASP ZAP](https://www.zaproxy.org/) - Security vulnerability scanning
  - [Snyk](https://snyk.io/) - Dependency vulnerability analysis
  - `npm audit` - NPM package vulnerability checking

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/przeprogramowani/10x-astro-starter.git
cd 10x-astro-starter
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run unit tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:debug` - Run E2E tests in debug mode
- `npm run test:e2e:codegen` - Generate E2E tests using Playwright codegen

For more details about testing, see [tests/README.md](./tests/README.md).

## Project Structure

```md
.
├── src/
│   ├── layouts/    # Astro layouts
│   ├── pages/      # Astro pages
│   │   └── api/    # API endpoints
│   ├── components/ # UI components (Astro & React)
│   └── assets/     # Static assets
├── public/         # Public assets
```

## AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure
- Coding practices
- Frontend development
- Styling with Tailwind
- Accessibility best practices
- Astro and React guidelines

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.

### GitHub Copilot

AI instructions for GitHub Copilot are available in `.github/copilot-instructions.md`

### Windsurf

The `.windsurfrules` file contains AI configuration for Windsurf.

## Contributing

Please follow the AI guidelines and coding practices defined in the AI configuration files when contributing to this project.

## License

MIT
