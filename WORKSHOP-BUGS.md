# Workshop Bug Scenarios

This document contains intentional bugs you can introduce to the application for automation testing workshops. Students will practice finding these bugs with their test automation.

## Easy Bugs (Beginner Level)

### 1. Form Validation Bug - Age Requirement

**File:** `client/src/views/Apply.vue`
**Line:** Around 102

**Bug:**

```javascript
// Current (correct):
if (age < 18) {
  alert('You must be 18 or older to adopt');
  return false;
}

// Change to (bug):
if (age < 16) {
  // Wrong age requirement!
  alert('You must be 18 or older to adopt');
  return false;
}
```

**Expected Behavior:** Users under 18 should be blocked
**Buggy Behavior:** Users 16-17 can submit applications
**Test Should Check:** Age validation enforces 18+ rule

---

### 2. Filter Logic Bug - Species Filter

**File:** `server/routes/pets.js`
**Line:** Around 25

**Bug:**

```javascript
// Current (correct):
if (species) {
  pets = pets.filter((pet) => pet.species === species);
}

// Change to (bug):
if (species && species !== 'any') {
  // 'any' filter doesn't work!
  pets = pets.filter((pet) => pet.species === species);
}
```

**Expected Behavior:** "All species" filter shows all pets
**Buggy Behavior:** "All species" returns empty results
**Test Should Check:** Filter combinations return expected results

---

### 3. Typo in Success Message

**File:** `client/src/views/Apply.vue`
**Line:** Around 220

**Bug:**

```javascript
// Current (correct):
alert('Application submitted successfully!');

// Change to (bug):
alert('Application submited successfully!'); // Typo!
```

**Expected Behavior:** "submitted" spelled correctly
**Buggy Behavior:** "submited" misspelled
**Test Should Check:** User-facing messages for typos

---

## Medium Bugs (Intermediate Level)

### 4. Quiz Calculation Bug - Match Score

**File:** `server/routes/quiz.js`
**Line:** Around 15-20

**Bug:**

```javascript
// Current (correct):
if (quizAnswers.activityLevel === pet.activityLevel) {
  score += 20;
}

// Change to (bug):
if (quizAnswers.activityLevel === pet.activityLevel) {
  score += 10; // Wrong score!
}
```

**Expected Behavior:** Perfect activity match = 20 points
**Buggy Behavior:** Perfect activity match = 10 points
**Test Should Check:** Quiz scoring algorithm accuracy

---

### 5. Sort Bug - Age Sorting

**File:** `server/routes/pets.js`
**Line:** Around 60-70

**Bug:**

```javascript
// Current (correct):
if (sortBy === 'age') {
  aVal = parseInt(a[sortBy]);
  bVal = parseInt(b[sortBy]);
}

// Change to (bug):
if (sortBy === 'age') {
  aVal = a[sortBy]; // String comparison instead of number!
  bVal = b[sortBy];
}
```

**Expected Behavior:** Numeric sort (1, 2, 3, 10)
**Buggy Behavior:** String sort (1, 10, 2, 3)
**Test Should Check:** Sort order is correct

---

### 6. Off-by-One Pagination Bug

**File:** `server/routes/pets.js`
**Line:** Around 75

**Bug:**

```javascript
// Current (correct):
const startIndex = (page - 1) * limit;
const endIndex = startIndex + parseInt(limit);

// Change to (bug):
const startIndex = (page - 1) * limit;
const endIndex = startIndex + parseInt(limit) - 1; // Off by one!
```

**Expected Behavior:** Page 1 with limit 12 shows items 0-11
**Buggy Behavior:** Page 1 with limit 12 shows items 0-10 (missing one)
**Test Should Check:** Pagination returns correct number of items

---

## Hard Bugs (Advanced Level)

### 7. Race Condition - Duplicate Favorites

**File:** `server/routes/favorites.js`
**Line:** Around 25-40

**Bug:**

```javascript
// Current (correct): Check is synchronous
const existing = favorites.find((fav) => fav.userId === req.user.id && fav.petId === petId);

if (existing) {
  return res.status(400).json({ error: 'Pet already in favorites' });
}

// Add delay to introduce race condition (bug):
const existing = favorites.find((fav) => fav.userId === req.user.id && fav.petId === petId);

// Simulate processing delay
await new Promise((resolve) => setTimeout(resolve, 100));

if (existing) {
  return res.status(400).json({ error: 'Pet already in favorites' });
}
```

**Expected Behavior:** Can't favorite same pet twice
**Buggy Behavior:** Rapid clicks can add duplicate favorites
**Test Should Check:** Concurrent requests are handled properly

---

### 8. Memory Leak - Favorites Array Growth

**File:** `server/routes/favorites.js`
**Line:** Around 25

**Bug:**

```javascript
// Current (correct): Properly removes favorites
const filteredFavorites = favorites.filter(
  (fav) => !(fav.userId === req.user.id && fav.petId === petId)
);
await writeDB('favorites.json', filteredFavorites);

// Change to (bug): Doesn't actually remove, just hides
const filteredFavorites = favorites.filter(
  (fav) => !(fav.userId === req.user.id && fav.petId === petId)
);
// Don't write to DB - favorites keep growing!
// await writeDB('favorites.json', filteredFavorites);
```

**Expected Behavior:** Removed favorites are deleted
**Buggy Behavior:** Favorites file grows indefinitely
**Test Should Check:** Database size doesn't grow unbounded

---

### 9. State Bug - Adopted Pets Still Available

**File:** `server/routes/applications.js`
**Line:** Around 90-100

**Bug:**

```javascript
// Current (correct):
if (status === 'approved') {
  const pets = await readDB('pets.json');
  const petIndex = pets.findIndex((p) => p.id === applications[index].petId);
  if (petIndex !== -1) {
    pets[petIndex].status = 'pending';
    await writeDB('pets.json', pets);
  }
}

// Change to (bug):
if (status === 'approved') {
  const pets = await readDB('pets.json');
  const petIndex = pets.findIndex((p) => p.id === applications[index].petId);
  if (petIndex !== -1) {
    pets[petIndex].status = 'pending';
    // Don't save! Pet stays available
    // await writeDB('pets.json', pets);
  }
}
```

**Expected Behavior:** Approved pets marked as pending
**Buggy Behavior:** Pets stay available after approval
**Test Should Check:** Pet status changes persist

---

### 10. SQL Injection-like Bug (JSON Injection)

**File:** `server/routes/pets.js`
**Line:** Around 45

**Bug:**

```javascript
// Current (correct):
if (search) {
  const searchLower = search.toLowerCase();
  pets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchLower) ||
      pet.description.toLowerCase().includes(searchLower)
  );
}

// Change to (bug): Vulnerable to injection
if (search) {
  // Dangerous eval-like behavior
  pets = pets.filter((pet) => {
    try {
      return eval(`pet.name.includes("${search}")`);
    } catch {
      return false;
    }
  });
}
```

**Expected Behavior:** Search only searches name/description
**Buggy Behavior:** Can inject arbitrary code through search
**Test Should Check:** Input sanitization and security

---

## UI/UX Bugs

### 11. Button Disabled State Bug

**File:** `client/src/views/Apply.vue`
**Line:** Around 250

**Bug:**

```javascript
// Current (correct):
<button
  type="submit"
  :disabled="!application.signature || !application.agreedToTerms"
>

// Change to (bug):
<button
  type="submit"
  :disabled="false"  // Always enabled!
>
```

**Expected Behavior:** Submit disabled until signature & terms
**Buggy Behavior:** Can submit without signature
**Test Should Check:** Form validation prevents incomplete submissions

---

### 12. Image Loading Bug

**File:** `client/src/views/Pets.vue`
**Line:** Around 140

**Bug:**

```javascript
// Current (correct):
<img
  :src="pet.images[0]"
  :alt="pet.name"
/>

// Change to (bug):
<img
  :src="pet.images[10]"  // Index out of bounds!
  :alt="pet.name"
/>
```

**Expected Behavior:** First image displays
**Buggy Behavior:** Broken image (undefined)
**Test Should Check:** Images load correctly

---

## How to Use These Bugs

1. **Choose a difficulty level** based on your workshop audience
2. **Introduce 2-3 bugs** - don't overwhelm students
3. **Document which bugs you added** so you can verify fixes
4. **Create a separate branch** for the buggy version
5. **Have students write tests** that would catch these bugs
6. **Show how the tests fail** with the bugs present
7. **Fix the bugs** and show tests passing

## Workshop Exercise Ideas

### Exercise 1: Find the Bug

- Give students the buggy app
- Have them explore and document bugs manually
- Then write tests to catch those bugs

### Exercise 2: Test-Driven Bug Fixes

- Give students failing tests
- Have them identify what the tests expect
- Fix the code to make tests pass

### Exercise 3: Prevent Regressions

- Show a "fixed" app with tests
- Introduce a bug
- Watch the tests catch it
- Demonstrate value of test automation

## Tips for Instructors

- Start with **easy bugs** that are obvious when testing manually
- Progress to **medium bugs** that are harder to spot without automation
- End with **hard bugs** that require specific test scenarios
- Mix bug types: validation, logic, UI, security, performance
- Encourage students to add more tests beyond just bug detection

---

**Remember:** The goal is to teach test automation, not to make an intentionally bad app! Keep the core functionality working so students can learn effectively.
