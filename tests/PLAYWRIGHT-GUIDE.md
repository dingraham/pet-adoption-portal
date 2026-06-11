# Playwright Testing Guide for Pet Adoption Portal

## 🎯 Quick Start for Cypress Users (or New Playwright Users)

Welcome! Since you're familiar with Cypress, this guide focuses on **what's different** in Playwright and how to get productive quickly.

---

## 📦 Installation (Already Done!)

Playwright is already installed and configured. Here's what was set up:

```bash
✅ @playwright/test installed
✅ playwright.config.js created
✅ Test folder structure created
✅ Custom fixtures created
✅ Test utilities created
✅ npm scripts added
```

---

## 🚀 Running Tests

### Available Commands

| Command                | What It Does                             | When to Use                     |
| ---------------------- | ---------------------------------------- | ------------------------------- |
| `npm test`             | Runs all tests headlessly in Chromium    | CI/CD, quick validation         |
| `npm run test:ui`      | Opens Playwright UI mode                 | **RECOMMENDED for development** |
| `npm run test:headed`  | Runs tests with browser visible          | Watch tests execute             |
| `npm run test:debug`   | Opens Playwright Inspector for debugging | Troubleshooting failures        |
| `npm run test:report`  | Opens HTML report of last test run       | View detailed results           |
| `npm run test:codegen` | Record actions to generate test code     | **Great for beginners!**        |

### Your First Test Run

1. **Make sure the app is NOT running** (Playwright will start it for you)

2. **Open UI Mode** (Best way to start):

   ```bash
   npm run test:ui
   ```

   This opens a nice GUI where you can:
   - See all your tests
   - Run tests individually or in groups
   - Watch tests execute step-by-step
   - See screenshots and traces
   - Debug interactively

3. **Run tests headlessly**:
   ```bash
   npm test
   ```

---

## 🗂️ Project Structure

```
pet-adoption-portal/
├── tests/
│   ├── e2e/                    # End-to-end test files
│   │   └── example.spec.js     # Example tests (for learning)
│   ├── fixtures/               # Custom test contexts (like Cypress commands)
│   │   └── auth.fixture.js     # Authenticated user fixtures
│   └── utils/                  # Helper functions
│       └── test-helpers.js     # Common utilities
├── playwright.config.js        # Playwright configuration
└── playwright-report/          # Generated HTML reports (git-ignored)
```

---

## 🔑 Key Concepts

### 1. **Async/Await** (Biggest Difference!)

**Cypress:**

```javascript
cy.get('[data-testid="login-email"]').type('user@example.com');
cy.get('[data-testid="login-submit"]').click();
cy.url().should('include', '/dashboard');
```

**Playwright:**

```javascript
await page.getByTestId('login-email').fill('user@example.com');
await page.getByTestId('login-submit').click();
await expect(page).toHaveURL(/dashboard/);
```

⚠️ **Don't forget `await`!** This is the #1 mistake when switching from Cypress.

---

### 2. **Locators > Selectors**

Playwright uses **locators** which are lazy references to elements.

**Recommended Locator Priority:**

```javascript
// 1. BEST: By test ID
page.getByTestId('login-email');

// 2. GREAT: By role (accessibility-friendly)
page.getByRole('button', { name: 'Login' });

// 3. GOOD: By label (for form inputs)
page.getByLabel('Email');

// 4. OK: By text
page.getByText('Submit Application');

// 5. LAST RESORT: By CSS selector
page.locator('.some-specific-class');
```

---

### 3. **Auto-Waiting**

Playwright automatically waits for:

- Elements to be visible
- Elements to be enabled
- Elements to stop animating
- Network requests to complete

```javascript
// This waits automatically until the button is clickable!
await page.getByTestId('submit-button').click();
```

---

### 4. **Fixtures for Reusable Setup**

**Cypress Custom Command:**

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="login-email"]').type(email);
  cy.get('[data-testid="login-password"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
});

// In test:
it('test', () => {
  cy.login('user@example.com', 'password');
});
```

**Playwright Fixture:**

```javascript
// tests/fixtures/auth.fixture.js (already created!)
import { test } from './fixtures/auth.fixture.js';

test('can access dashboard', async ({ userPage }) => {
  // Already logged in! No setup needed
  await userPage.goto('/dashboard');
});
```

---

### 5. **Multiple Browsers Built-In**

Playwright tests run on Chromium, Firefox, and WebKit by default (configured in `playwright.config.js`).

```javascript
// To run on all browsers:
npm test

// To run on specific browser:
npx playwright test --project=firefox
```

---

## 📝 Writing Your First Test

### Step 1: Create a New Test File

Create `tests/e2e/login.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should allow user to login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in credentials
    await page.getByTestId('login-email').fill('user@petadoption.com');
    await page.getByTestId('login-password').fill('user123');

    // Click login button
    await page.getByTestId('login-submit').click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### Step 2: Run Your Test

```bash
npm run test:ui
```

Click on your test in the UI to run it and watch it execute!

---

## 🛠️ Code Generation

Playwright can **record your actions** and generate test code!

### How to Use Code Generator:

1. **Start the code generator:**

   ```bash
   npm run test:codegen
   ```

2. **Interact with your app:**
   - Click buttons
   - Fill forms
   - Navigate pages
   - Playwright writes the code for you!

3. **Copy the generated code** into your test file

4. **Refine and organize** the generated code

This is AMAZING for:

- Learning Playwright syntax
- Quickly prototyping tests
- Finding the right locators

---

## 🎯 Common Patterns

### Pattern 1: Login Flow

```javascript
test('complete login flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('user@petadoption.com');
  await page.getByTestId('login-password').fill('user123');
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/dashboard/);
});
```

### Pattern 2: Form Validation

```javascript
test('shows error for invalid email', async ({ page }) => {
  await page.goto('/register');
  await page.getByTestId('register-email').fill('invalid-email');
  await page.getByTestId('register-password').fill('password123');
  await page.getByTestId('register-submit').click();

  // Check for error message
  await expect(page.getByTestId('register-error')).toBeVisible();
  await expect(page.getByTestId('register-error')).toContainText('Invalid email');
});
```

### Pattern 3: Using User Fixture

```javascript
import { test } from '../fixtures/auth.fixture.js';

test('favorite a pet', async ({ userPage }) => {
  // Already logged in!
  await userPage.goto('/pets');
  await userPage.getByTestId('pet-card-1').hover();
  await userPage.getByTestId('toggle-favorite-button').first().click();

  // Verify favorite was added
  await userPage.goto('/dashboard');
  await expect(userPage.getByText('Favorites')).toBeVisible();
});
```

### Pattern 4: API Testing

```javascript
test('can fetch pets via API', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/pets');

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.pets).toHaveLength(10);
});
```

---

## 🐛 Debugging

### Method 1: Playwright Inspector (Best!)

```javascript
test('debug this test', async ({ page }) => {
  await page.goto('/login');
  await page.pause(); // ← Opens Playwright Inspector
  // Test pauses here - you can step through
});
```

Run with:

```bash
npm run test:debug
```

### Method 2: UI Mode

```bash
npm run test:ui
```

Click the "eye" icon next to any test to watch it execute step-by-step.

### Method 3: Screenshots

```javascript
test('take screenshot on failure', async ({ page }) => {
  await page.goto('/pets');
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
});
```

Playwright automatically takes screenshots on failure!

### Method 4: Console Logs

```javascript
test('check element text', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('h1').textContent();
  console.log('Heading text:', text);
});
```

### Method 5: Trace Viewer — replay a failure (and diff flaky runs)

A **trace** is a full recording of a run: DOM snapshots, every action, network, and console.
Open the trace from a failed run and scrub the action timeline to see exactly where it diverged:

```bash
npx playwright show-trace test-results/<folder>/trace.zip
```

**For flaky tests, compare a passing run against a failing one.** This project's config uses
`trace: 'retain-on-failure-and-retries'`, which keeps a trace for _every_ attempt. Run a flaky
spec with retries so you capture both, then open the failing attempt next to the passing retry —
the difference in timing/order is usually the flake:

```bash
npx playwright test tests/e2e/flake/race-condition.spec.js --retries=2 --repeat-each=5
```

### Playwright 1.60 — debugging niceties

This project is on **Playwright 1.60**. Recent additions worth knowing:

- `trace: 'retain-on-failure-and-retries'` — per-attempt traces for the flaky-run comparison above (configured here).
- Trace Viewer / UI Mode: pretty-print toggle for JSON request/response bodies, and improved action filtering.

> Playwright is also adding AI/agent-oriented debugging tooling. The exact commands move fast —
> check the [official release notes](https://playwright.dev/docs/release-notes) for the current
> names before relying on them, rather than trusting a tutorial (or an AI) from memory.

---

## 🧭 The Debugging Mindset (and where AI fits)

Tools surface symptoms. **You** find causes. The point of this workshop is the thought process —
not a tool (or an AI) that hands you an answer. Use this loop on every failure:

1. **Read the actual failure.** The error and the line it points to are step one. "Timed out
   waiting for X" is a different bug from "expected 'cat', got 'dog'." Don't skim it.
2. **Form a hypothesis you can state in one sentence.** "The `/api/pets` response fired before
   `waitForResponse` attached." A hypothesis you can test beats a fix you're guessing at.
3. **Work backwards from the pipeline.** Failing assertion → which locator/value → which app
   behavior → which line of code or piece of data. Let the trace (Method 5) walk you back.
4. **Confirm the cause before fixing.** Reproduce it on demand. For flakes, run `--repeat-each`
   and watch the rate — if you can't make it fail when you want, you don't understand it yet.
5. **Fix the cause, not the symptom — then prove it.** Re-run enough times to show it's gone.

### Where AI helps — and where it doesn't

AI assistants (and Playwright's own agent tooling) are great accelerators **once you have a
hypothesis**: explaining an unfamiliar error, suggesting a web-first assertion, drafting a
locator. They are poor **substitutes for the hypothesis itself** — ask "fix my flaky test" and
you'll often get a plausible change that hides the symptom (a longer timeout, a retry) without
removing the cause. Worse, a green run then _feels_ like success.

A rule for this workshop:

> **Diagnose first, then delegate.** Be able to explain, in one sentence, _why_ a test fails and
> _why_ your fix works — before you let an AI write the fix. If you can't explain it, you're not
> done debugging, no matter how green the run looks.

When you do use AI: hand it the trace/error **and your hypothesis**, ask it to _confirm or refute_
that hypothesis, and check the fix against the cause you identified. Treat it as a sharp junior
pair, not an oracle.

---

## 📊 Viewing Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

The report shows:

- Which tests passed/failed
- Screenshots of failures
- Traces (timeline of what happened)
- Network requests
- Console logs

---

## ✅ Best Practices

### 1. **Use data-testid for selectors**

```javascript
// ✅ Good
await page.getByTestId('login-submit');

// ❌ Avoid
await page.locator('.btn.btn-primary.submit-button');
```

### 2. **Use descriptive test names**

```javascript
// ✅ Good
test('should show error when email format is invalid', ...)

// ❌ Bad
test('test1', ...)
```

### 3. **Keep tests independent**

```javascript
// Each test should work in isolation
test.beforeEach(async ({ page }) => {
  // Reset state before each test
  await page.goto('/');
});
```

### 4. **Use fixtures for auth**

```javascript
// ✅ Good - use fixture
import { test } from '../fixtures/auth.fixture.js';
test('test', async ({ userPage }) => { ... });

// ❌ Bad - manual login in every test
test('test', async ({ page }) => {
  await page.goto('/login');
  await page.fill('...'); // Repeated code
});
```

### 5. **Leverage auto-waiting**

```javascript
// ✅ Good - auto-waits
await page.getByTestId('submit').click();

// ❌ Bad - manual wait
await page.waitForTimeout(2000);
await page.getByTestId('submit').click();
```

---

## 🎓 Learning Path

### Week 1: Basics

1. Read `tests/e2e/example.spec.js` (comprehensive examples)
2. Use `npm run test:codegen` to generate a simple test
3. Write a login test
4. Write a registration test

### Week 2: Intermediate

1. Use authenticated fixtures
2. Test form validation
3. Test multi-step workflows
4. Add assertions for API responses

### Week 3: Advanced

1. Test admin workflows
2. Add API testing
3. Test edge cases and error handling
4. Implement Page Object Model (optional)

---

## 📚 Resources

### Official Docs

- [Playwright Docs](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Cheat Sheet

- [Locators Cheat Sheet](https://playwright.dev/docs/locators)
- [Assertions Cheat Sheet](https://playwright.dev/docs/test-assertions)

### VS Code Extension

Install "Playwright Test for VSCode" for:

- IntelliSense
- Run tests from editor
- Debug tests
- Pick locators

---

## 🔥 Quick Reference: Cypress → Playwright

| Task           | Cypress                                    | Playwright                                  |
| -------------- | ------------------------------------------ | ------------------------------------------- |
| Visit page     | `cy.visit('/login')`                       | `await page.goto('/login')`                 |
| Find element   | `cy.get('[data-testid="btn"]')`            | `page.getByTestId('btn')`                   |
| Type text      | `.type('hello')`                           | `await .fill('hello')`                      |
| Click          | `.click()`                                 | `await .click()`                            |
| Assert visible | `.should('be.visible')`                    | `await expect(...).toBeVisible()`           |
| Assert text    | `.should('contain', 'text')`               | `await expect(...).toContainText('text')`   |
| Wait for URL   | `cy.url().should('include', '/dashboard')` | `await expect(page).toHaveURL(/dashboard/)` |
| Custom command | `Cypress.Commands.add(...)`                | Fixture in `tests/fixtures/`                |
| Intercept API  | `cy.intercept('/api/pets')`                | `await page.route('**/api/pets', ...)`      |

---

## 🎉 You're Ready!

Start by opening the UI mode and exploring:

```bash
npm run test:ui
```

Then read through `tests/e2e/example.spec.js` for comprehensive examples.

Happy testing! 🧪
