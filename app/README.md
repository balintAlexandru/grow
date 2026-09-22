# Grow

Personal development app: a left menu of life areas, each with its own page.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
npm run content:check   # validate AI written content (add -- --fix to normalize)
```

Learning articles are written by the `/learning-daily` Claude Code skill (see `.claude/skills/learning-daily/`).

## Structure

```
src/
  config/sections.ts     menu + routes (add a section here)
  content/learning/      daily articles (JSON), written by /learning-daily
  features/learning/     Learning page: dropdown, cards, reader
  data/mockItems.ts      placeholder content until the data model lands
  layouts/AppLayout      sidebar + content, mobile drawer
  components/            Sidebar, PageHeader, ItemCard (component + its CSS)
  pages/                 HomePage, SectionPage (generic), NotFoundPage
  styles/                tokens.css (theme, light/dark), global.css
scripts/check-content.mjs  validates content, checks YouTube videos
```

Plan: [`../docs/scope/scope.md`](../docs/scope/scope.md) · Stack: [`../docs/specs/0001-stack-and-architecture.md`](../docs/specs/0001-stack-and-architecture.md)
