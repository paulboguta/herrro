# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- Development: `pnpm dev` (runs Next.js with Turbo)
- Build: `pnpm build`
- Lint: `pnpm lint` (or `pnpm lint:fix` to auto-fix)
- Type check: `pnpm typecheck` 
- Format: `pnpm format:write` (or `pnpm format:check` to check only)
- Full check: `pnpm check` (runs both lint and typecheck)

### Database Commands
- Generate migrations: `pnpm db:generate`
- Apply migrations: `pnpm db:migrate` 
- Push schema directly: `pnpm db:push`
- Open Drizzle Studio: `pnpm db:studio`
- Seed database: `pnpm db:seed`

## Architecture Overview

This is a T3 Stack application (Next.js, tRPC, Drizzle, Clerk, Tailwind) for finance, wealth, investments and cashflow management.

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Clerk for user authentication
- **Security**: Arcjet for rate limiting/protection
- **UI**: Custom components built on Radix UI primitives (shadcn)
- **Package Manager**: pnpm

### Key Architecture Patterns

**App Router Structure**: Uses Next.js App Router with route groups:
- `(authenticated)` - Protected routes requiring login
- `(unauthenticated)` - Public auth pages (sign-in, sign-up)

**tRPC API**: Server-side APIs are organized in `/src/server/api/routers/`:
- `transaction.ts` - Transaction CRUD operations
- `account.ts` - Account management
- Main router combines these in `/src/server/api/root.ts`

**Database Schema**: Two main tables in `/src/server/db/schema.ts`:
- `account_table` - User accounts with owner-based access control
- `transaction_table` - Financial transactions linked to accounts

**Authentication Flow**: Uses Clerk with `ownerId` field (Clerk user ID) for row-level security across all data models.

**Component Structure**: 
- Page-specific components in `_components` folders next to pages
- Shared UI components in `/src/components/ui/` (shadcn/ui pattern)
- App-level components (sidebar, nav) in `/src/components/`

**Environment Management**: Uses `@t3-oss/env-nextjs` for type-safe environment variables in `/src/env.js`

**Key Business Logic**: This is a personal finance app where users can:
- Create and manage accounts
- Track financial transactions with categories
- View transaction history in tables
- Edit/create transactions via modal forms