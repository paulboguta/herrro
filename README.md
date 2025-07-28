# Herrro 💰

An open-source finance, wealth, and cashflow tracking tool built with modern web technologies.

## About

Herrro is a comprehensive financial management platform designed to help you track your finances, manage multiple accounts, monitor cashflow, and build wealth over time. Built with a focus on privacy, performance, and user experience.

## Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React 19](https://react.dev/)** - UI library with latest features

### Backend & Database
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[Drizzle ORM](https://orm.drizzle.team)** - Modern TypeScript ORM
- **[PostgreSQL](https://postgresql.org)** - Robust relational database
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization

### Authentication & Security
- **[Clerk](https://clerk.com)** - Complete authentication solution
- **[Middleware Protection](https://nextjs.org/docs/app/building-your-application/routing/middleware)** - Route-based access control

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[Lucide React](https://lucide.dev/)** - Consistent icon library
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with validation

### Development Tools
- **[Zod](https://zod.dev)** - TypeScript-first schema validation
- **[ESLint](https://eslint.org/)** & **[Biome](https://biomejs.dev/)** - Code quality and formatting
- **[T3 Stack](https://create.t3.gg/)** - Full-stack TypeScript foundation

## Features

- 🏦 **Multi-Account Management** - Track checking, savings, credit, investment accounts
- 📊 **Financial Analytics** - Visualize your financial data with interactive charts
- 💸 **Transaction Tracking** - Monitor income, expenses, and transfers
- 🔐 **Secure Authentication** - Protected routes with Clerk integration
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Clean, intuitive interface built with shadcn/ui

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/herrro.git
   cd herrro
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in your database URL, Clerk keys, etc.
   ```

4. **Set up the database**
   ```bash
   bun run db:push
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Contributing

We welcome contributions from the community! 🤝

**Contributing Guide**: Currently work in progress - check back soon for detailed guidelines.

In the meantime, feel free to:
- 🐛 Report bugs by opening an issue
- 💡 Suggest new features
- 🔧 Submit pull requests for bug fixes
- 📖 Improve documentation
- ⭐ Star the project if you find it useful

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you have questions or need help:
- 📝 Open an issue for bug reports or feature requests
- 💬 Join our community discussions
- 📧 Reach out to the maintainers

---

Built with ❤️ using the [T3 Stack](https://create.t3.gg/)
