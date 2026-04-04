# Learn a Bit Full Product Test Plan

**Goal:** Verify that the current product build is functionally correct, state-safe, and usable across the full learning loop.

**Scope:** Auth, domain management, map flow, lesson flow, prediction flow, quiz flow, Feynman flow, rewards, player meta persistence, profile shell, and mobile/web UX.

**Approach:** Split testing into two layers:
- AI-led deterministic verification: repeatable functional checks, persistence checks, routing, API behavior, regression checks
- Human-led experiential verification: trust, clarity, perceived smoothness, gesture comfort, product intuition, copy comprehension

---

## 1. Test Strategy

### 1.1 AI-led automated and semi-automated testing

Use this layer to catch:
- broken API routes
- incorrect persistence
- repeated reward bugs
- stale state / race conditions
- modal dead-ends
- wrong flow transitions
- layout regressions obvious from snapshots
- build failures

### 1.2 Human-led product testing

Use this layer to catch:
- “does this feel right?”
- confusion in progression
- whether users understand where they are after closing/reopening modals
- whether buttons feel too prominent or too hidden
- whether copy sounds natural
- whether the app feels rewarding, not just logically correct

---

## 2. Preflight Checks

Before any full run:

1. Confirm frontend dev server loads:
   - `http://localhost:3031`

2. Confirm backend health:
   - `GET http://localhost:3030/api/health`

3. Confirm local AI proxy is reachable with valid auth:
   - `http://localhost:8000/v1/models`

4. Confirm Supabase tables exist:
   - `profiles`
   - `learning_progress`
   - `player_meta`

5. Confirm current user can log in and fetch:
   - `/api/me`
   - `/api/progress`
   - `/api/player-meta`

---

## 3. Functional Test Matrix

### 3.1 Authentication

Scenarios:
- Register new application account
- Confirm email then log in
- Log out and log back in
- Log in on same browser as a different account

Expected:
- No cross-user leakage of coins, notes, favorites, wrong items
- Auth errors are readable
- Session persists across refresh

Likely issues:
- user-scoped local cache not switching cleanly
- stale Supabase session causing mixed UI state
- profile creation race on first login

### 3.2 Domain Management

Scenarios:
- Add first domain
- Add second domain
- Switch between domains repeatedly
- Delete one domain while multiple domains exist
- Re-add a deleted domain

Expected:
- each domain keeps separate progress
- adding a new domain does not overwrite previous domains
- delete removes only that domain
- map always has a valid active domain

Likely issues:
- async refresh restoring the wrong active domain
- add-domain success path entering map before refreshed list is loaded
- delete-domain choosing the wrong fallback domain

### 3.3 Title Generation

Scenarios:
- Click a new level once
- Click the same level repeatedly while loading
- Refresh title options intentionally
- Reopen a level with existing title options

Expected:
- one generation request per level unless user explicitly refreshes
- repeated clicks do not generate duplicates
- saved title groups restore correctly

Likely issues:
- race conditions around repeated clicks
- title refresh overwriting active session unexpectedly

### 3.4 Article Generation

Scenarios:
- Select a title for a fresh level
- Reopen same level after article exists
- Open completed level again

Expected:
- first load generates article once
- subsequent opens restore article instead of regenerating
- completed levels open in review/resume mode, not fresh generation

Likely issues:
- article restores but wrong title shown
- completed level jumps to wrong stage

### 3.5 Lesson Flow

Scenarios:
- Read part 1 then leave
- Resume level
- Advance to prediction 1
- Close prediction overlay and continue later

Expected:
- lesson step persists
- closing overlay does not discard state
- user can continue from where they left off

Likely issues:
- modal close returns to wrong step
- lesson step saves but UI still re-renders from start

### 3.6 Prediction Flow

Scenarios:
- Answer prediction with default wager
- Long-press to increase wager
- Close overlay before answering
- Reopen and continue

Expected:
- wager increases only while press is held
- one settlement per prediction
- closing overlay preserves unresolved state
- reward applies exactly once

Likely issues:
- duplicate reward on reopen
- wager not resetting correctly across predictions
- press-hold behavior too sensitive on mobile

### 3.7 Quiz Flow

Scenarios:
- Answer all questions all-correct
- Answer all questions mixed correct/wrong
- Close quiz midway and resume
- Finish final question and verify post-quiz choice sheet
- Choose “retry quiz”
- Choose “go to Feynman”

Expected:
- final question always exits to explicit choice sheet
- no dead-end state
- retry does not grant coins again
- resume opens same question state

Likely issues:
- final question saved as half-complete
- choice sheet suppressed by another state flag
- retry not resetting quiz state cleanly

### 3.8 Feynman Flow

Scenarios:
- Open Feynman sheet
- Write partial draft and close
- Resume draft
- Submit draft
- Choose “retry Feynman”
- Choose “next article”

Expected:
- draft persists
- grade persists after submit
- retry resets only Feynman stage
- article completion reward fires once only

Likely issues:
- draft saved but not restored
- next-article action still depends on stale toast state

### 3.9 Rewards and Player Meta

Scenarios:
- Finish one article
- Finish 10th article milestone
- Finish perfect quiz
- Lose prediction with wager
- Win prediction with wager
- Save note
- Favorite/unfavorite article

Expected:
- article completion: `+100`
- 10th article milestone: additional `+1000`
- 100th article milestone: additional `+10000`
- prediction: `+/- wager`
- perfect quiz: `+500`
- no duplicate rewards on replay
- notes/favorites appear in profile and survive refresh

Likely issues:
- processed event dedupe gaps
- backend write succeeds but profile shell reads stale local state
- milestone edges off by one

### 3.10 Profile Shell

Scenarios:
- Open wallet sheet
- Open notes/favorites/wrong-book/title-hall/shop sheets
- Reload page and verify persisted values

Expected:
- counts reflect actual saved state
- sheets open and close cleanly
- values survive refresh and relogin

Likely issues:
- shell count mismatches
- local cache hiding backend failure
- shop shell present but non-obvious as placeholder

---

## 4. UX and Interaction Testing

### 4.1 Modal Safety

Every modal/sheet should support:
- close button
- backdrop tap
- later continuation from stored state

### 4.2 Navigation Safety

User should never get stuck:
- after quiz
- after Feynman
- after deleting a domain
- after resuming a completed level

### 4.3 Touch and Mobile Comfort

Check on actual device:
- long press wager control feels intentional
- buttons are not too close
- top bars do not block content
- bottom nav remains tappable with overlays

---

## 5. Data Integrity Checks

For each key action, verify both:
- frontend visible state
- backend stored state

Check these tables:
- `learning_progress`
- `player_meta`
- `profiles`

Data consistency expectations:
- completed level should not remain `quiz completed=false`
- asset counts should match saved arrays
- deleting a domain must not mutate player assets

---

## 6. AI-led Execution Order

Recommended order for me to execute:

1. Run backend tests
2. Run frontend helper tests
3. Build frontend
4. Browser flow:
   - login
   - add domain
   - enter level
   - article
   - prediction
   - quiz
   - Feynman
   - profile verification
5. Verify Supabase rows for changed entities
6. Sync Capacitor build

---

## 7. Human UAT Checklist

This is the shortest useful human pass:

1. Add 2 domains and switch between them
2. Do one level halfway, leave, come back, continue
3. Finish one full level
4. Verify profile coins, notes, favorites changed
5. Reopen finished level and confirm it feels like review, not reset
6. Delete one domain and confirm the rest feel untouched

If these 6 feel intuitive, the product is likely close to ready.

---

## 8. My Current Expectation

If I run the full test pass, I expect the most likely remaining issues to be:
- one or two resume-edge bugs around `quiz` to `feynman` transition
- replay/retry paths potentially still granting or suppressing rewards incorrectly
- completed-level reopen semantics still not polished enough as a dedicated “review mode”
- small UX confusion around what the shop currently does versus what it will do later

So my recommendation is:
- let me do the AI-led full pass first
- then you do a short 10-15 minute human experience pass

That combination is much better than either alone.
