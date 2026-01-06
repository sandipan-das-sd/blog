# Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Backend Issues

#### 1. MongoDB Connection Error
**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running:
  ```bash
  # Check if MongoDB is running
  mongod --version
  
  # Start MongoDB (Windows)
  net start MongoDB
  
  # Or run mongod directly
  mongod
  ```
- Verify `MONGODB_URI` in `server/.env`
- If using MongoDB Atlas:
  - Check your IP is whitelisted
  - Verify connection string format
  - Ensure username/password are correct

#### 2. Port Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::8000`

**Solutions:**
- Kill the process using port 8000:
  ```powershell
  # Find process using port 8000
  netstat -ano | findstr :8000
  
  # Kill the process (replace PID)
  taskkill /PID <PID> /F
  ```
- Or change the port in `server/.env`:
  ```env
  PORT=8001
  ```

#### 3. JWT Secret Not Defined
**Error:** `JWT_SECRET is not defined`

**Solutions:**
- Copy `.env.example` to `.env` in server directory
- Add a strong JWT secret:
  ```env
  JWT_SECRET=your-very-long-secret-key-min-32-characters
  ```

#### 4. Module Not Found
**Error:** `Cannot find module 'xyz'`

**Solutions:**
```bash
cd server
npm install
```

---

### 🔵 Frontend Issues

#### 1. API Connection Failed
**Error:** Network errors or CORS errors

**Solutions:**
- Ensure backend is running on port 8000
- Verify `VITE_API_URL` in `client/.env`:
  ```env
  VITE_API_URL=http://localhost:8000/api
  ```
- Check CORS configuration in `server/server.js`

#### 2. Port Conflict
**Issue:** Vite wants to use port 5173 but it's taken

**Solutions:**
- Vite will automatically suggest an alternative port
- Or specify port in `client/vite.config.js`:
  ```javascript
  server: {
    port: 3000
  }
  ```

#### 3. Environment Variables Not Loading
**Error:** `undefined` for environment variables

**Solutions:**
- Ensure `.env` file exists in client directory
- Environment variables must start with `VITE_`
- Restart the dev server after changing `.env`

---

### 🟡 Authentication Issues

#### 1. Can't Login - Invalid Credentials
**Solutions:**
- Verify user exists in database
- Check password is correct
- Run seed script to create test users:
  ```bash
  cd server
  npm run seed
  ```

#### 2. Token Expired Error
**Solutions:**
- This is normal after 7 days
- Clear localStorage and login again
- Or use refresh token endpoint

#### 3. Social Login Not Working
**Solutions:**
- Verify OAuth credentials in `server/.env`
- Check callback URLs match:
  - Google: `http://localhost:8000/api/auth/google/callback`
  - Facebook: `http://localhost:8000/api/auth/facebook/callback`
- For production, update URLs in OAuth app settings

---

### 🟢 Database Issues

#### 1. Seeding Fails
**Error:** `E11000 duplicate key error`

**Solutions:**
- Drop the database and seed again:
  ```javascript
  // In MongoDB shell
  use blog-system
  db.dropDatabase()
  ```
- Then run seed again:
  ```bash
  npm run seed
  ```

#### 2. Can't Create Admin User
**Solutions:**
1. Register normally through UI
2. Update role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

---

### 🟠 Development Issues

#### 1. Changes Not Reflecting
**Solutions:**
- For Backend: Ensure nodemon is running (check terminal)
- For Frontend: Hard refresh browser (Ctrl + Shift + R)
- Clear cache and restart dev server

#### 2. ESLint Errors
**Solutions:**
- Run lint fix:
  ```bash
  npm run lint -- --fix
  ```

---

### ⚪ Performance Issues

#### 1. Slow API Responses
**Solutions:**
- Check MongoDB is properly indexed (seed script creates indexes)
- Enable caching (already implemented)
- Reduce page limit in queries
- Optimize database queries

#### 2. Frontend Loading Slow
**Solutions:**
- Build for production:
  ```bash
  npm run build
  npm run preview
  ```
- Enable lazy loading for routes
- Optimize images

---

## 🔧 Debugging Tips

### Backend Debugging
1. Add console.logs in controllers
2. Check terminal for error messages
3. Use Postman to test API directly
4. Check MongoDB Compass for data

### Frontend Debugging
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Use React DevTools

### Database Debugging
1. Use MongoDB Compass GUI
2. Or MongoDB shell:
   ```bash
   mongosh
   use blog-system
   db.users.find()
   ```

---

## 📞 Getting Help

1. Check error message carefully
2. Search the error on Google/StackOverflow
3. Verify all dependencies are installed
4. Ensure all .env variables are set
5. Try restarting servers

---

## ✅ Health Checklist

Before asking for help, verify:
- [ ] Node.js is installed (v14+)
- [ ] MongoDB is running
- [ ] Backend dependencies installed (`server/node_modules` exists)
- [ ] Frontend dependencies installed (`client/node_modules` exists)
- [ ] `.env` file exists in both server and client
- [ ] Backend is running (http://localhost:8000/health should work)
- [ ] Frontend is running (http://localhost:5173 should load)
- [ ] No console errors in browser DevTools
- [ ] No errors in backend terminal

---

## 🚨 Critical Errors

### If nothing works:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Drop and reseed database
4. Restart everything

```bash
# Complete reset
cd server
rm -rf node_modules package-lock.json
npm install
npm run seed

cd ../client  
rm -rf node_modules package-lock.json
npm install

# Then start servers
```

---

Remember: Most issues are due to:
1. MongoDB not running
2. Missing .env file
3. Wrong environment variables
4. Dependencies not installed
5. Port conflicts
