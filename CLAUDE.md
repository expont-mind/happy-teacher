# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Happy Teacher is an interactive mathematics learning platform for children, presented in Mongolian. The project is a monorepo containing two Next.js applications:

- **frontend**: Student-facing application with interactive coloring-based math lessons
- **admin**: Administrative dashboard for managing users and payments

## Development Commands

### Frontend Application

```bash
cd frontend
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### Admin Application

```bash
cd admin
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Architecture

### Technology Stack

Both applications share similar tech stacks with minor differences:

- **Framework**: Next.js 16 (App Router with React Server Components)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**:
  - Frontend: Custom components with lucide-react icons
  - Admin: Radix UI primitives, react-hook-form, date-fns

### Path Aliases

**Important**: The two apps use different path alias configurations:

- **Frontend**: `@/*` resolves to `./*` (project root)
  - Example: `@/src/components/auth` → `src/components/auth`
- **Admin**: `@/*` resolves to `./src/*`
  - Example: `@/components/ui` → `src/components/ui`

### Frontend Structure

The frontend follows a feature-based organization:

- `src/app/`: Next.js App Router pages and layouts
  - Routes: `/`, `/topic`, `/topic/fractions`, `/topic/multiplication`
- `src/features/`: Page-level components (HomePage, LessonPage)
- `src/components/`: Reusable UI components organized by domain
  - `auth/`: Authentication components and AuthProvider
  - `coloring/`: Canvas-based coloring components for lessons
  - `topic/`: Topic-specific components (roadmap, paywall)
  - `navigations/`: Header and Footer
  - `ui/`: Generic UI components
- `src/data/`: Static lesson data (fractions, etc.)
- `src/utils/`: Utility functions, including Supabase clients

### Admin Structure

The admin follows a similar pattern:

- `src/app/`: App Router pages for user and payment management
- `src/features/`: Feature components (HomePage, UserDetailPage)
- `src/components/`: Organized UI components
  - `ui/`: Radix UI component wrappers (button, dialog, select, etc.)
  - `home/`: Home page specific components
  - `svg/`: Custom SVG components
  - `constants/`: Shared constants (Sidebar, Footer, SearchBar)
- `src/lib/`: Utility functions (utils.ts for cn helper)
- `src/utils/`: Supabase client setup

### Supabase Integration

#### Database Tables

Core tables:
- **profiles**: User profile information (extended from auth.users)
- **purchases**: Topic purchase tracking
- **user_progress**: Completed lessons tracking

Additional tables:
- **pending_invoices**: QPay invoices awaiting payment
- **coupons**: Discount coupon codes
- **child_progress**: Child-specific progress tracking
- **notifications**: User notifications
- **gamification**: Gamification features (streaks, achievements)

#### Client vs Server

- **Server Components**: Use `createClient()` from `utils/supabase/server.ts`
  - Handles cookie-based auth for server-side rendering
- **Client Components**: Use `createClient()` from `utils/supabase/client.ts`
  - Browser-based client for client-side operations

#### AuthProvider (Frontend)

The `AuthProvider` context provides:
- `user`: Current authenticated user
- `signIn(email, password)`: Login
- `signUp(email, password, username)`: Registration
- `signOut()`: Logout
- `checkPurchase(topicKey)`: Check if user purchased a topic
- `purchaseTopic(topicKey)`: Record a purchase
- `markLessonCompleted(topicKey, lessonId)`: Mark lesson complete
- `getCompletedLessons(topicKey)`: Retrieve completed lessons

All progress tracking methods gracefully fall back to localStorage when Supabase tables don't exist or on error.

### Lesson System

Lessons are defined in `src/data/lessons/` as TypeScript objects containing:
- `id`: Unique lesson identifier
- `title`: Lesson title (in Mongolian)
- `mainImage`: SVG image to color
- `maskImage`: PNG mask defining colorable regions
- `backgroundImage`: Background reference image
- `helpImage`: Help/guide image
- `palette`: Array of hex color codes for the lesson

The coloring canvas (`ColoringCanvas.tsx`) uses these images to create an interactive SVG coloring experience with flood-fill functionality.

### Payment Integration

The frontend integrates with QPay via the Bonum payment gateway:

- `src/components/qpay/QPayDialog.tsx`: QR code payment modal with polling
- `src/app/api/bonum/`: API routes for payment processing

**Payment Flow:**
1. Create invoice via `/api/bonum/qpay`
2. Display QR code to user
3. Poll `/api/bonum/get-invoice-status-qpay` every 3 seconds
4. Save purchase via `/api/bonum/save-purchase` on success

### API Routes (Frontend)

- `/api/bonum/qpay`: Create QPay invoice
- `/api/bonum/get-invoice-status-qpay`: Check payment status
- `/api/bonum/save-purchase`: Record successful purchase
- `/api/cron/reminders`: Scheduled reminder notifications
- `/api/cron/weekly-report`: Weekly user reports
- `/api/send-notification`: Send push notifications

### Environment Variables

Both apps require:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Frontend additionally requires (for payments):
```bash
BONUM_BASE_URL=<bonum-api-url>
BONUM_TOKEN_BASE_URL=<bonum-token-url>
BONUM_APP_SECRET=<bonum-app-secret>
BONUM_DEFAULT_TERMINAL_ID=<terminal-id>
```

Admin additionally requires:
```bash
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Create `.env` files in both `frontend/` and `admin/` directories.

## Important Patterns

### Error Handling with Supabase

The codebase implements defensive error handling for Supabase operations:

- Checks for specific error codes (e.g., `42P01` for missing tables, `PGRST116` for not found)
- Falls back to localStorage when tables don't exist
- Shows user-friendly toast messages with actionable guidance
- Logs helpful console warnings for developers

### Toast Notifications

Uses `sonner` for toast notifications throughout both apps. The frontend implements a toast queue system in some components to prevent excessive toast spam.

### TypeScript Configuration

Both apps use strict TypeScript:
- Target: ES2017
- JSX: react-jsx (React 19 compatible)
- Module resolution: bundler
- Strict mode enabled

## Database Setup

The application expects Supabase tables to be set up. If you encounter errors about missing tables, check for a `SUPABASE_SETUP.sql` file in the project root and run it in the Supabase SQL Editor.

## UI Development

### Frontend Styling

- Uses Tailwind CSS 4 with custom CSS variables
- Custom fonts: Geist Sans and Geist Mono
- Component-scoped styles in globals.css

### Admin Styling

- Uses Radix UI for accessible component primitives
- Tailwind CSS 4 with shadcn/ui-style components
- `cn()` utility from `lib/utils.ts` for conditional classes
