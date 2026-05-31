# Flaky Test Exercises — Instructor Notes

Each exercise lives in `exercise/flake` (broken) with a stable answer in `solutions/flake`.
Run with `--repeat-each=10` (or `--repeat-each=5 --workers=1` for `test-isolation`) to observe the intermittent failures.

> **Read this first — the most important lesson in this suite.**
> The dominant, genuinely *intermittent* flake across these specs is **`waitForResponse`
> registered _after_ the action that triggers the response** (a `goto` or a `click`). The
> response can fire and be missed before the listener attaches, so the wait times out
> (~10s) and the test fails — only sometimes, depending on machine/server speed. This single
> pattern appears in four of the specs (see the table at the bottom). Several of the
> *labeled* causes below (e.g. "read the count before the refetch", "ambiguous selector")
> turn out **not** to flake on this app — the UI settles too fast — so the real teaching
> moment is: **the flake often isn't where the test's name points. Verify the cause by
> running `--repeat-each` and reading the actual failure, don't assume.**

---

## race-condition.spec.js — Racing the UI

**Labeled category:** Missing network wait + non-retrying assertions

**What actually flakes (verified):** The `beforeEach` does `page.goto('/pets')` and *then*
`page.waitForResponse('/api/pets')`. The initial `/api/pets` call often fires during
navigation, before the listener attaches, so the wait times out and the test fails in
setup. Measured ~20–25% failure as written; with the `beforeEach` fixed it is **100%
stable** even with the original in-test reads untouched.

**The in-test "red herring":** Both tests read `pet-count` / breed text immediately after
`selectOption` without awaiting the filtered response. This is poor practice and the
answer fixes it — but on this app the UI re-renders fast enough that this read does **not**
actually flake. Teach it as "good practice we also tightened," not as the cause.

**The fix (answer key):**
1. **`beforeEach`:** replace the `waitForResponse` with a web-first wait —
   `await expect(page.getByTestId('pets-grid')).toBeVisible()`. This is what removes the flake.
2. Still register `const responsePromise = page.waitForResponse(...)` *before* `selectOption`
   and `await` it after — correct ordering, and it makes the data-layer assertions reliable.
3. Use auto-retrying assertions (`not.toHaveText(initialCount)`, `toHaveCount(pets.length)`)
   and the API response body as the source of truth rather than hardcoded names.

---

## element-ambiguity.spec.js — Element Ambiguity

**Labeled category:** Overly broad locators matching multiple elements

**Important framing:** As written, the two locator bugs are **deterministic, not flaky** —
they fail on *every* run, not intermittently:

- **Test 1:** `getByRole('heading', { level: 3 })` matches ~12 `<h3>` pet names; `.textContent()`
  on a multi-match locator is a strict-mode violation every time.
- **Test 2:** `getByRole('button').first()` on the detail page is always the favorite heart
  (first button in DOM), so it never navigates.

The only *intermittent* element on this spec is the same racy `beforeEach`
(`goto` → `waitForResponse`) as race-condition, plus a second response race in Test 2
(`waitForResponse('/api/pets/')` registered after the card click). So this file teaches
**two different bug classes at once**: deterministic locator mistakes *and* a setup flake.

**The fix (answer key):**
1. **`beforeEach`:** `await expect(userPage.getByTestId('pets-grid')).toBeVisible()` (removes the flake).
2. **Test 1:** scope the heading to one card —
   `userPage.locator('[data-testid^="pet-card-"]').first().getByRole('heading')`.
3. **Test 2:** use the explicit testid (`start-application-button`) and, instead of racing the
   detail response, auto-wait for it: `await expect(startButton).toBeVisible()` then click.

---

## spa-navigation.spec.js — SPA Navigation Assumptions

**Labeled category:** Not accounting for async client-side route changes

**What's broken:** The exercise version uses aggressively short overriding timeouts
(`{ timeout: 500 }`, `{ timeout: 300 }`) on SPA route changes and component mounts. In the
*answer*, the residual flake was two `waitForResponse` calls registered **after** the click
that triggers them (`nav-browse-pets` click → `/api/pets`; pet-card click → `/api/pets/:id`),
which race the response and time out (~55% failure before fixing).

**The fix (answer key):**
1. `await page.waitForURL(/dashboard/)` after login (not a short-timeout assertion).
2. Navigate via the nav link to stay in the SPA; after it, `await page.waitForURL(/\/pets/)`
   and `await expect(page.getByTestId('pets-grid')).toBeVisible()` — **no** post-click
   `waitForResponse`.
3. After the pet-card click, `await page.waitForURL(/\/pets\/\d+/)`, then auto-wait for
   `start-application-button` to be visible before clicking it.
4. `await page.waitForURL(/\/apply\//)` and let the default timeout render the form.

---

## test-isolation.spec.js — Shared/Dirty State

**Labeled category:** Tests sharing persistent state through a real database

**What's broken:** Both tests use the same user and the same JSON-file database. Test A adds
a favorite; Test B expects `toHaveCount(0)` on the dashboard. With `fullyParallel: true`,
order is non-deterministic, so Test B fails whenever Test A ran first — a true ordering flake.

**Run with:** `npx playwright test test-isolation --workers=1 --repeat-each=5`

**The fix (answer key):**
1. Add a `beforeEach` that uses the `apiContext` fixture to clear favorites: `GET /favorites`,
   then `DELETE /favorites/:petId` for each. Each test now owns its preconditions.
2. Run with `--workers=1`: the tests are logically independent but share a mutable resource
   through one account. In parallel, `POST /api/favorites/:petId` returns `400` if already
   favorited, so a second worker never sees `201` and `waitForResponse` times out. (An
   alternative that avoids the flag: register a unique user per run so nothing is shared.)

**Two real bugs found while implementing the fix:**
1. **Wrong status code:** the favorites `waitForResponse` checked `status() === 200`, but
   `POST /api/favorites/:petId` returns `201 Created` — the listener never matched and timed
   out. Always verify the status code against the actual route.
2. **`goto` → `waitForResponse` race in Test A:** the "add a pet" test opened `/pets` and
   then waited for `/api/pets`, the same setup race as the other specs. Replaced with
   `await expect(userPage.getByTestId('pets-grid')).toBeVisible()`. (The favorites
   `waitForResponse` is correctly registered *before* the click and was kept.)

---

## animation-timing.spec.js — Animations & Transitions (PLANNED — not yet implemented)

> ⚠️ **This spec does not exist yet.** It is a planned exercise; there is no
> `animation-timing.spec.js` on either flake branch. Left here as a design note so the idea
> isn't lost. Remove this section or implement the spec before relying on it in a session.

**Intended category:** Interacting with elements before they are stable. Candidate seams in
this app: the `v-if="showFilters"` expanded filter panel and the `v-if="showScheduleModal"`
"Schedule Meet & Greet" modal (`PetDetail.vue`), both with `transition` classes. A test that
acts on a child with a short override timeout before the container has finished mounting
would demonstrate the flake; the fix is to `await expect(container).toBeVisible()` before
interacting and drop the short timeouts.

---

## The recurring root cause (cross-cutting)

| Spec | `waitForResponse`-after-action race? | Other issue |
| --- | --- | --- |
| race-condition | ✅ `beforeEach` (the real flake) | non-retrying reads (don't actually flake here) |
| element-ambiguity | ✅ `beforeEach` + Test 2 detail fetch | deterministic locator bugs (not flaky) |
| spa-navigation | ✅ two post-click `waitForResponse` | short override timeouts |
| test-isolation | ✅ Test A `goto`→`waitForResponse` | wrong status code; shared DB state |

**The habit to teach:** register `waitForResponse` (or `expect(...).toBeVisible()` /
`waitForURL`) *before* the action that triggers it, and prefer web-first auto-retrying
assertions over one-shot reads. When in doubt, run `--repeat-each` and read the real failure.
