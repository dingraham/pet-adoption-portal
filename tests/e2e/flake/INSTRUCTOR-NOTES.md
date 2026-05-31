# Flaky Test Exercises — Instructor Notes

Each exercise lives in `exercise/flake` (broken) with a stable answer in `solutions/flake`.
Run with `--repeat-each=10` (or `--repeat-each=5 --workers=1` for `test-isolation`) to observe the intermittent failures.

> **Read this first — two mechanisms drive the flakes here.**
>
> 1. **Simulated backend latency.** The flake branches run the server with `SIMULATE_LATENCY=300`
>    (wired into `playwright.config.js`'s `webServer`; the hook itself lives in
>    `server/routes/pets.js` and is dormant everywhere else). `GET /api/pets` then takes a random
>    0–300 ms, so a test that reads or acts on filtered data **without waiting for the response**
>    genuinely races it. This is what makes `race-condition` flake for its *labeled* reason — the
>    local app is otherwise too fast to race. **The answers must stay green under this latency**,
>    and they do, because they wait properly.
> 2. **`waitForResponse` registered _after_ the action** (a `goto` or a `click`). The response can
>    fire and be missed before the listener attaches, so the wait times out (~10s) and the test
>    fails — only sometimes. This appears across the specs (see the table at the bottom).
>
> Teaching moment: **verify the cause by running `--repeat-each` and reading the actual failure —
> the flake isn't always where the test's name points.** And note `element-ambiguity`'s two bugs
> are *deterministic*, not flaky (see its section).

---

## race-condition.spec.js — Racing the UI

**Labeled category:** Missing network wait + non-retrying assertions

**What flakes (verified under `SIMULATE_LATENCY=300`):** Both tests read filtered results
immediately after `selectOption` without awaiting the refetch. Because the backend now returns
in a random 0–300 ms, the read genuinely races the response — "show fewer results" fails ~90% of
runs, "show only cats" ~20% (different sensitivities). **This is the labeled lesson, and it is now
real.** (Without the latency the local app re-renders too fast for this read to flake — which is
exactly why the latency was added.)

**Secondary issue:** the `beforeEach` also does `goto` → `waitForResponse`, the listener race
shared with the other specs. The answer fixes both.

**The fix (answer key) — verified 100% stable under the same latency:**
1. Register `const responsePromise = page.waitForResponse(...)` *before* `selectOption`, then
   `await` it — so you read the filtered data, not the stale render.
2. Use auto-retrying assertions (`not.toHaveText(initialCount)`, `toHaveCount(pets.length)`) and
   the API response body as the source of truth rather than hardcoded names.
3. Replace the `beforeEach` `waitForResponse` with `await expect(page.getByTestId('pets-grid')).toBeVisible()`.

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

## animation-timing.spec.js — Animations & Transitions (investigated — not viable here)

> ⚠️ **Not implemented, and not viable in this app as-is.** Investigated thoroughly: the
> schedule modal and filter panel are plain `v-if` toggles with **no** Vue `<transition>` or CSS
> mount animation, and the modal's slot data is pre-fetched — so there is no real "mid-animation"
> window to race, and Playwright's auto-waiting absorbs what little exists (measured ~0% flake
> across several attempts). A genuine animation-timing flake would require first adding an actual
> CSS transition to the app. The broader "timing flake" need is instead met by the
> `SIMULATE_LATENCY` backend latency (see `race-condition`), which is reliable and
> machine-independent. Network-mock and date/locale flakes were likewise found to collapse to
> 0%/100% here — this app is simply too deterministic for them without app changes.

---

## The recurring root cause (cross-cutting)

| Spec | `waitForResponse`-after-action race? | Other issue |
| --- | --- | --- |
| race-condition | ✅ `beforeEach` | non-retrying reads (now flake for real under `SIMULATE_LATENCY`) |
| element-ambiguity | ✅ `beforeEach` + Test 2 detail fetch | deterministic locator bugs (not flaky) |
| spa-navigation | ✅ two post-click `waitForResponse` | short override timeouts |
| test-isolation | ✅ Test A `goto`→`waitForResponse` | wrong status code; shared DB state |

**The habit to teach:** register `waitForResponse` (or `expect(...).toBeVisible()` /
`waitForURL`) *before* the action that triggers it, and prefer web-first auto-retrying
assertions over one-shot reads. When in doubt, run `--repeat-each` and read the real failure.
