# System Design Specification (SDS)

**Project:** Mindfire FOSS Website  
**Organization:** Mindfire Digital  
**Repository:** `mindfiredigital/mindfiredigital.github.io`

---

## 1. Purpose

This document describes the technical architecture, data flow, module design, CI/CD pipelines, and implementation details of the Mindfire FOSS Website. It is intended for developers working on or extending the codebase.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 13 (App Router) |
| Language | TypeScript + JavaScript (ESM `.mjs` for scripts) |
| Styling | Tailwind CSS |
| CMS | Directus (self-hosted, GraphQL API) |
| Package registry APIs | api.npmjs.org, pypistats.org |
| Source control / CI | GitHub Actions |
| Deployment | GitHub Pages (`gh-pages` branch) |
| Logging | Winston |
| Runtime (scripts) | Node.js 24 with `tsx` for TypeScript imports |
| Testing | Node built-in test runner (unit), Jest + React Testing Library (component + integration) |

---

## 3. CI/CD Workflows

There are two separate GitHub Actions workflows, each serving a different purpose.

---

### 3.1 Workflow 1 — Full Build (`ci.yml`)

**Purpose:** Fetches all fresh data (GitHub, CMS, npm, PyPI) and rebuilds the entire site.

**Triggers:**
- Push to `main`
- Daily cron: `0 0 * * *` (midnight UTC)
- Manual dispatch (`workflow_dispatch`)

**Environment:**
- Node.js 24
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`

**What happens when a PR is merged to `main` (or on schedule):**

```
1.  Checkout repository (actions/checkout@v4)
2.  Setup Node.js 24
3.  npm install
4.  npm run build
      └── npm run update-all
            ├── node updateScript/updateProject.mjs    → writes projects.json, contributors.json, stats.json
            ├── node updateScript/updatePackages.mjs   → writes packages.json (and stats via getAllStats)
            ├── node updateScript/make-cache.mjs       → writes leaderboard-cache.json
            ├── node updateScript/make-leaderboard.mjs → writes leaderboard.json, top-scorers.json, public/leaderboard/*.json
            └── node updateScript/make-periodic-table.mjs → writes periodic-table data
      └── next build                                   → consumes all JSONs → produces build/
      └── touch build/.nojekyll

5.  git restore src/asset/*.json
      ← Discards the freshly written JSON from git tracking.
        The data is already baked into the Next.js build output in build/.
        This step prevents git conflicts when switching to gh-pages.

6.  git fetch origin

7.  git config (set Actions bot identity)

8.  cp -r public/leaderboard/* /tmp/leaderboard-data/
      ← Preserve monthly leaderboard JSONs before branch switch.
        These accumulate over time and are not regenerated on every run.

9.  git restore public/leaderboard/
      ← Restores leaderboard files to HEAD state so branch switch doesn't fail.

10. Build staging (copy everything to /tmp/temp-directory):
      cp -r build/* /tmp/temp-directory/
      cp -r /tmp/leaderboard-data/* /tmp/temp-directory/leaderboard/

11. git checkout gh-pages
      ← Switch to deployment branch.

12. rm -rf *  +  rm -rf .nojekyll
      ← Clear old deployment completely.

13. cp -r /tmp/temp-directory/* .
      ← Deploy new build + leaderboard archives.

14. git add -f
    if changes exist → git commit + git push origin gh-pages
      ← Only commits if something actually changed (avoids empty commits).

15. git checkout main
      ← Return to main for subsequent steps.

16. (separate job, needs: build)
    npx semantic-release@22.0.0
      ← Creates a versioned GitHub release based on conventional commits.
```

---

### 3.2 Workflow 2 — Frontend-Only Build (`ci-frontend.yml`)

**Purpose:** Rebuilds the frontend without re-fetching any external data. Used for frontend-only changes (UI fixes, style changes, component updates) where running the full data pipeline would be wasteful and slow.

**Triggers:**
- Push to `main`
- Manual dispatch (`workflow_dispatch`)
- No scheduled cron (data does not need refreshing on frontend-only changes)

**Node version:** 20

**Key difference from Workflow 1:** Uses `npm run build:ci` instead of `npm run build`:

```json
"build:ci": "next build && node -e \"require('fs').writeFileSync('./build/.nojekyll', '')\""
```

This completely skips `update-all` — no GitHub, CMS, npm, or PyPI API calls are made. The Next.js build runs against whatever JSON files are already committed in `src/asset/`.

**Deployment steps are the same** except there is no leaderboard preservation step, since no new leaderboard data was generated. This CI is for frontend update only.

**Semantic release** runs as a separate job after build, same as Workflow 1.

---

### 3.3 Workflow Comparison

| | Workflow 1 (Full) | Workflow 2 (Frontend-only) |
|---|---|---|
| Runs data scripts | Yes (`update-all`) | No (`build:ci`) |
| Cron schedule | Yes (daily midnight) | No |
| Preserves JSON archive | Yes | No |
| Use case | Data refresh + any change | UI/frontend-only changes |
| Build command | `npm run build` | `npm run build:ci` |

---

## 4. Update Script Architecture

All data is pre-fetched and written to JSON before the Next.js build. Scripts run in sequence via `update-all`.

### 4.1 config.mjs

Central configuration and shared utilities for all update scripts.

**Exports:**
- `githubToken` — from `process.env.GITHUB_TOKEN`
- `gitBaseUrl` — `https://api.github.com/repos`
- `gitOwner` — `mindfiredigital`
- `pathForJson` — `../src/asset` (relative to `updateScript/`)
- `npmPackages` — filtered from `packages.json` where `type === "npm"`
- `pypiPackages` — filtered from `packages.json` where `type === "PyPi"`
- `writeJsonToFile(relativePath, data)` — resolves path from `__dirname`, writes JSON with 2-space indent
- `fetchData(url, options, retries=3, timeoutMs=10000)` — fetch wrapper with 3 retries, 10s abort timeout, exponential backoff (1s × attempt number)

---

### 4.2 updateProject.mjs

**Writes:** `projects.json`, `upcomingProjects.json`, `contributors.json`, `stats.json`

**Flow:**

```
Promise.all([
  Directus CMS → current projects (filter: published + type=current),
  Directus CMS → upcoming projects (filter: type=upcoming),
  GitHub API   → all org repos (paginated 100/page)
])
  ↓
For each project:
  GitHub API (repo details) + GitHub API (topics) → enrich with stars, tags, lastPushedAt
  writeJsonToFile → projects.json / upcomingProjects.json
  ↓
For each repo:
  getCollaboratorsWithDefault() → filter out bots and github-actions accounts
  getContributorData() → enrich with pullRequestCount, issueCount, lastActiveDays
  ↓
Merge contributions across repos into contributionsMap:
  - sum contributions
  - sum pullRequestCount and issueCount
  - lastActiveDays = minimum across repos (most recent activity wins)
  Sort by contributions desc → writeJsonToFile → contributors.json
  ↓
await getAllStats(npmPackages, pypiPackages)
  → enrich with titles → sort by total desc
  → writeJsonToFile → stats.json
```

**Key implementation notes:**
- `getAllStats` is fully awaited — previously it was a floating `.then()` chain which caused `stats.json` to sometimes not be written before the process exited
- `process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0` is set to handle the self-signed TLS cert on the Directus instance
- Bot accounts (`type === "Bot"` or login starting with `github-actions`) are filtered before contributor processing

---

### 4.3 updatePackages.mjs

**Writes:** `packages.json`, `projects_grouped.json` (via `updatePackages()`); provides `getAllStats` export consumed by `updateProject.mjs`

**RequestQueue class:**

A serial queue preventing API rate limit hits:

```
concurrency = 1, delayBetweenRequests = 1000ms
```

**fetchWithRetry:**

Up to 5 retries with exponential backoff + random jitter. Detects rate limiting via HTTP 429, "too many requests", "rate limit", or "cloudflare" in error messages.

**getAllStats(npmPackages, pypiPackages):**

For each npm package:
1. Fetches `last-day`, `last-week`, `last-year` via `https://api.npmjs.org/downloads/range/{period}/@mindfiredigital/{name}`
2. Fetches all-time total via **chunked 18-month requests** 
3. Sums `downloads` array entries

For each PyPI package:
1. Fetches recent stats from `https://pypistats.org/api/packages/{name}/recent`
2. Fetches all-time total via `fetchTotalDownloads()` from `pypiTotalStats.mjs`

**4.3.1 npm All-Time Total — Chunked Approach**

The npm API silently caps any date range request to ~18 months regardless of what dates are passed. The previously used `1000-01-01:3000-01-01` trick only ever returned the most recent ~18 months of data, causing totals to change on every run as the window slid forward.

Fix: chunk from `2015-01-10` (earliest npm data) to today in 18-month windows and sum all chunks:

---

### 4.4 updateContributors.mjs

Provides two exported functions used by `updateProject.mjs`:

**`getCollaboratorsWithDefault(owner, repo, token)`** — Fetches contributors from GitHub. Falls back to a default list if the repo returns no contributors.

**`getContributorData(contributor)`** — Enriches a contributor with `pullRequestCount`, `issueCount`, and `lastActiveDays` using GitHub search API queries.

---

### 4.5 make-cache.mjs

**Writes:** `leaderboard-cache.json`, `leaderboard-progress.json` (temporary checkpoint)

This is the most GitHub API-intensive script. It fetches and caches raw activity data per project to avoid re-fetching on every leaderboard calculation.

**RequestQueue:** concurrency=1, 500ms delay.

**Per-project data collected:**

- All commits on the default branch only (paginated, 100/page)
- All merged PRs whose `merge_commit_sha` exists in the default branch commit SHA set — ensures only PRs actually merged to default branch are counted
- Full PR details for complexity analysis (files changed, additions, deletions)
- PR reviews and review comments (human only, bots excluded)
- Issues categorized by label: bugs, enhancements, documentation, others
- Comment authors per issue (fetched individually)

**PR Complexity Classification:**

| Level | Condition | Score Multiplier |
|---|---|---|
| small | < 3 files AND < 100 lines | 1.0 |
| medium | 3–7 files OR 100–499 lines | 1.3 |
| large | 8+ files OR 500+ lines | 1.7 |

**Resume / Progress checkpoint:**

`leaderboard-progress.json` tracks completed projects. If the script is interrupted mid-run, it resumes from where it left off. The checkpoint is deleted after a successful full run.

**Special Projects:**

The website repo itself (`mindfiredigital.github.io`) is hardcoded as a special project with id `special-website` so contributions to the website itself are included in leaderboard scoring.

---

### 4.6 make-leaderboard.mjs

**Reads:** `leaderboard-cache.json`, `contributors.json`, `contributor-mapping.json`  
**Writes:** `leaderboard.json`, `top-scorers.json`, `public/leaderboard/leaderboard-YYYY-MM.json`, `public/leaderboard/manifest.json`

**Scoring constants:**

```javascript
const SCORING = {
  PR_MERGED_BASE: 5,
  COMMIT: 2,
  PR_REVIEW_GIVEN: 3,
  CODE_REVIEW_COMMENT: 1,
  ISSUE_OPENED: 2,
  ISSUE_COMMENT: 1,
  HAS_TESTS: 1,
  HAS_DOCS: 1,
  FIRST_TIME_MENTOR: 5,
  ZERO_REVISIONS: 2,
  PROJECT_DIVERSITY: 10,
  CAPS: { ISSUES_PER_MONTH: 10, ISSUE_COMMENTS_PER_MONTH: 20 }
};
```

**Score pipeline per contributor:**

```
For each contributor:
  For each project in contributor-mapping:
    analyzeUserInProject() → extract commits, PRs, reviews, issues, comments
  Aggregate across all projects
  calculateScore():
    prScore        = sum(PR_MERGED_BASE × complexity_multiplier) per PR
    codeScore      = prScore + commits×2 + reviews×3 + reviewComments×1
    communityScore = cappedIssues×2 + cappedComments×1 + newProjects×10
    qualityScore   = testPRs×1 + docPRs×1 + zeroRevisionPRs×2 + mentorEvents×5 + impactBonuses
    totalScore     = codeScore + communityScore + qualityScore
```

**contributor-mapping.json:** Maps each GitHub login to the project IDs they've contributed to, scoping analysis per contributor and avoiding unnecessary processing across unrelated projects.

---

### 4.7 make-periodic-table.mjs

**Reads:** `packages.json`, `stats.json`  
**Writes:** periodic table data JSON

Joins package metadata with download stats. Each entry gets a short symbol (derived from package name), type badge (npm/PyPI), total download count, and project title. Output is consumed by the periodic table UI component.

---

## 5. API Rate Limiting Strategy

| API | Strategy |
|---|---|
| GitHub REST | Serial queue (concurrency=1, 500ms delay), exponential backoff on 403/429, respects `retry-after` and `x-ratelimit-reset` headers |
| npm downloads | Serial queue (concurrency=1, 1000ms delay), exponential backoff + jitter on 429/cloudflare, 5 max retries |
| PyPI stats | 3 retries, 1000ms initial delay |
| Directus CMS | 3 retries via `fetchData()`, 10s abort timeout |

---

## 6. Test Architecture

### 6.1 Unit Tests

Run via Node's built-in test runner (`node --test`). No Jest involved. Files live in `tests/unit/`.

```bash
npm run test:unit         # node --test tests/unit/*.test.mjs
npm run test:unit:watch   # watch mode
```

Each test file directly imports and tests the pure logic functions extracted from the update scripts:

- `config.test.mjs` — `fetchData` retry behavior, timeout handling, `writeJsonToFile`
- `updateProject.test.mjs` — project mapping, contributor merge logic
- `updatePackages.test.mjs` — `calculateAverageDownloads`, stat object shape
- `updateContributors.test.mjs` — `filterBots` (type=Bot, github-actions prefix, dependabot, renovate patterns), `aggregateContributions` across repos, `calculateLastActiveDays`
- `make-cache.test.mjs` — `analyzePRComplexity` (small/medium/large thresholds), default branch SHA filtering, issue label categorization
- `make-leaderboard.test.mjs` — `calculateScore` (all point rules, monthly caps at 10 issues/20 comments), `applyMonthlyCaps` (UTC bucketing, custom date fields), total = code + community + quality assertion

### 6.2 Component Tests

Run via Jest with `jest-environment-jsdom` and React Testing Library. Files live in `tests/component/`.

```bash
npm run test:components       # jest --selectProjects component
npm run test:components:watch
```

Key mocks used across component tests:
- `next/image` and `next/link` are mocked to plain HTML equivalents
- `ResizeObserver` is polyfilled in `jest.setup.ts` for `@headlessui/react`
- Custom hooks (`useAnimatedCounter`, `useContributorFilters`, `useTopScorersPanel`, `useContributorModal`) are mocked to return deterministic values
- `BorderBeam`, `buildGroups` utilities are mocked to avoid animation/DOM side effects

Notable test cases:
- `ScoringSystem` accordion: verifies collapsed by default (`.max-h-0` present), expands on click, shows ×1.0 / ×1.3 / ×1.7 multipliers after open
- `ContributorFilterSidebar`: verifies filter options render and callbacks are wired
- `ContributorModal`: verifies score breakdown and badge render correctly
- `TopScorersPanel`: verifies podium, rank list, live badge, footer hint, month selector

### 6.3 Integration Tests

Run via Jest. Files live in `tests/integration/`.

```bash
npm run test:integration
npm run test:integration:watch
```

Test full page-level component trees with mocked JSON data, verifying that data flows correctly from props through to rendered output:

- `projects.integration.test.tsx` — renders full projects page, verifies project cards appear with correct data
- `contributor.integration.test.tsx` — renders full contributors page with leaderboard data
- `packages.integration.test.tsx` — renders full packages page with download stats

### 6.4 Coverage

```bash
npm run test:coverage   # jest --coverage
```

Covers component and integration tests. Unit test coverage is tracked separately via the Node runner.

---

## 7. Data Flow Summary

```
┌─────────────────────────────────────────────┐
│              External APIs                  │
│  Directus CMS │ GitHub │ npm │ PyPI         │
└──────────────┬──────────────────────────────┘
               │  (at build time, CI only)
               ▼
┌──────────────────────────────────────────────┐
│           updateScript/*.mjs                 │
│  updateProject → updatePackages →            │
│  make-cache → make-leaderboard →             │
│  make-periodic-table                         │
└──────────────┬───────────────────────────────┘
               │  writes JSON files
               ▼
┌──────────────────────────────────────────────┐
│          src/asset/*.json                    │
│  projects.json, contributors.json,           │
│  stats.json, leaderboard.json, etc.          │
└──────────────┬───────────────────────────────┘
               │  consumed at build time
               ▼
┌──────────────────────────────────────────────┐
│           next build → build/                │
│  Static HTML/CSS/JS with data baked in       │
└──────────────┬───────────────────────────────┘
               │  deployed via CI
               ▼
┌──────────────────────────────────────────────┐
│           gh-pages branch                   │
│  Live site served by GitHub Pages            │
└──────────────────────────────────────────────┘
```
