# Frontend Documentation

The frontend is a React Single Page Application (SPA), built rapidly using Vite and styled with Tailwind CSS.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: `react-router-dom` v6 for client-side routing.
- **State & Data Fetching**: `@tanstack/react-query` for robust server state management, caching, and API interactions.
- **Styling**: Tailwind CSS combined with `clsx` and `tailwind-merge`.
- **UI Components**: Shadcn UI (Radix UI primitives customized with Tailwind CSS).
- **Forms**: `react-hook-form` paired with `zod` for rigorous client-side schema validation.

## Project Layout

- `src/components/`: Reusable UI components. Includes generic `ui/` components (Shadcn) and feature-specific components (`dashboard/`, etc.).
- `src/contexts/`: React Contexts, primarily containing `AuthContext` to manage global authentication state.
- `src/hooks/`: Custom React hooks.
- `src/pages/`: Container components representing distinct application routes.
- `src/lib/`: Utility functions and library wrappers.
- `src/types/`: TypeScript type definitions and interfaces for API responses and component props.

## Core Pages/Routes

- **`/` (Landing)**: Public face of the application.
- **`/login`, `/signup`**: Public authentication pages.
- **`/dashboard`**: Protected user dashboard featuring high-level metrics.
- **`/dashboard/forms`**: Protected list of all user-created forms.
- **`/dashboard/forms/create`**: Interface to scaffold a new form.
- **`/dashboard/forms/:id/edit`**: Robust form builder interface allowing users to dynamically add, edit, and reorganize questions and options.
- **`/forms/:id`**: The public-facing area where form respondents actually fill out the created forms.
- **`/forms/:id/results`**: Protected view to analyze the collected responses and scores for a specific form.
