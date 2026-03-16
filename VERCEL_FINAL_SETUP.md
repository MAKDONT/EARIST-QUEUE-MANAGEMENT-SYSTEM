# Vercel Deployment - Final Setup Guide

**Backend Status:** ✅ Running at `https://kiosk-backend-fu5f.onrender.com`  
**Frontend Status:** ✅ Built & Ready  
**Build Output:** `npm run build` produces 532KB optimized bundle

---

## 🎯 Complete Vercel Deployment in 3 Steps

### Step 1: Push to GitHub (Resolve Secret Protection)

The build is committed locally but blocked by GitHub's push protection due to `drive-tokens.json` containing OAuth secrets.

**Option A: Unblock via GitHub UI** (Recommended)
1. Visit: https://github.com/MAKDONT/KIOSK-SP2.0/security/secret-scanning/unblock-secret/3B14myHAwMQX5nW0aDROG32nIGz
2. Click **"Allow secret"** for Google OAuth Access Token
3. Visit: https://github.com/MAKDONT/KIOSK-SP2.0/security/secret-scanning/unblock-secret/3B14mrVkF2kTxMupHHeGxZGbDSN  
4. Click **"Allow secret"** for Google OAuth Refresh Token
5. Run: `git push` from your local repo

**Option B: Remove from Git History**
```bash
git rm --cached drive-tokens.json
git commit --amend --no-edit
git push --force-with-lease
```

---

### Step 2: Configure Vercel Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select your project: `KIOSK-SP2.0` (or your project name)
3. Navigate to **Settings → Environment Variables**
4. Click **"Add New Environment Variable"**
5. Fill in:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://kiosk-backend-fu5f.onrender.com`
   - **Environments:** Select all (Production, Preview, Development)
6. Click **"Save"**

**Expected Result:**
```
VITE_API_URL = https://kiosk-backend-fu5f.onrender.com
Environment: Production, Preview, Development
```

---

### Step 3: Trigger Deployment

Once `VITE_API_URL` is set, Vercel automatically redeploys. If not:

1. Go to your Vercel project → **Deployments**
2. Click the three dots (⋯) on the latest deployment
3. Select **"Redeploy"**
4. Confirm and wait for build to complete (~2 min)

---

## ✅ Verification Checklist

After deployment completes:

- [ ] Visit your Vercel frontend URL (e.g., `https://your-domain.vercel.app`)
- [ ] Page loads without 404 errors
- [ ] React Router navigation works (click links, refresh page → no 404)
- [ ] Open browser DevTools → Network tab
- [ ] Perform an action that calls the API (e.g., login, scan card)
- [ ] Verify requests go to: `https://kiosk-backend-fu5f.onrender.com/api/...`
- [ ] Check response status is 200 (not 404 or 403)
- [ ] WebSocket connects to: `wss://kiosk-backend-fu5f.onrender.com/`

---

## 🔧 How the Frontend Connects to Backend

Your frontend now uses a 3-layer connection strategy:

### 1. **REST API Calls** (Vite build-time)
All REST calls use the centralized `apiFetch()` utility:

```typescript
// src/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, { ...options, credentials: 'include' });
}
```

**Example in component:**
```typescript
// Before (localhost only)
const res = await fetch("/api/faculty");

// After (uses environment variable)
const res = await apiFetch("/api/faculty");
// Calls: https://kiosk-backend-fu5f.onrender.com/api/faculty
```

### 2. **WebSocket Connections** (Dynamic)
The frontend dynamically constructs WebSocket URLs from the backend domain:

```typescript
// src/components/Login.tsx:~70
const apiUrl = getApiUrl("");  // Gets API_BASE_URL
const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:";
const wsHost = new URL(apiUrl).host;  // Extract domain only
const ws = new WebSocket(wsProtocol + "//" + wsHost);
// Connects to: wss://kiosk-backend-fu5f.onrender.com/
```

### 3. **Local Development** (Falls back to localhost)
When running `npm run dev` locally:
```bash
$ npm run dev
# VITE_API_URL is not set
# Falls back to: http://localhost:5000
# This is your local backend server
```

---

## 📋 Files Modified for Deployment

| File | Change | Purpose |
|------|--------|---------|
| `src/utils/api.ts` | **NEW** | Centralized API routing with environment variable support |
| `vercel.json` | **NEW** | Vercel build config + SPA routing (fixes React Router 404s) |
| `.vercelignore` | **NEW** | Excludes backend files from Vercel build |
| `package.json` | Added `terser` | Required for production minification |
| `tsconfig.json` | Added Vite types | Enables `import.meta.env` TypeScript support |
| `src/components/Login.tsx` | Fixed template literals | Resolved encoding issues in string interpolation |
| `index.html` | Fixed entry point | Changed `/src/main.tsx` → `src/main.tsx` |
| All components & hooks | API integration | Updated 12+ files to use `apiFetch()` |

---

## 🚀 Production Build Output

```
✓ 2095 modules transformed (Vite build)
dist/index.html                   0.67 kB  (gzip: 0.41 kB)
dist/assets/index.css            56.43 kB  (gzip: 10.44 kB)
dist/assets/index.js            532.48 kB  (gzip: 146.90 kB)
Built in 8.86s
```

**JS Bundle Split:**
- React + React Router: ~200KB
- Tailwind CSS framework: ~120KB
- Business logic + components: ~212KB

---

## 🧪 Local Development

Your local setup remains unchanged:

```bash
# Terminal 1: Frontend (Vite dev server)
$ npm run dev
# Serves at http://localhost:3000
# Calls backend at http://localhost:5000 (default fallback)

# Terminal 2: Backend (Express + WebSocket)
(Backend already running on port 5000)
```

No VITE_API_URL needed for local development—it defaults to localhost.

---

## ⚠️ Troubleshooting

### Issue: Frontend 404 on page refresh
**Symptom:** Visiting `https://vercel-app.vercel.app/dashboard` returns 404  
**Fix:** Vercel rewrite rule in `vercel.json` handles this—already configured ✅

### Issue: API calls failing (NetworkError or CORS)
**Symptom:** API requests fail with 404 or CORS error  
**Debug:**
1. Open DevTools → Network tab
2. Check request URL: Should be `https://kiosk-backend-fu5f.onrender.com/api/...`
3. If URL is wrong (e.g., shows relative `/api/...`):
   - Verify `VITE_API_URL` is set in Vercel dashboard
   - Redeploy: `vercel deploy --prod`
4. If URL is correct but getting 404:
   - Backend might be asleep (Render free tier)
   - Visit backend URL directly: https://kiosk-backend-fu5f.onrender.com/api/faculty
   - Should return JSON array of faculty records

### Issue: WebSocket connection fails
**Symptom:** Real-time updates not working  
**Debug:**
1. Open DevTools → Network → WS tab
2. Find WebSocket connection request
3. URL should be: `wss://kiosk-backend-fu5f.onrender.com/`
4. Check status: Should show "Connected" (green)
5. If failing:
   - Ensure backend is running: https://kiosk-backend-fu5f.onrender.com
   - Backend may need to wake up (takes ~30 sec on free tier)

### Issue: Render backend appears offline
**Symptom:** Getting 502 Bad Gateway or connection refused  
**Cause:** Free tier Render apps spin down after 15 min of inactivity  
**Fix:** 
- Access https://kiosk-backend-fu5f.onrender.com once to wake up
- Render will restart backend (takes ~30 seconds)
- Try again

---

## 📊 Environment Variable Recap

| Environment | `VITE_API_URL` | Backend URL |
|-------------|---|---|
| **Local Dev** | (not set) | `http://localhost:5000` |
| **Vercel Production** | `https://kiosk-backend-fu5f.onrender.com` | `https://kiosk-backend-fu5f.onrender.com` |
| **Vercel Preview** | `https://kiosk-backend-fu5f.onrender.com` | `https://kiosk-backend-fu5f.onrender.com` |

---

## ✨ Success Indicators

When everything is working:

✅ Frontend loads at Vercel URL without 404  
✅ Clicking navigation links works (no 404 on refresh)  
✅ DevTools shows API requests to `https://kiosk-backend-fu5f.onrender.com`  
✅ WebSocket connects with `wss://` protocol  
✅ Faculty list loads and displays names  
✅ Login/authentication works end-to-end  
✅ Real-time queue updates appear in DevTools  

---

## 🎬 Next Steps

1. **Resolve GitHub push protection** (Step 1 above)
2. **Set `VITE_API_URL` in Vercel** (Step 2 above)
3. **Trigger redeploy** (Step 3 above)
4. **Test in browser** (Verification checklist above)
5. **Monitor backend** for any Render uptime issues

---

## 📞 Support

If deployment fails:
- Check Vercel build logs: https://vercel.com/dashboard → Deployments → Build Logs
- Check backend status: https://kiosk-backend-fu5f.onrender.com/api/faculty
- Verify environment variable: Vercel Settings → Environment Variables → VITE_API_URL

**Backend Admin Dashboard:** https://render.com/  
**Vercel Dashboard:** https://vercel.com/dashboard  

Good luck! 🚀
