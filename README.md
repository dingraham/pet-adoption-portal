# Pet Adoption Portal

A full-stack web application designed for **automation testing workshops**. Provides a realistic environment for practicing test automation with multiple user flows and complex interactions.

## Purpose

- Teach students how to write effective automation tests
- Practice platform for E2E testing with Playwright
- Complex enough for challenging scenarios, simple enough to understand quickly

## Features

**User Features:**

- Pet gallery with search, filtering, and pagination
- Pet detail pages with image galleries
- Pet matcher quiz with scoring algorithm
- Multi-step adoption application (5 steps with validation)
- User dashboard (favorites, applications, appointments)

**Admin Features:**

- Pet management (CRUD)
- Application review and approval
- Statistics dashboard

## Tech Stack

| Frontend                | Backend            |
| ----------------------- | ------------------ |
| Vue 3 (Composition API) | Node.js + Express  |
| Vue Router              | JWT Authentication |
| Pinia                   | bcrypt             |
| Tailwind CSS            | JSON file storage  |
| Vite                    | CORS enabled       |

## Quick Start

**Prerequisites:** Node.js v14+

```bash
# 1. Install dependencies
npm run install:all

# 2. Seed the database
cd server && node utils/seed.js && cd ..

# 3. Start the app
npm run dev
```

**URLs:**

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Default Credentials

| Role  | Email                 | Password |
| ----- | --------------------- | -------- |
| Admin | admin@petadoption.com | admin123 |
| User  | user@petadoption.com  | user123  |

## Running Tests

```bash
npm run test:ui      # UI Mode (recommended)
npm test             # Run all tests headlessly
npm run test:codegen # Generate tests by recording
npm run test:debug   # Debug with Playwright Inspector
npm run test:report  # View HTML report
```

**Documentation:**

- [Playwright Guide](./PLAYWRIGHT-GUIDE.md) - Complete testing guide
- [Cheat Sheet](./tests/CHEATSHEET.md) - Quick reference

## Reset Data

```bash
cd server && node utils/seed.js
```

## License

MIT - Free to use for workshops and training.
