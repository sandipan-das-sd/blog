# Quick Start Guide

## Prerequisites Check
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running
- [ ] npm or yarn installed

## Setup Steps

### 1. Install Dependencies

#### Backend
```powershell
cd server
npm install
```

#### Frontend
```powershell
cd client
npm install
```

### 2. Configure Environment

#### Backend (.env in server directory)
```bash
cp .env.example .env
```
Edit the .env file with your MongoDB URI and JWT secrets.

#### Frontend (.env in client directory)
```bash
cp .env.example .env
```
Default settings should work for local development.

### 3. Start MongoDB

If using local MongoDB:
```powershell
mongod
```

Or configure MongoDB Atlas connection string in server/.env

### 4. Run the Application

#### Terminal 1 - Backend
```powershell
cd server
npm run dev
```
Backend runs on http://localhost:8000

#### Terminal 2 - Frontend
```powershell
cd client
npm run dev
```
Frontend runs on http://localhost:5173

### 5. Create Admin User

1. Register a user through the UI at http://localhost:5173/register
2. Open MongoDB Compass or shell
3. Update the user's role:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### 6. Test the Application

- ✅ Visit http://localhost:5173
- ✅ Register a new account
- ✅ Login
- ✅ Create a blog post
- ✅ Add comments
- ✅ Access admin panel (if admin)

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- For Atlas, verify your IP is whitelisted

### Port Already in Use
- Backend: Change PORT in server/.env
- Frontend: It will prompt for alternative port

### CORS Errors
- Verify FRONTEND_URL in server/.env matches your frontend URL

### Social Login Not Working
- Google/Facebook OAuth requires valid credentials in .env
- Callback URLs must match what's configured in OAuth apps

## API Testing

Use Postman or any API client:
- Import the endpoints from README.md
- Get token from /api/auth/login
- Add `Authorization: Bearer <token>` header

## Need Help?

Check the full README.md for detailed documentation.
