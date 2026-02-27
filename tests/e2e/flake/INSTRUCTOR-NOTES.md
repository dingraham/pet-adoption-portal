# Flaky Test Exercises — Instructor Notes

Each exercise demonstrates a distinct real-world flaky test category. Tests should be run with `--repeat-each=10` (or `--repeat-each=5` for test-isolation) to observe intermittent failures.

---

## race-condition.spec.js — Racing the UI

**Category:** Missing network wait + non-retrying assertions

**What's broken:**

Both tests apply a species filter but don't wait for the filtered API response before reading results. On a fast machine the assertion may still pass because the response arrives quickly; on a slow machine or CI runner it reads stale data from before the filter was applied.

The second compounding problem: both tests use `.textContent()` and `.allTextContents()` — one-shot DOM reads that don't retry. Even when the network responds in time, the DOM re-render can still race the read. This is different from the missing wait: it's possible to add a `waitForResponse` and *still* flake if you then use a non-retrying read.

- **Test 1:** Reads `pet-count` immediately after `selectOption`, then compares with a manual `toBeLessThan`. On a slow machine the count hasn't updated yet.
- **Test 2:** Captures `initialBreedCount` before filtering, then reads `allTextContents()` immediately after `selectOption`. On a slow machine the breed list hasn't updated, so `breeds.length` still equals `initialBreedCount` and the `toBeLessThan` fails.

**The fix:**
1. Set up `const responsePromise = page.waitForResponse(...)` *before* the filter action, then `await responsePromise` after it.
2. Replace `textContent()` + manual `expect(Number(...))` with Playwright's auto-retrying assertion: `await expect(locator).not.toHaveText(initialValue)`.
3. Capture the response body from `waitForResponse`. Use `pets.every((pet) => pet.species === 'cat')` to verify the filter actually worked at the data layer, then `await expect(page.locator('[data-testid^="pet-breed-"]')).toHaveCount(pets.length)` to confirm all results rendered. This avoids hardcoding breed names — the API response is the source of truth for both correctness and count.

---

## animation-timing.spec.js — Animations & Transitions

**Category:** Interacting with elements before they are stable

**What's broken:**

Both tests use a short `{ timeout: 1000 }` on elements that are conditionally rendered via Vue's `v-if`. The element is inserted into the DOM when the condition becomes true, but it may not be fully laid out, visible, or interactive at the moment the test acts on it.

- **Test 1:** After clicking "More Filters", the expanded filter panel (`v-if="showFilters"`) appears, but `selectOption` on the age dropdown fires immediately with a 1-second timeout. On a slow machine the panel is still mounting.
- **Test 2:** After clicking "Schedule Meet & Greet", the modal (`v-if="showScheduleModal"`) appears, but `fill` on the date input fires before the modal content is interactive, and `toBeVisible` on the Confirm button uses a 1-second timeout.

**The fix:**
1. After clicking "More Filters", wait for the container to be ready before acting on its children: `await expect(page.getByTestId('expanded-filters')).toBeVisible()`.
2. After opening the modal, wait for a stable element inside it before interacting: `await expect(page.getByText('Schedule Meet & Greet')).toBeVisible()`.
3. Remove the short overriding timeouts — let Playwright's default timeout handle it, or use `waitForResponse` to confirm the filter took effect.

---

## element-ambiguity.spec.js — Element Ambiguity

**Category:** Overly broad locators matching multiple elements

**What's broken:**

Both tests use locators that match more elements than intended:

- **Test 1:** `page.getByRole('heading', { level: 3 })` matches every pet name heading on the page (~12 `<h3>` elements). Calling `.textContent()` on a multi-match locator triggers Playwright's strict mode violation — it refuses to act on ambiguous matches. The assertion `.toBeTruthy()` is correct but unreachable because the locator itself is ambiguous.
- **Test 2:** `userPage.getByRole('button').first()` on the pet detail page matches the favorite heart button (first button in DOM order on the page), not "Start Adoption Application". Clicking the heart toggles a favorite without navigating, so the URL assertion fails. The test already uses `userPage` and `waitForResponse` for the pet detail API as prerequisites so students reach the actual ambiguity bug — the core issue is the overly broad button selector.

**The fix:**
1. Scope the heading locator to the first card: `page.locator('[data-testid^="pet-card-"]').first().getByRole('heading').textContent()`. Assert `.toBeTruthy()` rather than a hardcoded name.
2. Replace `getByRole('button').first()` with the explicit testid: `userPage.getByTestId('start-application-button').click()`.

---

## spa-navigation.spec.js — SPA Navigation Assumptions

**Category:** Not accounting for async client-side route changes

**What's broken:**

In a Vue SPA, `router.push()` is async — the URL update, component unmount/mount, and any data fetching on the new route are separate async steps. This test has four places where it doesn't wait properly:

1. After clicking "Login", `toHaveURL(/dashboard/, { timeout: 500 })` runs before the login API call has completed and `router.push('/dashboard')` has fired. 500ms is not enough when multiple workers are hitting the login endpoint simultaneously.
2. `page.goto('/pets')` is used directly instead of clicking the nav link. This forces a full page reload, which is slower than SPA navigation, and the auth state may not be fully re-hydrated in time.
3. After clicking a pet card, `start-application-button` is queried with `{ timeout: 300 }`. The PetDetail component uses `v-if="pet"` — the button doesn't exist until the component mounts *and* the pet API call resolves.
4. After clicking "Start Adoption Application", `Step 1 of 5` is expected visible with `{ timeout: 300 }`. The Apply component also fetches the pet before rendering the form.

**The fix:**
1. Use `await page.waitForURL(/dashboard/)` after login instead of a short-timeout assertion.
2. Navigate using the nav link (`page.getByTestId('nav-browse-pets').click()`) to stay in the SPA, or add `waitForLoadState` after `goto`.
3. After clicking a pet card, use `await page.waitForURL(/\/pets\/\d+/)` to confirm the route changed, then wait for the pet data to load.
4. After clicking "Start Adoption Application", use `await page.waitForURL(/\/apply\//)` and let the default timeout handle the form rendering.

---

## test-isolation.spec.js — Shared/Dirty State

**Category:** Tests sharing persistent state through a real database

**What's broken:**

Both tests use the same user account (`user@petadoption.com`) and the same database. Test A adds a pet to favorites. Test B then navigates to the dashboard and expects `toHaveCount(0)` — but if Test A ran first, there is now 1 favorite in the database. Test B passes when run in isolation or before Test A; it fails when Test A has already run.

With `fullyParallel: true` in the Playwright config, test execution order is non-deterministic across runs, making this a true flake rather than a deterministic failure.

**Run with:** `npx playwright test test-isolation --repeat-each=5`

**The fix:**
1. Add a `beforeEach` that uses the `apiContext` fixture to clear favorites before each test: call `GET /favorites` to retrieve the current pet IDs, then `DELETE /favorites/:petId` for each one. This makes each test independent — it owns its preconditions regardless of what ran before.
2. Run with `--workers=1`: `npx playwright test test-isolation --workers=1 --repeat-each=5`. These tests are *conceptually* independent (each owns its setup/teardown), but they share a mutable database resource through the same user account. Running in parallel causes multiple workers to race on that shared resource — `POST /api/favorites/:petId` returns `400` if the pet is already favorited, so a second parallel worker never sees `201` and `waitForResponse` times out.
3. The general principle: `beforeEach` cleanup makes tests *logically* independent; `--workers=1` prevents shared-resource race conditions. An alternative that avoids the workers flag entirely is to create a unique user per test run using the register API so tests never share the same account.

**Instructor note — two additional bugs found when implementing the fix:**

1. **Wrong status code:** The `waitForResponse` for the favorites POST was checking `status() === 200`, but `POST /api/favorites/:petId` returns `201 Created`. The listener never matched, causing a 10-second timeout. Always verify the actual status code against the server route.

2. **`waitForResponse` registered after the click:** The response event listener was set up *after* `await firstFavoriteButton.click()`. On a fast server, the response can fire and be missed before the listener attaches. Always register `waitForResponse` *before* the action that triggers the request.

3. **`apiContext` fixture bug:** The fixture originally called `request.newContext()`, which doesn't exist on Playwright's `APIRequestContext`. The fix is to avoid `newContext` entirely: use the `request` fixture to log in and get a token, then return a thin wrapper object (`{ get, post, delete }`) that injects the `Authorization` header on every call.
