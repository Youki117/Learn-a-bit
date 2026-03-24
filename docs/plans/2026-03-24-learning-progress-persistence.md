# Learning Progress Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist per-domain learning progress so completed levels, selected articles, and generated content survive page revisits and domain switching.

**Architecture:** Add a dedicated `learning_progress` table keyed by `user_id + domain`, expose authenticated backend routes to read and upsert normalized domain progress, and update the React app to restore or persist the current level/article state instead of regenerating it. Each domain owns an independent 10-level track with its own title options, selected titles, article payloads, and completion state.

**Tech Stack:** React 19, Vite, Express, Supabase, node:test, TypeScript

---

### Task 1: Define the persisted progress contract

**Files:**
- Create: `docs/sql/2026-03-24-learning-progress.sql`
- Create: `server/src/lib/learning-progress.ts`
- Create: `src/types/learning-progress.ts`

**Step 1: Write the SQL schema**

Create a `learning_progress` table with:
- `user_id uuid not null`
- `domain text not null`
- `current_level integer not null default 1`
- `total_levels integer not null default 10`
- `levels jsonb not null`
- timestamps
- primary key on `(user_id, domain)`

**Step 2: Define shared shape**

Create TypeScript types for:
- `LearningLevelState`
- `LearningProgress`
- `TOTAL_LEVELS`

**Step 3: Add normalization helpers**

Implement helpers that:
- create default 10-level progress for a domain
- validate and normalize persisted JSON
- keep `currentLevel` inside `1..TOTAL_LEVELS + 1`

### Task 2: Add failing backend tests for progress routes

**Files:**
- Create: `server/test/progress.test.ts`

**Step 1: Write the failing tests**

Cover:
- `GET /api/progress/:domain` returns default progress when row is missing
- `PUT /api/progress/:domain` upserts progress for one domain
- updating one domain does not affect another domain for the same user
- persisted article/title data is returned on subsequent `GET`

**Step 2: Run the backend tests to verify they fail**

Run:
`cmd /c node --test --experimental-test-isolation=none --import tsx test\\progress.test.ts`

### Task 3: Implement backend storage and routes

**Files:**
- Modify: `server/src/app.ts`
- Create: `server/src/routes/progress.ts`
- Modify: `server/src/lib/db.ts` if typing support is needed

**Step 1: Register authenticated progress routes**

Add:
- `GET /api/progress/:domain`
- `PUT /api/progress/:domain`

**Step 2: Implement Supabase read/upsert**

Behavior:
- read one `(user_id, domain)` row
- return default normalized progress when none exists
- upsert normalized payload on save

**Step 3: Run the backend suite**

Run:
`cmd /c node --test --experimental-test-isolation=none --import tsx test\\**\\*.test.ts`

### Task 4: Integrate the frontend with persisted progress

**Files:**
- Modify: `src/services/api.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/MapView.tsx`

**Step 1: Add frontend API helpers**

Create:
- `fetchLearningProgress`
- `saveLearningProgress`

**Step 2: Load progress per domain**

When domain changes or map opens:
- fetch that domain’s progress
- keep each domain independent

**Step 3: Restore instead of regenerate**

When clicking a level:
- if article exists for that level, reopen it
- else if title options exist, show saved options
- else generate titles once, store them, and show the active level’s options

**Step 4: Save selected article and completion**

When choosing a title:
- generate article once
- persist selected title + article data into that level

When finishing the learning loop:
- mark the level complete
- advance `currentLevel`

**Step 5: Render map from real progress**

Replace the hard-coded map state with:
- completed levels
- current active level
- locked future levels

### Task 5: Verify the integrated behavior

**Files:**
- Modify as needed: `src/App.tsx`, `server/src/routes/progress.ts`

**Step 1: Run backend tests**

Run:
`cmd /c node --test --experimental-test-isolation=none --import tsx test\\**\\*.test.ts`

**Step 2: Run frontend build**

Run:
`cmd /c npm.cmd run build`

**Step 3: Sync Capacitor bundle if web assets changed**

Run:
`cmd /c npm.cmd run cap:sync`

**Step 4: Manual behavior check**

Verify:
- domain A and domain B keep separate progress
- reopening a completed level restores the saved article
- finishing level 1 unlocks level 2 instead of regenerating level 1
