# Playwright Cheat Sheet for Pet Adoption Portal

## 🚀 Running Tests

```bash
npm test              # Run all tests headlessly
npm run test:ui       # UI Mode (BEST for development)
npm run test:headed   # Watch tests run in browser
npm run test:debug    # Debug mode with Inspector
npm run test:report   # View last test report
npm run test:codegen  # Generate test code by recording
```

---

## 📍 Locators (Finding Elements)

```javascript
// By test ID (RECOMMENDED!)
page.getByTestId('login-email')
page.getByTestId('submit-application-button')

// By role (accessibility-friendly)
page.getByRole('button', { name: 'Login' })
page.getByRole('link', { name: 'Register here' })
page.getByRole('checkbox', { name: 'Agree to terms' })

// By label (great for forms)
page.getByLabel('Email')
page.getByLabel('Password')

// By text
page.getByText('Submit Application')
page.getByText(/login/i) // Case insensitive

// By placeholder
page.getByPlaceholder('you@example.com')

// CSS selector (last resort)
page.locator('.btn-primary')
page.locator('#submit-btn')
```

---

## 🎯 Actions

```javascript
// Fill input
await page.getByTestId('login-email').fill('user@example.com')

// Clear input
await page.getByTestId('search-input').clear()

// Click
await page.getByTestId('login-submit').click()

// Double click
await element.dblclick()

// Right click
await element.click({ button: 'right' })

// Hover
await element.hover()

// Check checkbox
await page.getByRole('checkbox').check()

// Uncheck checkbox
await page.getByRole('checkbox').uncheck()

// Select dropdown option
await page.getByTestId('filter-species').selectOption('dog')
await page.getByTestId('filter-size').selectOption({ label: 'Large' })

// Upload file
await page.getByTestId('file-input').setInputFiles('path/to/file.pdf')

// Press key
await page.getByTestId('search-input').press('Enter')
await page.keyboard.press('Escape')
```

---

## ✅ Assertions

```javascript
// Visibility
await expect(page.getByTestId('login-form')).toBeVisible()
await expect(page.getByTestId('error-banner')).toBeHidden()

// Text content
await expect(page.locator('h1')).toContainText('Pet Adoption')
await expect(page.locator('h1')).toHaveText('Exact Text')

// Count
await expect(page.locator('[data-testid^="pet-card-"]')).toHaveCount(10)

// URL
await expect(page).toHaveURL(/dashboard/)
await expect(page).toHaveURL('http://localhost:5173/dashboard')

// Title
await expect(page).toHaveTitle(/Pet Adoption/)

// Attribute
await expect(page.getByTestId('email')).toHaveAttribute('type', 'email')

// Value (for inputs)
await expect(page.getByTestId('email')).toHaveValue('user@example.com')

// Disabled/Enabled
await expect(page.getByTestId('submit')).toBeDisabled()
await expect(page.getByTestId('submit')).toBeEnabled()

// Checked
await expect(page.getByRole('checkbox')).toBeChecked()

// Class
await expect(element).toHaveClass(/active/)

// CSS property
await expect(element).toHaveCSS('color', 'rgb(255, 0, 0)')
```

---

## 🔄 Navigation & Waiting

```javascript
// Navigate
await page.goto('/')
await page.goto('/login')

// Go back/forward
await page.goBack()
await page.goForward()

// Reload
await page.reload()

// Wait for URL
await page.waitForURL('/dashboard')
await page.waitForURL(/pets/)

// Wait for selector (rarely needed due to auto-wait)
await page.waitForSelector('[data-testid="pet-card-1"]')

// Wait for load state
await page.waitForLoadState('networkidle')
await page.waitForLoadState('domcontentloaded')

// Wait for timeout (AVOID - use auto-wait instead!)
await page.waitForTimeout(1000) // Only for debugging
```

---

## 🌐 Network

```javascript
// Wait for API response
const responsePromise = page.waitForResponse(
  response => response.url().includes('/api/pets') && response.status() === 200
)
await page.getByTestId('filter-species').selectOption('dog')
const response = await responsePromise

// Mock API response
await page.route('**/api/pets*', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ pets: [] })
  })
})

// Modify API response
await page.route('**/api/pets*', async (route) => {
  const response = await route.fetch()
  const body = await response.json()
  body.pets = body.pets.slice(0, 3)
  await route.fulfill({ response, json: body })
})

// Abort requests (block images, fonts, etc.)
await page.route('**/*.{png,jpg,jpeg}', route => route.abort())
```

---

## 🔍 Getting Information

```javascript
// Get text content
const text = await page.locator('h1').textContent()

// Get inner text (visible text only)
const innerText = await page.locator('h1').innerText()

// Get attribute
const href = await page.locator('a').getAttribute('href')

// Get input value
const value = await page.getByTestId('email').inputValue()

// Count elements
const count = await page.locator('.pet-card').count()

// Check if element exists (without waiting)
const exists = await page.locator('.optional-element').count() > 0

// Get all elements
const elements = await page.locator('.pet-card').all()
for (const element of elements) {
  const text = await element.textContent()
  console.log(text)
}

// Get nth element
const firstCard = page.locator('.pet-card').nth(0)
const secondCard = page.locator('.pet-card').nth(1)
const lastCard = page.locator('.pet-card').last()
```

---

## 🐛 Debugging

```javascript
// Pause test (opens Inspector)
await page.pause()

// Take screenshot
await page.screenshot({ path: 'screenshot.png' })
await page.screenshot({ path: 'screenshot.png', fullPage: true })

// Screenshot of specific element
await page.getByTestId('error-banner').screenshot({ path: 'error.png' })

// Console log
console.log(await page.locator('h1').textContent())

// Get page HTML
const html = await page.content()
console.log(html)

// Print page title
console.log(await page.title())
```

---

## 📦 Using Fixtures

```javascript
// Import custom fixture
import { test, expect } from '../fixtures/auth.fixture.js'

// Use authenticated page
test('test with logged in user', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard')
  await expect(authenticatedPage).toHaveURL(/dashboard/)
})

// Use admin page
test('test with admin user', async ({ adminPage }) => {
  await adminPage.goto('/admin')
  await expect(adminPage).toHaveURL(/admin/)
})

// Use API context
test('test with API', async ({ apiContext }) => {
  const response = await apiContext.get('/favorites')
  expect(response.ok()).toBeTruthy()
})
```

---

## 🎨 Test Structure

```javascript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {

  test.beforeEach(async ({ page }) => {
    // Runs before each test
    await page.goto('/')
  })

  test.afterEach(async ({ page }) => {
    // Runs after each test
  })

  test.beforeAll(async () => {
    // Runs once before all tests
  })

  test.afterAll(async () => {
    // Runs once after all tests
  })

  test('should do something', async ({ page }) => {
    // Test code here
  })

  test.skip('skip this test', async ({ page }) => {
    // Skipped
  })

  test.only('only run this test', async ({ page }) => {
    // Only this runs (remove before commit!)
  })

})
```

---

## 🎯 Common Patterns for Pet Adoption Portal

### Login as User
```javascript
await page.goto('/login')
await page.getByTestId('login-email').fill('user@petadoption.com')
await page.getByTestId('login-password').fill('user123')
await page.getByTestId('login-submit').click()
await expect(page).toHaveURL(/dashboard/)
```

### Login as Admin
```javascript
await page.goto('/login')
await page.getByTestId('login-email').fill('admin@petadoption.com')
await page.getByTestId('login-password').fill('admin123')
await page.getByTestId('login-submit').click()
await expect(page).toHaveURL(/dashboard/)
```

### Search for Pets
```javascript
await page.goto('/pets')
await page.getByTestId('search-input').fill('Luna')
await expect(page.locator('[data-testid^="pet-card-"]')).toHaveCount(1)
```

### Filter Pets
```javascript
await page.goto('/pets')
await page.getByTestId('filter-species').selectOption('dog')
await page.getByTestId('filter-size').selectOption('large')
```

### Favorite a Pet
```javascript
await page.goto('/pets')
await page.locator('[data-testid="pet-card-1"]').hover()
await page.getByTestId('toggle-favorite-button').first().click()
```

### Fill Registration Form
```javascript
await page.goto('/register')
await page.getByTestId('register-firstName').fill('John')
await page.getByTestId('register-lastName').fill('Doe')
await page.getByTestId('register-email').fill('john@example.com')
await page.getByTestId('register-phone').fill('555-1234')
await page.getByTestId('register-password').fill('password123')
await page.getByTestId('register-confirmPassword').fill('password123')
await page.getByTestId('register-submit').click()
```

### Check for Error Message
```javascript
await expect(page.getByTestId('login-error')).toBeVisible()
await expect(page.getByTestId('login-error')).toContainText('Invalid credentials')
```

---

## 💡 Tips

1. **Always use `await`** - Playwright commands are async
2. **Use data-testid** - Most reliable selector
3. **Let auto-wait work** - Avoid manual waits
4. **Use UI Mode** - Best debugging experience
5. **Use fixtures** - Don't repeat login code
6. **Take screenshots** - On failures for debugging
7. **Check HTML report** - After test runs
8. **Use codegen** - Learn by recording

---

## ⚠️ Common Mistakes

```javascript
// ❌ Forgetting await
page.goto('/login') // Won't work!

// ✅ Using await
await page.goto('/login')

// ❌ Manual waits
await page.waitForTimeout(2000)

// ✅ Auto-wait
await page.getByTestId('submit').click()

// ❌ Complex CSS selectors
await page.locator('div > ul > li:nth-child(2) > a.btn')

// ✅ Test IDs
await page.getByTestId('register-button')

// ❌ Repeating login in every test
test('test 1', async ({ page }) => {
  await page.goto('/login')
  // ... login code
})

// ✅ Using fixtures
import { test } from '../fixtures/auth.fixture.js'
test('test 1', async ({ authenticatedPage }) => {
  // Already logged in!
})
```

---

## 📝 Quick Examples

### Complete Login Test
```javascript
import { test, expect } from '@playwright/test'

test('user can login successfully', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('login-email').fill('user@petadoption.com')
  await page.getByTestId('login-password').fill('user123')
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/dashboard/)
})
```

### Complete Registration Test
```javascript
import { test, expect } from '@playwright/test'
import { generateUserData } from '../utils/test-helpers.js'

test('new user can register', async ({ page }) => {
  const user = generateUserData()

  await page.goto('/register')
  await page.getByTestId('register-firstName').fill(user.firstName)
  await page.getByTestId('register-lastName').fill(user.lastName)
  await page.getByTestId('register-email').fill(user.email)
  await page.getByTestId('register-phone').fill(user.phone)
  await page.getByTestId('register-password').fill(user.password)
  await page.getByTestId('register-confirmPassword').fill(user.password)
  await page.getByTestId('register-submit').click()

  await expect(page).toHaveURL(/dashboard/)
})
```

### Complete Search Test
```javascript
import { test, expect } from '@playwright/test'

test('can search for pets by name', async ({ page }) => {
  await page.goto('/pets')

  // Search for Luna
  await page.getByTestId('search-input').fill('Luna')

  // Should show only Luna
  await expect(page.locator('[data-testid^="pet-card-"]')).toHaveCount(1)
  await expect(page.locator('[data-testid="pet-card-1"]')).toContainText('Luna')
})
```

---

**Need help? Check [PLAYWRIGHT-GUIDE.md](../PLAYWRIGHT-GUIDE.md) for detailed explanations!**
