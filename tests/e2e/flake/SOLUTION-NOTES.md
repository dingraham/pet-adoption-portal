# Flaky Test Exercises — Solution Notes

> **For students:** try to diagnose and fix each spec _before_ reading its section here. The
> file names are deliberately feature-based (not "race-condition.spec.js") so you can't read the
> answer off the filename — run the test, read the real failure, form a theory, then check your
> work against the answer key below.

Each exercise lives on the `exercise/flake` branch (always broken). The fixed answers live on
`solutions/flake` (the latest broken state with fixes applied on top).
Run with `--repeat-each=10` (or `--repeat-each=5 --workers=1` for `favorites`) to observe the
intermittent failures.

**Spec → flake category (decoder).** Don't peek until you've diagnosed:

| File                    | Flake category                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `pet-filtering.spec.js` | Race condition — reads results before the refetch lands                                                 |
| `pet-browsing.spec.js`  | Element ambiguity — over-broad / wrong-element locators (deterministic)                                 |
| `adoption-flow.spec.js` | SPA navigation — short hardcoded timeouts racing backend latency                                        |
| `favorites.spec.js`     | Test isolation — shared/dirty DB state                                                                  |
| `appointments.spec.js`  | Timezone / locale — asserting a hardcoded locale- _and_ timezone-formatted date ("works on my machine") |

> **Read this first — two mechanisms drive the flakes here.**
>
> 1. **Simulated backend latency.** The flake branches run the server with `SIMULATE_LATENCY=450`
>    (wired into `playwright.config.js`'s `webServer`; the hook itself lives in
>    `server/routes/pets.js` and is dormant everywhere else). `GET /api/pets` then takes a random
>    0–450 ms, so a test that reads or acts on the data **without waiting for it** — or that uses a
>    short hardcoded timeout — genuinely races it. This is what makes `pet-filtering` and
>    `adoption-flow` flake for real; the local app is otherwise too fast to race. **The answers
>    stay green under this latency** because they wait on conditions, not the clock.
> 2. **`waitForResponse` registered _after_ the action** (a `goto` or a `click`). The response can
>    fire and be missed before the listener attaches, so the wait times out (~10s) and the test
>    fails — only sometimes. This appears across the specs (see the table at the bottom).
>
> Key habit: **verify the cause by running `--repeat-each` and reading the actual failure —
> the flake isn't always where the test's name points.** And note `pet-browsing`'s two bugs
> are _deterministic_, not flaky (see its section).

---

## pet-filtering.spec.js — Racing the UI

**Labeled category:** Missing network wait + non-retrying assertions

**What flakes (under `SIMULATE_LATENCY=450`):** Both tests read filtered results
immediately after `selectOption` without awaiting the refetch. Because the backend returns
in a random 0–450 ms, the read genuinely races the response — "show fewer results" fails most
runs, "show only cats" intermittently (different sensitivities; higher latency → more frequent
failures). **This is the labeled lesson, and it is real.** (Without the latency the local app
re-renders too fast for this read to flake — which is exactly why the latency was added.)

**Secondary issue:** the `beforeEach` also does `goto` → `waitForResponse`, the listener race
shared with the other specs. The answer fixes both.

**The fix (answer key) — verified 100% stable under the same latency:**

1. Register `const responsePromise = page.waitForResponse(...)` _before_ `selectOption`, then
   `await` it — so you read the filtered data, not the stale render.
2. Use auto-retrying assertions (`not.toHaveText(initialCount)`, `toHaveCount(pets.length)`) and
   the API response body as the source of truth rather than hardcoded names.
3. Replace the `beforeEach` `waitForResponse` with `await expect(page.getByTestId('pets-grid')).toBeVisible()`.

---

## pet-browsing.spec.js — Element Ambiguity

**Labeled category:** Overly broad locators matching multiple elements

**Important framing:** As written, the two locator bugs are **deterministic, not flaky** —
they fail on _every_ run, not intermittently:

- **Test 1:** `locator('[data-testid^="pet-name-"]')` matches every pet-name cell (~12);
  `.textContent()` on a multi-match locator is a strict-mode violation every time. Note the lesson:
  even a `getByTestId`-style selector is ambiguous when the prefix isn't unique — you still need
  `.first()` or to scope it to one card.
- **Test 2:** `getByRole('button').first()` on the detail page is always the favorite heart
  (first button in DOM), so it never navigates.

The only _intermittent_ element on this spec is the same racy `beforeEach`
(`goto` → `waitForResponse`) as pet-filtering, plus a second response race in Test 2
(`waitForResponse('/api/pets/')` registered after the card click). So this file teaches
**two different bug classes at once**: deterministic locator mistakes _and_ a setup flake.

**The fix (answer key):**

1. **`beforeEach`:** `await expect(userPage.getByTestId('pets-grid')).toBeVisible()` (removes the flake).
2. **Test 1:** scope the name to one card —
   `userPage.locator('[data-testid^="pet-card-"]').first().locator('[data-testid^="pet-name-"]')`.
3. **Test 2:** use the explicit testid (`start-application-button`) and, instead of racing the
   detail response, auto-wait for it: `await expect(startButton).toBeVisible()` then click.

---

## adoption-flow.spec.js — SPA Navigation Assumptions

**Labeled category:** Not accounting for async client-side route changes

**What's broken:** The exercise version uses aggressively short overriding timeouts on SPA
route changes and component mounts:

```js
await expect(page).toHaveURL(/dashboard/, { timeout: 500 });
await page.locator('[data-testid^="pet-card-"]').first().click({ timeout: 300 });
await page.getByTestId('start-application-button').click({ timeout: 300 });
await expect(page.getByText('Step 1 of 5')).toBeVisible({ timeout: 300 });
```

Under `SIMULATE_LATENCY=450` (the pets request takes a random 0–450 ms), those fixed deadlines
lose the race intermittently — the pet-card click times out at 300 ms while the list is still
loading. Failure rate is roughly **40–60%** across `--repeat-each=10`, which is the ideal
"is it broken or not?" demonstration.

**The fix (answer key) — verified 10/10 green under `SIMULATE_LATENCY=450`:**

The principle: **wait on conditions (URL settled, element visible), never on a fixed clock.**

1. `await page.waitForURL(/dashboard/)` after login — wait for the route, not a 500 ms deadline.
2. Navigate via the in-app nav link to stay in the SPA, then wait for the list to actually
   render: `await page.waitForURL(/\/pets/)` and
   `await expect(page.getByTestId('pets-grid')).toBeVisible()`.
3. Click the card with **no** timeout override, then `await page.waitForURL(/\/pets\/\d+/)` for
   the detail route.
4. Auto-wait for `start-application-button` to be visible (`await expect(startButton).toBeVisible()`)
   before clicking, then `await page.waitForURL(/\/apply\//)` and let the default timeout render
   the form.

The latency is _kept_ — the fix is robust to it instead of racing it.

---

## favorites.spec.js — Shared/Dirty State

**Labeled category:** Tests sharing persistent state through a real database

**What's broken:** Both tests use the same user and the same JSON-file database. Test A adds
a favorite; Test B expects `toHaveCount(0)` on the dashboard. With `fullyParallel: true`,
order is non-deterministic, so Test B fails whenever Test A ran first — a true ordering flake.

**Run with:** `npx playwright test favorites --workers=1 --repeat-each=5`

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
   `waitForResponse` is correctly registered _before_ the click and was kept.)

---

## appointments.spec.js — Timezone / locale (Environment)

**Labeled category:** Asserting a locale/timezone-dependent value — "works on my machine"

**What's broken:** The dashboard renders an appointment date with
`new Date(apt.date).toLocaleDateString()` ([`Dashboard.vue:252`](../../../client/src/views/Dashboard.vue#L252)).
The broken test hardcodes the rendered string and pins a mismatched locale:

```js
test.use({ locale: 'nb-NO' }); // Norwegian → renders 15.1.2024 (dots)
// ...
await expect(userPage.getByText('1/15/2024')).toBeVisible(); // but asserts US format
```

There are **two** environment dependencies baked into that one assertion:

- **Locale** controls the _format_. `en-US` → `1/15/2024`, Norwegian `nb-NO` → `15.1.2024`,
  Irish `en-IE` → `15/1/2024`. The exercise pins `nb-NO` but asserts the US string, so it fails
  on format alone.
- **Timezone** controls the _day_. The date is stored as the plain string `'2024-01-15'`, which
  `new Date()` parses as **UTC midnight** — so west of UTC (the Americas) it renders the
  _previous day_. Under `TZ=Pacific/Honolulu` + `nb-NO` the UI shows `14.1.2024` — wrong format
  **and** wrong day.

This one is _not_ intermittent per run — it's environment-dependent (the classic "works on my
machine"). Different machine locale or timezone → different result.

> ⚠️ **The off-by-one only happens west of UTC.** A run in a zone at or ahead of UTC (UTC, or
> e.g. Norway at UTC+1/+2) doesn't shift the day — so to _show the timezone half of the bug_ you
> must drive it with an explicit `TZ`. `TZ=...` controls the browser timezone regardless of where
> you're physically located.

**Demonstrate the broken version:**

- `TZ=Pacific/Honolulu npx playwright test appointments` → fails (renders `14.1.2024`)
- even `TZ=UTC` fails here because the pinned `nb-NO` locale already breaks the hardcoded US format

**The fix (answer key) — verified green under any locale + timezone:**

Don't hardcode the formatted string, and don't pin the locale. **Derive the expected text the
exact same way the app does, in the same browser context** — so the test's expectation always
matches whatever the app renders, on any machine:

```js
const APPOINTMENT_DATE = '2024-01-15';
// ...
const expectedDate = await userPage.evaluate(
  (date) => new Date(date).toLocaleDateString(), // identical to Dashboard.vue
  APPOINTMENT_DATE
);
await expect(userPage.getByText(expectedDate)).toBeVisible();
```

Why `userPage.evaluate` and not computing in Node: the value must be produced in the **browser**
context, which owns the locale and timezone that the UI renders with. Computing in the Node test
process can pick up a different locale/timezone and reintroduce the mismatch.

> **Teaching point:** this fix _matches_ the app's rendering rather than asserting an absolute
> value — so it stays green even if the underlying UTC-midnight rendering is itself arguably a
> bug. If you also want to assert the date is _correct_ (not just consistent), that's an
> app-level fix: store/parse the date as local (`new Date('2024-01-15T00:00:00')`) or assert a
> stable non-date field like the time (`10:00 AM`). Alternative test-only approach: pin the
> suite timezone with `use: { timezoneId: 'UTC' }`. **Never hardcode a localized date and hope.**

---

## animation-timing.spec.js — Animations & Transitions (investigated — not viable here)

> ⚠️ **Not implemented, and not viable in this app as-is.** Investigated thoroughly: the
> schedule modal and filter panel are plain `v-if` toggles with **no** Vue `<transition>` or CSS
> mount animation, and the modal's slot data is pre-fetched — so there is no real "mid-animation"
> window to race, and Playwright's auto-waiting absorbs what little exists (measured ~0% flake
> across several attempts). A genuine animation-timing flake would require first adding an actual
> CSS transition to the app. The broader "timing flake" need is instead met by the
> `SIMULATE_LATENCY` backend latency (see `pet-filtering`), which is reliable and
> machine-independent. Network-mock and date/locale flakes were likewise found to collapse to
> 0%/100% here — this app is simply too deterministic for them without app changes.

---

## The recurring root cause (cross-cutting)

| Spec          | `waitForResponse`-after-action race?  | Other issue                                                      |
| ------------- | ------------------------------------- | ---------------------------------------------------------------- |
| pet-filtering | ✅ `beforeEach`                       | non-retrying reads (now flake for real under `SIMULATE_LATENCY`) |
| pet-browsing  | ✅ `beforeEach` + Test 2 detail fetch | deterministic locator bugs (not flaky)                           |
| adoption-flow | — (fixed with `waitForURL`)           | short override timeouts racing `SIMULATE_LATENCY`                |
| favorites     | ✅ Test A `goto`→`waitForResponse`    | wrong status code; shared DB state                               |

**The habit to teach:** register `waitForResponse` (or `expect(...).toBeVisible()` /
`waitForURL`) _before_ the action that triggers it, and prefer web-first auto-retrying
assertions over one-shot reads. When in doubt, run `--repeat-each` and read the real failure.
