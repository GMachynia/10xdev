# 10x Astro Starter - Aplikacja do Nauki z Fiszkami

A modern flashcard learning application built with Astro, React, and Supabase. Features comprehensive testing, authentication, and a beautiful UI.

## Tech Stack

### Frontend
- [Astro](https://astro.build/) v5.5.5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19.0.0 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible component library

### Backend
- [Supabase](https://supabase.com/) - Open-source Firebase alternative
  - PostgreSQL database
  - Authentication (email/password)
  - Row Level Security (RLS)
  - Real-time subscriptions
  - RESTful API

### Testing

- **Unit Tests** (197+ tests):
  - [Vitest](https://vitest.dev/) - Fast unit test framework (recommended for Astro/Vite projects)
  - [React Testing Library](https://testing-library.com/react) - Testing utilities for React components
  - [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) - User interaction simulation
  - [MSW (Mock Service Worker)](https://mswjs.io/) - API mocking for tests
  - [@vitest/coverage-v8](https://vitest.dev/guide/coverage.html) - Code coverage reporting

- **Integration Tests**:
  - API integration with Supabase
  - Authentication flow testing
  - Row Level Security (RLS) verification
  - Database operations testing

- **End-to-End Tests**:
  - [Playwright](https://playwright.dev/) - Cross-browser E2E testing framework
  - User journey testing (login, flashcard management)
  - Visual regression testing

- **Security Tests**:
  - XSS (Cross-Site Scripting) protection tests
  - CSRF (Cross-Site Request Forgery) protection tests
  - RLS policy verification
  - Authentication & authorization tests
  - Input validation & sanitization tests

- **Performance Tests**:
  - API response time testing (< 500ms target)
  - Load testing with k6 (50+ concurrent users)
  - Database query performance
  - [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated performance testing

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/przeprogramowani/10x-astro-starter.git
cd 10x-astro-starter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

#### Option A: Local Development (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
supabase start

# Run migrations
supabase db reset
```

#### Option B: Cloud Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Add your Supabase credentials to `.env`:

```env
PUBLIC_SUPABASE_URL=your-project-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:4321`.

### 5. Build for production

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
- `npm test` - Run all unit tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:integration` - Run integration tests
- `npm run test:security` - Run security tests
- `npm run test:performance` - Run performance tests
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:debug` - Run E2E tests in debug mode
- `npm run test:e2e:codegen` - Generate E2E tests using Playwright codegen

For more details about testing, see [tests/README.md](./tests/README.md).

## Project Structure

```md
.
├── src/
│   ├── layouts/           # Astro layouts
│   ├── pages/             # Astro pages
│   │   ├── api/           # API endpoints
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   └── flashcards/# Flashcard CRUD endpoints
│   │   ├── auth/          # Auth pages (login, register, reset)
│   │   ├── create.astro   # Create flashcard page
│   │   ├── index.astro    # Homepage
│   │   └── study.astro    # Study/browse flashcards
│   ├── components/        # UI components
│   │   ├── auth/          # Authentication components
│   │   ├── study/         # Flashcard management components
│   │   └── ui/            # Shadcn/ui components
│   ├── lib/               # Utilities & services
│   │   ├── services/      # Business logic (flashcards.service.ts)
│   │   └── utils/         # Utility functions (validation, error handling, API client)
│   ├── db/                # Supabase client & types
│   ├── middleware/        # Astro middleware (authentication)
│   ├── types.ts           # Shared TypeScript types
│   └── styles/            # Global styles
├── tests/
│   ├── e2e/               # End-to-end tests (Playwright)
│   ├── integration/       # Integration tests (API + Supabase)
│   ├── security/          # Security tests (XSS, CSRF, RLS)
│   └── performance/       # Performance & load tests
├── supabase/
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
└── public/                # Public assets
```

## Features

### 🔐 Authentication
- Email/password registration and login
- Password reset functionality
- Session management with Supabase
- Protected routes via Astro middleware

### 📝 Flashcard Management
- Create, read, update, delete (CRUD) flashcards
- Character counter (max 200 chars for source text)
- Optional translation field
- Real-time updates
- Optimistic UI updates with rollback

### 📚 Study Modes
- **Browse Mode**: Navigate through all flashcards
- **Study Mode**: Randomized flashcard order for learning
- Flip cards to see translations
- Progress indicator
- Keyboard navigation (arrow keys)
- Swipe gestures (touch devices)

### 🎨 UI/UX
- Modern, responsive design with Tailwind CSS
- Accessible components from Shadcn/ui
- Loading states and error handling
- Empty states for better UX
- Beautiful card animations

### 🔒 Security
- Row Level Security (RLS) on database level
- JWT token-based authentication
- XSS protection (React auto-escaping)
- CSRF protection (token-based API)
- Input validation and sanitization
- Secure session management

### ⚡ Performance
- Static Site Generation (SSG) with Astro
- Client-side hydration only when needed
- Optimized bundle size
- Database query optimization with indexes
- API response time < 500ms (95th percentile)

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
Login an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful"
}
```

#### POST /api/auth/logout
Logout the current user.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### POST /api/auth/reset-password
Send password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

### Flashcard Endpoints

All flashcard endpoints require authentication via `Authorization: Bearer <token>` header.

#### GET /api/flashcards
Get all flashcards for the authenticated user.

**Query Parameters:**
- `order` (optional): `id` | `random` - Sort order (default: `id`)
- `limit` (optional): number - Max flashcards to return (default: no limit)
- `offset` (optional): number - Pagination offset (default: 0)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "source_text": "Hello",
      "translation": "Cześć",
      "user_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/flashcards
Create a new flashcard.

**Request Body:**
```json
{
  "source_text": "Hello",
  "translation": "Cześć" // optional
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "source_text": "Hello",
    "translation": "Cześć",
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PATCH /api/flashcards/:id
Update an existing flashcard.

**Request Body:**
```json
{
  "source_text": "Hello World", // optional
  "translation": "Witaj Świecie" // optional
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "source_text": "Hello World",
    "translation": "Witaj Świecie",
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/flashcards/:id
Delete a flashcard.

**Response (200):**
```json
{
  "message": "Flashcard deleted successfully"
}
```

### Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error message"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

**404 Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error"
  }
}
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
