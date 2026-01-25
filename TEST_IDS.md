# Test ID Reference Guide

This document lists all `data-testid` attributes available in the Pet Adoption Portal for automation testing.

## Navbar Component

| Test ID           | Element              | Description                                      |
| ----------------- | -------------------- | ------------------------------------------------ |
| `navbar`          | Navigation container | Main navigation bar                              |
| `logo-link`       | Link                 | PawMatch logo/home link                          |
| `brand-name`      | Text                 | "PawMatch" brand name                            |
| `nav-browse-pets` | Link                 | Browse Pets navigation link                      |
| `nav-pet-matcher` | Link                 | Pet Matcher/Quiz navigation link                 |
| `nav-dashboard`   | Link                 | Dashboard link (authenticated only)              |
| `nav-admin`       | Link                 | Admin link (admin users only)                    |
| `logout-button`   | Button               | Logout button (authenticated only)               |
| `nav-login`       | Link                 | Login link (unauthenticated only)                |
| `nav-register`    | Link                 | Get Started/Register link (unauthenticated only) |

## Home Page

### Hero Section

| Test ID            | Element        | Description                                |
| ------------------ | -------------- | ------------------------------------------ |
| `home-page`        | Page container | Home page wrapper                          |
| `hero-section`     | Section        | Hero section                               |
| `hero-heading`     | H1             | Main heading "Find Your Perfect Pet Today" |
| `hero-subtitle`    | Paragraph      | Hero subtitle text                         |
| `cta-buttons`      | Container      | CTA buttons wrapper                        |
| `cta-browse-pets`  | Button         | Primary CTA - Browse Available Pets        |
| `cta-take-quiz`    | Button         | Secondary CTA - Take Matching Quiz         |
| `trust-indicators` | Container      | Trust indicators box                       |

### Features Section

| Test ID             | Element   | Description                                |
| ------------------- | --------- | ------------------------------------------ |
| `features-section`  | Section   | Features section                           |
| `features-heading`  | H2        | "Why Adopt With Us?" heading               |
| `features-subtitle` | Paragraph | Features subtitle                          |
| `features-grid`     | Container | Features cards container                   |
| `feature-card-0`    | Card      | First feature card (Find Your Match)       |
| `feature-card-1`    | Card      | Second feature card (Easy Adoption)        |
| `feature-card-2`    | Card      | Third feature card (Post-Adoption Support) |

### Stats Section

| Test ID                | Element | Description               |
| ---------------------- | ------- | ------------------------- |
| `stats-section`        | Section | Statistics section        |
| `stat-adoptions`       | Card    | Happy Adoptions stat card |
| `stat-adoptions-value` | Text    | "150+" value              |
| `stat-adoptions-label` | Text    | "Happy Adoptions" label   |
| `stat-available`       | Card    | Pets Available stat card  |
| `stat-available-value` | Text    | "50+" value               |
| `stat-available-label` | Text    | "Pets Available" label    |
| `stat-guarantee`       | Card    | Love Guaranteed stat card |
| `stat-guarantee-value` | Text    | "100%" value              |
| `stat-guarantee-label` | Text    | "Love Guaranteed" label   |

### Final CTA Section

| Test ID             | Element   | Description                      |
| ------------------- | --------- | -------------------------------- |
| `final-cta-section` | Section   | Final CTA section                |
| `final-cta-heading` | H2        | Final CTA heading                |
| `final-cta-text`    | Paragraph | Final CTA description            |
| `final-cta-button`  | Button    | "View All Available Pets" button |

## Pets Browse Page

### Header & Filters

| Test ID                 | Element        | Description                            |
| ----------------------- | -------------- | -------------------------------------- |
| `pets-page`             | Page container | Pets page wrapper                      |
| `page-header`           | Container      | Page header section                    |
| `page-title`            | H1             | "Adopt a Pet" heading                  |
| `page-subtitle`         | Paragraph      | Page subtitle                          |
| `search-filter-bar`     | Container      | Search and filter bar                  |
| `search-input`          | Input          | Search input field                     |
| `filter-species`        | Select         | Species dropdown filter                |
| `filter-size`           | Select         | Size dropdown filter                   |
| `toggle-filters-button` | Button         | Show/Hide advanced filters             |
| `expanded-filters`      | Container      | Expanded filters section (conditional) |
| `filter-age`            | Select         | Age dropdown filter                    |
| `filter-gender`         | Select         | Gender dropdown filter                 |
| `filter-sort`           | Select         | Sort by dropdown                       |
| `reset-filters-button`  | Button         | Reset all filters button               |

### Results

| Test ID         | Element   | Description           |
| --------------- | --------- | --------------------- |
| `results-count` | Container | Results count section |
| `pet-count`     | Span      | Number of pets found  |
| `pets-grid`     | Container | Pet cards grid        |

### Pet Cards (Dynamic IDs with pet.id)

| Test ID Pattern            | Element   | Description                |
| -------------------------- | --------- | -------------------------- |
| `pet-card-{id}`            | Card      | Individual pet card        |
| `pet-image-{id}`           | Image     | Pet photo                  |
| `favorite-button-{id}`     | Button    | Add/remove favorite button |
| `pet-name-{id}`            | H3        | Pet name                   |
| `pet-breed-{id}`           | Paragraph | Pet breed                  |
| `pet-details-{id}`         | Paragraph | Age and gender info        |
| `pet-description-{id}`     | Paragraph | Pet description            |
| `pet-traits-{id}`          | Container | Personality traits badges  |
| `view-details-button-{id}` | Button    | View Details button        |

### Pagination

| Test ID               | Element   | Description          |
| --------------------- | --------- | -------------------- |
| `pagination`          | Container | Pagination section   |
| `pagination-previous` | Button    | Previous page button |
| `current-page`        | Span      | Current page number  |
| `total-pages`         | Span      | Total pages count    |
| `pagination-next`     | Button    | Next page button     |

## Usage Examples

### Playwright

```javascript
// Navigate to home page
await page.getByTestId("logo-link").click();

// Click Browse Pets CTA
await page.getByTestId("cta-browse-pets").click();

// Search for a pet
await page.getByTestId("search-input").fill("Max");

// Filter by species
await page.getByTestId("filter-species").selectOption("dog");

// Click on first pet card (assuming ID is '1')
await page.getByTestId("pet-card-1").click();

// Add pet to favorites
await page.getByTestId("favorite-button-1").click();

// Verify results count
const count = await page.getByTestId("pet-count").textContent();
```

### Cypress

```javascript
// Navigate to home page
cy.getByTestId("logo-link").click();

// Click Browse Pets CTA
cy.getByTestId("cta-browse-pets").click();

// Search for a pet
cy.getByTestId("search-input").type("Max");

// Filter by species
cy.getByTestId("filter-species").select("dog");

// Click on first pet card
cy.getByTestId("pet-card-1").click();

// Add pet to favorites
cy.getByTestId("favorite-button-1").click();

// Verify results count
cy.getByTestId("pet-count").should("contain", "10");
```

### Selenium (WebDriver)

```java
// Navigate to home page
driver.findElement(By.cssSelector("[data-testid='logo-link']")).click();

// Click Browse Pets CTA
driver.findElement(By.cssSelector("[data-testid='cta-browse-pets']")).click();

// Search for a pet
driver.findElement(By.cssSelector("[data-testid='search-input']")).sendKeys("Max");

// Filter by species
Select speciesDropdown = new Select(driver.findElement(By.cssSelector("[data-testid='filter-species']")));
speciesDropdown.selectByValue("dog");

// Click on first pet card
driver.findElement(By.cssSelector("[data-testid='pet-card-1']")).click();
```

## Testing Scenarios

### Beginner Level

1. Verify homepage loads correctly (check `hero-heading` text)
2. Navigate to Pets page using navbar link
3. Verify search input is visible and enabled
4. Count number of pet cards displayed

### Intermediate Level

1. Filter pets by species and verify results
2. Search for specific pet by name
3. Toggle expanded filters and apply multiple filters
4. Verify pagination works correctly

### Advanced Level

1. Add multiple pets to favorites and verify persistence
2. Test filter combinations and result accuracy
3. Navigate through all pages and collect all pet names
4. Test responsive behavior at different viewports

### Expert Level

1. Test concurrent filter applications
2. Verify all pet card data matches API responses
3. Test edge cases (no results, single result, max results)
4. Performance testing with large datasets
