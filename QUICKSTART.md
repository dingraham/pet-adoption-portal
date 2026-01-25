# Quick Start Guide

## Get Up and Running in 3 Steps

### 1. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for:

- Root (concurrently for running both servers)
- Client (Vue 3 + Vite frontend)
- Server (Express backend)

### 2. Seed the Database

```bash
cd server
node utils/seed.js
cd ..
```

This creates:

- 10 sample pets (dogs, cats, and a rabbit)
- Admin user (admin@petadoption.com / admin123)
- Empty application, favorites, and appointments data

### 3. Start the Application

```bash
npm run dev
```

This starts both servers simultaneously:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

## What You Can Do Now

### As a User:

1. Browse pets at http://localhost:5173/pets
2. Take the Pet Matcher Quiz at http://localhost:5173/quiz (requires login)
3. Create an account at http://localhost:5173/register
4. Favorite pets, schedule appointments, and submit adoption applications

### As an Admin:

1. Login at http://localhost:5173/login
   - Email: admin@petadoption.com
   - Password: admin123
2. Go to Admin Panel at http://localhost:5173/admin
3. Add/edit/delete pets
4. Review and approve/reject applications

## Testing the API Directly

Health check:

```bash
curl http://localhost:3000/api/health
```

Get all pets:

```bash
curl http://localhost:3000/api/pets
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petadoption.com","password":"admin123"}'
```

## Troubleshooting

**Port already in use?**

- Frontend (5173): Check if another Vite app is running
- Backend (3000): Check `server/.env` to change the port

**Database empty?**

- Run `cd server && node utils/seed.js` to re-seed

**Can't login?**

- Make sure you ran the seed script
- Try creating a new account via /register

**Frontend not loading?**

- Check that both servers are running
- Check browser console for errors
- Verify `.env` file exists in `client/` directory

## Stop the Application

Press `Ctrl+C` in the terminal where `npm run dev` is running.

## Reset Everything

To start fresh:

```bash
# Delete data
rm server/data/*.json

# Re-seed
cd server
node utils/seed.js
cd ..

# Restart
npm run dev
```

## Next Steps

Check out the main [README.md](README.md) for:

- Detailed feature documentation
- API endpoint reference
- Testing scenarios for automation workshops
- How to introduce bugs for practice

Happy Testing! 🧪
