# 🚀 COMPLETE STARTUP GUIDE

## ⚠️ CRITICAL: Backend Connection Error

You're seeing `ERR_CONNECTION_REFUSED` because **the backend server is not running**.

The system requires **3 services** running simultaneously:

1. **MongoDB** (Database) - Port 27017
2. **Backend** (API Server) - Port 8000
3. **Frontend** (React App) - Port 5173

---

## 📋 QUICK START (Do in this order)

### Step 1: Start MongoDB

```bash
mongod
```

**Keep this terminal open!**

- Should show: `"msg":"Waiting for connections","attr":{"port":27017}`

### Step 2: Start Backend (Open NEW terminal)

```bash
cd "C:\Users\billy\Desktop\New folder (2)\ecommerce\backend"
npm start
```

**Keep this terminal open!**

- Should show: `listening to port: 8000`
- Should show MongoDB connection: `connected to mongodb...`

### Step 3: Start Frontend (Open NEW terminal)

```bash
cd "C:\Users\billy\Desktop\New folder (2)\ecommerce\frontend"
npm run dev
```

**Keep this terminal open!**

- Should show: `http://localhost:5173` in blue

---

## ✅ Verify All Services Running

Once all 3 are started, check:

1. **MongoDB**: Terminal 1 shows `"waiting for connections"`
2. **Backend**: Terminal 2 shows `listening to port: 8000`
3. **Frontend**: Terminal 3 shows `http://localhost:5173`

Open browser to: **http://localhost:5173**

- Should load without errors
- Console should NOT show `ERR_CONNECTION_REFUSED`

---

## 🆘 TROUBLESHOOTING

### Backend shows "Cannot find module"

```bash
cd backend
npm install
npm start
```

### MongoDB connection error in backend

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: MongoDB not running. Start `mongod` first.

### Port already in use (e.g., "EADDRINUSE")

```bash
# Kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Still getting ERR_CONNECTION_REFUSED?

1. ✅ Verify MongoDB terminal shows connection message
2. ✅ Verify Backend terminal shows `listening to port: 8000`
3. ✅ Verify no error messages in backend terminal
4. ✅ Check browser console (F12) for actual errors
5. ✅ Try hard refresh: Ctrl+Shift+R

---

## 📝 What Just Changed

### Frontend

- **AdminDashboard.jsx**: Fixed API endpoint from `localhost:5000` → `localhost:8000`
- **AdminAnalytics.jsx**: Added null check to prevent crash on connection error
- Better error messages on connection failure

### Backend

- Already has all required routes for admin/seller features
- Ready to receive API calls on port 8000

---

## 🧪 TEST AFTER STARTUP

Once all 3 services running and no errors:

1. Go to: `http://localhost:5173/admin`
   - Should see **real data** (not zeros/mock)
   - System stats with actual counts
   - Recent activity log

2. Go to: `http://localhost:5173/admin/users`
   - Should see **real user list**
   - Can ban/unban users
   - Can change roles
   - Can delete users

3. Go to: `http://localhost:5173/admin/settings`
   - Should see 4 tabs: Security, Notifications, Database, Platform
   - Settings form displays (not "Coming Soon")

4. Check **Browser Console** (F12):
   - Should see **0 error messages**
   - No `ERR_CONNECTION_REFUSED`
   - No "Cannot read properties of null"

---

## 🎯 Success = All 3 Running + No Errors

You're done when:

- ✅ All 3 terminals running without errors
- ✅ Browser shows real data (not zeros)
- ✅ Console has 0 connection errors
- ✅ Admin pages fully functional
