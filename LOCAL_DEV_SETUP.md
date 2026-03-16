# 🛠️ Local Development Setup - Localhost Fetch Fix

## Problem
Frontend on localhost isn't fetching from backend because backend isn't running.

**Current Status:**
- ✅ Frontend (Vite) running on http://localhost:3000
- ❌ Backend (Express) NOT running on http://localhost:5000

## Solution: Run Both Servers

### Option A: Two Terminal Tabs (Recommended)

**Terminal 1 - Backend (Express + WebSocket):**
```bash
npm run dev:backend
# or
npm run dev
```
Wait for: `Express server listening on port 5000`

**Terminal 2 - Frontend (Vite dev server):**
```bash
npm run dev:frontend
# or
npx vite
```
Wait for: `VITE v6.x.x building for development...`

Then visit: **http://localhost:3000** 

---

### Option B: One Terminal (Sequential)

If you want to use only one terminal:

**Terminal:**
```bash
# Start backend first
npm run dev:backend &

# In same terminal, after backend starts, run frontend in another way
# Or use concurrently (see below)
```

---

## 📋 What Each Does

| Command | Starts | Port | Purpose |
|---------|--------|------|---------|
| `npm run dev:backend` | Express server | 5000 | API endpoints, WebSocket |
| `npm run dev:frontend` | Vite dev server | 5173 (or 3000) | React HMR, live reload |
| `npm run dev` | Express server | 5000 | Same as dev:backend |
| `npm run build` | Production bundle | N/A | Creates `/dist` folder |

---

## 🔌 API URL for Localhost

When running locally:

**Frontend config (src/utils/api.ts):**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

- ✅ Local dev uses: `http://localhost:5000` (default)
- ✅ Vercel prod uses: `https://kiosk-backend-fu5f.onrender.com` (from VITE_API_URL env var)

---

## ✅ How to Verify It's Working

Once both servers are running:

1. Open: **http://localhost:3000**
2. Open DevTools: **F12**
3. Console tab → Should be **CLEAN** (no errors)
4. Network tab:
   - Perform an action (login page load, click button, etc.)
   - Look for API requests
   - URLs should show: `http://localhost:5000/api/...`
   - Status should be: **200** (not 404 or CORS error)

---

## 🚀 Quick Start Script

Save this as `dev.bat` (Windows) in your project root:

```batch
@echo off
echo Starting backend...
start cmd /k npm run dev:backend
timeout /t 3 /nobreak
echo Starting frontend...
start cmd /k npm run dev:frontend
echo.
echo ✅ Backend running on http://localhost:5000
echo ✅ Frontend running on http://localhost:3000
echo.
pause
```

Then run: `dev.bat` (opens 2 new windows automatically)

---

## 📊 Ports Reference

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend (Vite) | 3000 or 5173 | http://localhost:3000 | Check with `netstat -ano \| findstr :3000` |
| Backend (Express) | 5000 | http://localhost:5000 | Check with `netstat -ano \| findstr :5000` |
| WebSocket | Same as 5000 | ws://localhost:5000 | Connects when backend is running |

---

## ❌ If Still Not Fetching

### Verify Backend is Actually Running
```bash
# In PowerShell, test if backend responds
Invoke-WebRequest -Uri http://localhost:5000/api/faculty -UseBasicParsing
# Should show Status: 200 OK
```

### Check for Port Conflicts
```bash
# Find what's using port 5000
netstat -ano | findstr :5000
# If something else is using it, kill it or use different port
```

### Check Frontend Console Errors
1. F12 → Console tab
2. Look for red 🔴 errors
3. Common issues:
   - `TypeError: Failed to fetch` → Backend not running
   - `CORS policy` → CORS issue (less likely for localhost)
   - `net::ERR_CONNECTION_REFUSED` → Backend port wrong

---

## 📝 Updated Scripts in package.json

```json
{
  "scripts": {
    "dev": "tsx server.ts",              // Backward compatible
    "dev:backend": "tsx server.ts",      // Start Express backend
    "dev:frontend": "vite",              // Start Vite frontend
    "start": "tsx server.ts",            // Production backend
    "build": "vite build",               // Build frontend
    "preview": "vite preview",           // Preview built frontend
    "clean": "rm -rf dist",              // Clean build
    "lint": "tsc --noEmit"               // TypeScript check
  }
}
```

---

## 🎯 Next Steps

1. **Open 2 terminals**
2. **Terminal 1:** `npm run dev:backend` (wait for "Express listening")
3. **Terminal 2:** `npm run dev:frontend` (wait for "ready in X ms")
4. **Browser:** Visit http://localhost:3000
5. **Verify:** Open console (F12) → should be clean
6. **Test API:** Network tab should show requests to `http://localhost:5000/api/...`

**Done!** Your local dev environment should now fetch data correctly. 🚀
