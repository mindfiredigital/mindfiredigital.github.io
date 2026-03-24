# Functional Requirements Specification (FRS)

**Project:** Mindfire FOSS Website  
**Organization:** Mindfire Digital  
**Repository:** `mindfiredigital/mindfiredigital.github.io`  

---

## 1. Purpose

This document describes the features and functional behavior of the Mindfire FOSS Website — a public-facing platform that showcases Mindfire Digital's open source projects, contributors, package download statistics, and a contributor leaderboard.

---

## 2. Scope

The website covers the following functional areas:

- Home / landing page
- About page
- Projects page (current and upcoming)
- Contributors page with leaderboard
- Packages / download stats page
- Legal pages (Privacy Policy, Terms of Use, Cookie Policy)
- A periodic table view of all packages
- A monthly leaderboard archive system

---

## 3. Pages and Features

### 3.1 Home Page

The landing page introduces the Mindfire FOSS initiative. It includes:

- A hero section with headline, subheading, and call-to-action buttons linking to the Projects Page.
- Navigation to all major sections of the site

---

### 3.2 About Page

The about page communicates the mission and values behind Mindfire's open source work. It includes:

- A hero section with a heading, subheading, a hero image, and two CTA links — "Explore Projects" (links to `/projects`) and "Contact Us"
- A **Mission** section describing the organization's open source goals
- A **Why Open Source** section explaining the philosophy behind contributing to open source
- A **Contributions** section with an "Explore Projects" link pointing to `/projects`

---

### 3.3 Projects Page

**Current Projects**

Displays all active FOSS projects sourced from the Directus CMS. Each project card shows:

- Project title and short description
- GitHub repository link
- Documentation link
- GitHub star count (live from GitHub API)
- Project Tags

Projects are filtered by `project_type = "current"` and `status = "published"`.

**Upcoming Projects**

A dedicated section lists projects in development. Fetched with `project_type = "upcoming"`.

**Filtering and Search**

Users can filter and search through projects by name, tags, or status directly on the page.

---

### 3.4 Contributors Page

The contributors page is the most feature-rich page on the site. It combines a general contributors list with a full leaderboard system.

**Hero Section**

A hero banner (`ContributorHero`) with a heading, subheading, and a total contributor count badge.

**Contributor Count**

A live count of total contributors displayed prominently using an animated counter .

**Top Contributors Carousel**

A horizontally scrollable carousel (`TopContributors`) showing highlighted contributors grouped by category (e.g. "Top By Commits", "Top by PR riased", and "Active this week"). Each card shows avatar, username, and a stat label. Navigation dots allow carousel browsing.

**Contributor List Section**

A full paginated list (`ContributorListSection`) of all human contributors. Each `ContributorCard` shows:

- Avatar image
- GitHub username linked to their profile
- Total contributions count
- Total pull requests
- Total issues opened

**Filter Sidebar**

A `ContributorFilterSidebar` allows filtering the contributor list by:

- Sort order (by contributions, by score, by last active)
- Activity filter (all, recently active, inactive)
- Score range filter

Includes a search box and a reset button.

**Top Scorers Panel**

A dedicated `TopScorersPanel` showing the top 10 contributors by leaderboard score. Features:

- A **Podium** (`PodiumSection`) displaying ranks 1, 2, 3 with visual distinction
- A **Rank List** (`RankListSection`) for ranks 4–10 using `RankRow` components
- A panel header (`PanelHeader`) with:
  - "All Time" and "Monthly" tabs
  - A month selector dropdown for browsing historical months
  - A "Live" badge
  - Download leaderboard as image button
  - Copy leaderboard button
- A footer hint text

**Contributor Modal**

Clicking a contributor opens a `ContributorModal` with a full breakdown of their stats:

- Total score with sub-scores (Code, Community, Quality)
- Score breakdown bar chart per category
- PR complexity distribution (small / medium / large percentages)
- Projects worked on count
- Badge (e.g. Gold, Silver) based on score tier

**Scoring System Info Panel**

A collapsible `ScoringSystem` section on the page explains how scores are calculated. It is collapsed by default and expands on click. It shows all scoring rules including PR complexity multipliers (×1.0, ×1.3, ×1.7).

---

### 3.5 Packages Page

Displays download statistics for all npm and PyPI packages owned by the organization.

**Package Cards**

Each package shows:

- Package name and type badge (npm / PyPI)
- Associated project title
- Daily, weekly, yearly download counts
- All-time total downloads
- Link to the package registry page

**Sorting**

Packages are sorted by total downloads in descending order.

---

### 3.6 Leaderboard System

**Overall Leaderboard**

Contributors are ranked by a total score computed from their open source activity. The score has three components:

| Score Type | What it measures |
|---|---|
| Code Score | PRs merged (with complexity multiplier), commits, PR reviews, code review comments |
| Community Score | Issues opened, issue comments, project diversity bonus |
| Quality Score | Test PRs, doc PRs, zero-revision PRs, first-time mentoring, impact bonuses |

Full scoring table:

| Activity | Points |
|---|---|
| Merged PR (small) | 5 |
| Merged PR (medium, 3+ files or 100+ lines) | 5 × 1.3 |
| Merged PR (large, 8+ files or 500+ lines) | 5 × 1.7 |
| Commit on default branch | 2 |
| PR review given | 3 |
| Code review comment | 1 |
| Issue opened | 2 (capped at 10/month) |
| Issue comment on another's issue | 1 (capped at 20/month) |
| PR includes tests | +1 |
| PR includes docs/readme | +1 |
| Mentoring a first-time contributor | +5 |
| PR merged with zero revision requests | +2 |
| Working on a new project for the first time | +10 per project |

**Monthly Leaderboard Archive**

A separate leaderboard is computed for each calendar month that has recorded activity. Users can browse any historical month via the month selector in the Top Scorers Panel. Archives are stored as `public/leaderboard/leaderboard-YYYY-MM.json` and indexed in `manifest.json`.

---

### 3.7 Legal Pages

The site includes three static legal pages:

- **Privacy Policy** — describes how user data is handled
- **Terms of Use** — outlines the terms for using the site
- **Cookie Policy** — describes cookie usage

All three pages render from constants defined in the codebase.

---

### 3.8 Join Us Section

A `JoinUs` component appears on relevant pages encouraging developers to contribute to Mindfire's open source projects. It links to the GitHub organization and the projects page.

---

### 3.9 Data Update Pipeline

All data is pre-generated at build time via update scripts. The pipeline runs in this order:

1. `updateProject.mjs` — Fetches projects, contributors, and download stats
2. `updatePackages.mjs` — Fetches npm and PyPI download stats
3. `make-cache.mjs` — Fetches raw GitHub activity (commits, PRs, issues) and caches it
4. `make-leaderboard.mjs` — Computes leaderboard scores and monthly breakdowns
5. `make-periodic-table.mjs` — Generates the periodic table JSON

The website reads these pre-generated JSON files at build time. No live API calls are made from the browser.

---

### 3.10 CI/CD Automation

Two CI workflows are maintained:

**Workflow 1 — Full Build (Data + Frontend)**

Triggers on push to `main`, daily cron at midnight UTC, and manual dispatch. Runs the full `update-all` data fetch pipeline followed by the Next.js build. Deploys to `gh-pages` with leaderboard archive files preserved. This is the primary workflow.

**Workflow 2 — Frontend-Only Build**

Triggers on push to `main` and manual dispatch. Skips all data fetch scripts and only builds the Next.js frontend (`build:ci`). Used for frontend-only changes where re-fetching all external data is unnecessary.

Both workflows create a GitHub release via `semantic-release` after a successful build.

---

### 3.11 Bot and Spam Filtering

The following accounts are automatically excluded from all contributor lists and leaderboard scoring:

- GitHub Actions bot, Dependabot, Renovate bot, Snyk bot, Codecov, Greenkeeper
- Any account with `[bot]` in the username

Issue scoring is capped per calendar month: 10 issues/month and 20 issue comments/month.

---

## 4. Test Coverage

The project has a comprehensive test suite across three layers.

**Unit Tests** — run via Node's built-in test runner (`node --test`)

These cover the core logic of all update scripts:

- `config.test.mjs` — fetchData utility, writeJsonToFile, retry and timeout behavior
- `updateProject.test.mjs` — project data mapping, contributor aggregation
- `updatePackages.test.mjs` — npm and PyPI stat fetching, download sum calculation
- `updateContributors.test.mjs` — bot filtering, contribution aggregation across repos, `lastActiveDays` calculation
- `make-cache.test.mjs` — PR complexity classification, default branch filtering, issue categorization
- `make-leaderboard.test.mjs` — full `calculateScore` logic (all scoring rules + monthly caps), `applyMonthlyCaps`, monthly breakdown generation

**Component Tests** — run via Jest + React Testing Library

These cover rendering and interactions for all major UI components:

- `about.test.tsx` — Hero heading/subheading, CTA links, hero image alt text, all section titles
- `aboutSegmentSection.test.tsx` — Title, description, data grid items, children slot, empty state, custom className
- `contributor.test.tsx` — TopScorersPanel, TopContributors carousel, ScoringSystem accordion (collapsed by default, expands on click, multiplier labels), PodiumSection, RankRow, ContributorFilterSidebar, ContributorCard, ContributorModal, FilterSection, RadioGroup, ContributorCount
- `currentProjects.test.tsx` — Project card rendering, tags, links
- `upcomingProjects.test.tsx` — Upcoming project card rendering
- `packages.test.tsx` — Package card stats display
- `project.test.tsx` — Project page layout
- `joinUs.test.tsx` — Join Us CTA section rendering
- `cookiePolicy.test.tsx`, `privacyPolicy.test.tsx`, `termsOfUse.test.tsx` — Legal page content rendering

**Integration Tests** — run via Jest

These test end-to-end data flow through full page-level components with mocked data:

- `projects.integration.test.tsx` — Full projects page with mocked CMS and GitHub data
- `contributor.integration.test.tsx` — Full contributors page with mocked leaderboard and contributor data
- `packages.integration.test.tsx` — Full packages page with mocked stats data

Run tests with:

```bash
npm run test              # all tests
npm run test:unit         # unit only
npm run test:components   # component only
npm run test:integration  # integration only
npm run test:coverage     # with coverage report
```

---

## 5. Data Sources

| Data | Source |
|---|---|
| Projects & packages | Directus CMS GraphQL API |
| GitHub stars, topics | GitHub REST API |
| Contributors | GitHub Collaborators + Commits API |
| npm downloads | api.npmjs.org |
| PyPI downloads | pypistats.org API |
| Commits, PRs, Issues | GitHub REST API (cached at build time) |

---