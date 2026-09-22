# 0001. Build the app as a React single page app with Vite and TypeScript

**Date**: 2026-09-22
**Status**: Accepted

## Summary

The app is a React single page app (one page in the browser that swaps views without reloading), built with Vite (a fast dev server and bundler) and written in TypeScript (JavaScript with types). It lives in `app/`, so it stays separate from the workflow skills at the repo root. Navigation between sections uses a client side router, and every section is registered in one config file, so adding a section is one entry.

## Context

You want a personal development space: a simple page with a menu on the left and sections (Evenimente, Learning, Fashion, Psychology, Culture), with more added over time. It is a personal project, used by you, run locally for now. The first goal is to see the layout and navigation working; real content and saving data come later.

The repo root already holds the workflow skills and their own `package.json`, so the app needs its own folder.

## Requirements

**User stories**:
- As the owner, I want to open the app locally and move between sections from a left menu, so I can see how the site feels before adding real content.
- As the owner, I want to add new sections later without touching the layout code.

**Acceptance criteria**:
- **AC-1**: `npm run dev` in `app/` (or from the repo root) starts the app, and it renders in the browser.
- **AC-2**: The left menu lists Acasă plus the five sections; each opens its own URL, and the active item is highlighted.
- **AC-3**: A new section appears in the menu and gets a route by adding one entry to `app/src/config/sections.ts`.
- **AC-4**: On narrow screens the menu collapses into a drawer opened from a top bar button.
- **AC-5**: `npm run build` and `npm run lint` pass.

## Options considered

### Option 1: React + Vite + TypeScript (client only)

**Pros**: fastest local dev loop, simple mental model, no server needed, easy to host as static files later.
**Cons**: no server rendering (not needed: private, personal app, no SEO).

### Option 2: Next.js

**Pros**: routing and server features built in.
**Cons**: more concepts and moving parts than a personal, client only app needs today.

## Decision

**Chosen option**: Option 1: React + Vite + TypeScript, with React Router for navigation, `lucide-react` for icons, and plain CSS with design tokens (CSS custom properties).

## Rationale

You asked for React and for something simple to navigate and to run locally. A client only Vite app gives exactly that with the least setup. Plain CSS with tokens keeps the look easy to change until the design system is decided (feature 3 in the scope), without locking in a UI library. Persistence and data are deliberately not decided here; that is the data model feature.

## Architecture

- `app/src/config/sections.ts`: the menu and routes, the single place to add a section.
- `app/src/layouts/AppLayout.tsx`: sidebar plus content area; mobile drawer.
- `app/src/components/`: shared UI (`Sidebar`, `PageHeader`, `ItemCard`), one folder per component with its CSS.
- `app/src/pages/`: `HomePage`, a generic `SectionPage`, `NotFoundPage`. A section that outgrows the generic page gets its own page component.
- `app/src/data/mockItems.ts`: placeholder content (Facade phase), replaced when the data model lands.
- `app/src/styles/`: `tokens.css` (colors, spacing, radius, light and dark) and `global.css`.
