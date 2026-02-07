---
alwaysApply: true
---

# Use a Modular File Structure:

Use the /app directory for routing (App Router) with Next.js 16 or version provided.
Keep business logic separate from UI components.
Organize your project with clear directories: /components, /hooks, /services, /lib, /styles.

# App Router Best Practices:

Use file-based routing for cleaner code organization.
Utilize Next.js server components for improved performance where possible.
Keep client components focused on state management and UI interactions.

# Data Access Layer (DAL) and Services:

Avoid mixing data fetching logic directly in components.

# Directory Structure for DAL:

Use a consistent folder structure for data access and actions within each page module, for example:

- app/
  - dashboard/
    - /data-access # Data Access Layer (DAL) for cadastro page
    - /actions # Server actions for cadastro page

# Component Placement Guidelines

## 1. Page-Level Components

- **Always check** if there is a `_components` directory at the page or route level where you are working.
  - Example:
    ```
    /app
      /dashboard
        /_components
        page.tsx
    ```
  - What to do:
    If the component is only used within this specific page or route (e.g., only in `/dashboard`), place it inside the `/dashboard/_components` folder.

## 2. Global or Shared Components

- If the component will be reused in multiple pages or modules, place it in the global `/src/components` directory.
  - Only add components to `/src/components` when you're sure they will be reused broadly.
  - If in doubt, always ask first before placing it globally.

## 3. Server vs. Client Component

- Default to Server Components (no `"use client"` directive) whenever possible.
  - Use Client Components (`"use client"`) **only when strictly necessary** (state, effects, event handlers, etc.).
  - If you're not sure, start as a Server Component and refactor to Client only if required.

## 4. Other Best Practices

- Prefer colocating components near where they're used (feature or route-level scope) unless you have a clear case for global reuse.
- Keep component directories organized and use descriptive names.
- Review import paths after moving or adding components to avoid breaking references.
- **Always** name the folder as `_components` (with a leading underscore) to distinguish it from pages/routes.

# Reusable and Isolated Components:

Keep components small and focused on a single responsibility.
Use props effectively and avoid excessive prop drilling by leveraging context or hooks where needed.

# Separation of Concerns:

Avoid placing API calls or business logic inside components.
Use hooks for state management and side effects (e.g., useSWR, React Query, custom hooks).

# UI and State Separation:

Keep UI components presentational (no logic other than rendering).
Use containers for data management and complex state logic.
Code Quality

# UI and Styling

Component Libraries

- Use Shadcn UI for consistent, accessible component design.
- Integrate Radix UI primitives for customizable, accessible UI elements.
- Apply composition patterns to create modular, reusable components.

# TypeScript First:

Use TypeScript to ensure type safety across the application.
Define strict types for props, state, and API responses.

# Clean Code Principles:

Follow SOLID principles where applicable.
Use meaningful variable names and avoid magic numbers.
Prefer functional components and hooks over class components.

# Avoid Anti-Patterns:

No large, monolithic components.
Avoid inline styles in favor of TailwindCSS or modular CSS.
Performance Optimization

# Code Splitting and Lazy Loading:

Use dynamic imports for large components to improve load times.
Optimize for faster Time to Interactive (TTI).

# Server Components

- Default to Server Components
- Use URL query parameters for data fetching and server state management
- Use 'use client' directive only when necessary:
- Event listeners
- Browser APIs
- State management
- Client-side-only libraries

# Specific Naming Patterns

- Prefix event handlers with 'handle': handleClick, handleSubmit
- Prefix boolean variables with verbs: isLoading, hasError, canSubmit
- Prefix custom hooks with 'use': useAuth, useForm
- Use complete words over abbreviations except for:
- err (error)
- req (request)
- res (response)
- props (properties)
- ref (reference)

# Testing Strategy:

Use Jest and React Testing Library for unit and integration tests.
Aim for high test coverage on critical components and services.

# Documentation:

Use JSDoc or TypeScript comments to describe component props and functions.
Keep README files updated for each module or library used.
Security and Best Practices

# Environment Variables:

Use .env files for secrets and configuration.
Never expose sensitive keys in the frontend.

# Input Validation and Sanitization:

Use Zod for schema validation to prevent bad data.
Sanitize all inputs to prevent XSS and SQL injection.

# Authentication and Authorization:

Use Better-Auth for manage autentication.
Implement CSRF protection and secure cookies.
Deployment and Scalability

# Optimized Build Process:

Use the latest Next.js features for optimized builds.
Leverage Vercel or a VPS with good caching strategies.

# Logging and Error Handling:

Use tools like Sentry for error tracking and performance monitoring.
Implement graceful error handling with fallback components.

# Scaling Strategies:

Plan for horizontal scaling with serverless or containerized deployments.
Optimize database queries with Prisma or Drizzle for efficient data access.
Continuous Improvement

# Code Reviews and PR Guidelines:

Set clear code review guidelines to catch issues early.
Use pull request templates to ensure consistency.

# Performance Audits:

Regularly run Lighthouse and Web Vitals checks.
Use performance monitoring tools to track improvements.

# Stay Up-to-Date:

Keep dependencies updated and stay aware of breaking changes in major libraries like Next.js, React, and Prisma. If a specific version is provided for a library, always use the given version to ensure compatibility and avoid unexpected behavior.
