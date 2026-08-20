# JobTrack

A modern, responsive web application that helps job seekers manage their job applications and workplace productivity. JobTrack combines a clean SaaS dashboard with AI-powered tools to streamline the job search process.

![JobTrack](https://jobtrack-ai-buddy.lovable.app)

## Features

- **Job Application Tracker** — Add, edit, delete, search, and filter job applications by status (Applied, Interview, Offer, Rejected, Withdrawn).
- **Smart Email Generator** — Generate professional emails in Formal, Friendly, or Persuasive tones, then edit the draft inline.
- **AI Task Planner** — Turn job-search goals into prioritized daily or weekly task lists (P1–P3) with editable checkboxes.
- **AI Assistant** — Ask a job-search and productivity-focused chatbot for advice on resumes, interviews, and applications.
- **Dark Mode First** — Built with a polished dark UI and full light/dark theme toggle.
- **Responsive Dashboard** — Sidebar navigation with a mobile-friendly layout.

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — Full-stack React framework
- [React 19](https://react.dev) — UI library
- [TypeScript](https://www.typescriptlang.org) — Type safety
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [shadcn/ui](https://ui.shadcn.com) — UI components
- [Lovable AI Gateway](https://docs.lovable.dev/features/ai-gateway) — AI completions

## Getting Started

### Prerequisites

- Node.js 20+
- npm or bun

### Install dependencies

```sh
npm install
```

### Run the development server

```sh
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build for production

```sh
npm run build
```

### Lint and format

```sh
npm run lint
npm run format
```

## Project Structure

```
src/
  components/        # Shared UI components (AppShell, ThemeToggle, AiDisclaimer, etc.)
  lib/               # Business logic, storage hooks, and AI server functions
  routes/            # TanStack file-based routes
  styles.css         # Global design tokens and Tailwind theme
```

## AI Features

JobTrack uses the Lovable AI Gateway with `google/gemini-3.7-flash` for:

- Email drafting
- Task planning
- Chat assistance

AI-generated content is always editable before you use it.

## Data Storage

Application and task data is stored in the browser's `localStorage`. No backend database or authentication is required for the core experience.

## Responsible AI

JobTrack includes an AI disclaimer reminding users to review and verify all AI-generated content before sending or acting on it.

## License

This project is built and owned by you through [Lovable](https://lovable.dev). Feel free to modify and deploy it as you wish.
