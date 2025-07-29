# HERRRO - Personal Finance Tracking App

A modern personal finance application built with Next.js 15, tRPC, and Drizzle ORM, designed for budgeting, wealth tracking, and net worth management.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Backend**: tRPC with Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **UI**: shadcn/ui components with Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Package Manager**: **BUN ONLY** (not npm or pnpm)

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   └── (authenticated)/   # Protected routes
├── components/             # React components
│   ├── accounts/          # Account management components
│   ├── transactions/      # Transaction components
│   └── ui/               # shadcn/ui components
├── server/                # Backend code
│   ├── api/              # tRPC routers and schemas
│   └── db/               # Database schema and config
├── lib/                   # Utility functions and cache management
└── trpc/                  # tRPC client configuration
```

## 💰 Financial Data Model

### Account System
- **Hierarchical Structure**: Assets vs Liabilities (inspired by Maybe Finance)
- **Asset Types**: Cash, Investment, Crypto, Property, Vehicle, Other Asset
- **Liability Types**: Credit Card, Loan, Other Liability
- **Balance Tracking**: Hybrid approach with cached current balance + transaction history

### Database Schema
```sql
-- Accounts with starting balance and optimistic locking
accounts {
  id: uuid PRIMARY KEY
  user_id: text NOT NULL
  name: text NOT NULL
  type: account_type NOT NULL
  category: account_category NOT NULL (asset/liability)
  currency: text DEFAULT 'USD'
  balance: numeric(19,4) DEFAULT '0'        # Current cached balance
  starting_balance: numeric(19,4) DEFAULT '0'  # Initial balance
  balance_version: bigint DEFAULT 0         # For optimistic locking
  created_at: timestamptz
  updated_at: timestamptz
}

-- Transactions with running balance for historical tracking
transactions {
  id: uuid PRIMARY KEY
  user_id: text NOT NULL
  account_id: uuid REFERENCES accounts(id)
  amount: numeric(19,4) NOT NULL
  type: transaction_type NOT NULL (income/expense)
  description: text
  date: timestamptz NOT NULL
  running_balance: numeric(19,4) NOT NULL   # Balance after this transaction
  created_at: timestamptz
}
```

## 🚀 Performance Optimizations

### Caching Strategy
- **React Query** with 5-minute staleTime for accounts (infrequent changes)
- **Edge caching headers** on tRPC endpoints
- **Optimistic updates** for instant UI feedback
- **Smart cache invalidation** using custom utilities
- **Prefetching** for proactive data loading

### Key Performance Features
- Server-side prefetching with HydrateClient
- Infinite scroll for transaction lists
- Background refetching strategies
- Reduced Vercel function invocations through aggressive caching

## 🔧 Development Rules & Guidelines

### Package Management
- **USE BUN ONLY** - Never use npm or pnpm
- Install dependencies: `bun install`
- Run scripts: `bun run <script>`
- Add packages: `bun add <package>`

### Database Management
- **ONLY USE**: `bun run db:push` (pushes schema changes directly to database)
- **NEVER USE in MVP dev**: `bun run db:generate` or `bun run db:migrate` (creates migration files)
- View database: `bun run db:studio`
- **MVP Philosophy**: Direct schema push for rapid iteration, not migration-based development

### Code Standards
- **TypeScript strict mode** - all files must be properly typed
- **Drizzle ORM** for all database operations
- **tRPC** for type-safe API calls
- **React Hook Form** with Zod validation for forms
- **Optimistic locking** for financial operations
- **Database transactions** for atomic operations

### Financial Data Rules
- Use `numeric(19,4)` for all monetary values
- Never perform balance calculations client-side for persistence
- Always use database transactions for multi-step financial operations
- Implement optimistic locking for concurrent balance updates
- Store starting balance as metadata, not as a transaction

## 🎯 Current Features

### Account Management
- ✅ Create accounts with asset/liability categorization
- ✅ Account cards with balance display and category badges
- ✅ Support for multiple currencies
- ✅ Account archiving capabilities

### Transaction System
- ✅ Add income/expense transactions
- ✅ Transaction list with account details
- ✅ Form validation with Zod schemas
- ✅ Optimistic updates with rollback on error
- ✅ Date-based transaction recording

### Performance & UX
- ✅ Loading skeletons and proper loading states
- ✅ Toast notifications for user feedback
- ✅ Responsive design with mobile support
- ✅ Background data refetching

## 🚧 In Progress / Planned

### Balance Architecture Improvements
- 🔄 Add `starting_balance` column to accounts
- 🔄 Implement `balance_version` for optimistic locking
- 🔄 Add `running_balance` to transactions for historical tracking
- 🔄 Update tRPC schemas for new balance fields
- 🔄 Frontend updates for starting balance input

### Future Features
- 📊 Account balance charts and analytics
- 💹 Net worth tracking and visualization
- 📈 Budget management and tracking
- 🏦 Account import functionality
- 📱 Mobile-first responsive improvements

## 🔍 Testing & Quality

### Commands
- Run tests: `bun test`
- Type checking: `bun run typecheck`
- Linting: `bun run lint`
- Build: `bun run build`

### Quality Assurance
- All financial operations must be tested for concurrency
- Balance calculations must be verified against transaction sums
- Error handling must include proper rollback mechanisms
- UI components should have loading and error states

## 📝 Notes for Claude

### Development Context
- This is a personal finance app requiring financial-grade data integrity
- Users need to track assets, liabilities, and net worth over time
- Performance is critical - users expect instant feedback
- The app follows modern Next.js patterns with tRPC for type safety

### Common Tasks
- Always use `bun` commands instead of npm/yarn
- Database changes require both schema updates and migrations
- Financial operations need optimistic locking and proper error handling  
- UI changes should maintain consistency with shadcn/ui patterns
- Performance optimizations should focus on reducing API calls and improving caching

### Next.js 15 Critical Rules
- **ALWAYS `await params` and `searchParams`** in server components (pages)
- Interface: `params: Promise<{ id: string }>` not `params: { id: string }`
- Usage: `const { id } = await params;` not `params.id`
- This applies to ALL dynamic routes and pages with search parameters

### Architecture Decisions
- Hybrid balance approach: cached current balance + transaction history
- Starting balance as metadata, not transactions
- tRPC for type-safe APIs with React Query for caching
- Optimistic updates for better UX with proper rollback
- PostgreSQL with Drizzle ORM for type-safe database operations