# ✅ Complete Deployment Checklist - CORS Fixed

Your backend CORS and frontend API defaults have been patched. Now complete these final steps:

---

## 📋 Environment Variables Setup

### Backend (Render) - Set ALLOWED_ORIGINS

1. **Go to Render Dashboard:** https://render.com/dashboard
2. **Select Service:** kiosk-backend (or your backend service name)
3. **Go to Settings → Environment**
4. **Add/Update this variable:**
   ```
   ALLOWED_ORIGINS=https://earist-queue-management-system.vercel.app,*.vercel.app,http://localhost:5173
   ```
5. **Click Save** (auto-redeploys)
6. **Wait for deploy to complete** (check "Latest Deploy")

**Example value breakdown:**
- `https://earist-queue-management-system.vercel.app` - Your Vercel production domain
- `*.vercel.app` - All Vercel preview deployments
- `http://localhost:5173` - Local development with Vite

---

### Frontend (Vercel) - Verify VITE_API_URL

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Select Project:** earist-queue-management-system
3. **Go to Settings → Environment Variables**
4. **Verify this variable exists:**
   ```
   VITE_API_URL = https://kiosk-backend-fu5f.onrender.com
   ```
   ⚠️ **IMPORTANT:** Must be `https://` NOT `http://`

5. **If not set or incorrect:**
   - Add/Update the variable
   - Save
   - Go to Deployments → Redeploy latest
6. **Wait for build to complete**

---

## 🔄 Redeploy Steps

### Step 1: Backend Redeploy (Render)
```
1. Go to: https://render.com/dashboard
2. Select: kiosk-backend service
3. When ALLOWED_ORIGINS saved → Auto-redeploys
4. Wait for status: "Live"
5. Test: https://kiosk-backend-fu5f.onrender.com/api/health
   Should show: {"status":"ok"}
```

### Step 2: Frontend Redeploy (Vercel)
```
1. Go to: https://vercel.com/dashboard
2. Select: earist-queue-management-system
3. Click: Deployments tab
4. Find: Latest deployment
5. Click: ⋯ (three dots) → Redeploy
6. Wait for: Build to complete (~2-3 min)
7. Test: https://earist-queue-management-system.vercel.app
```

---

## 🧪 Verification Tests

Once both are redeployed:

### Test 1: Backend Health
```bash
curl https://kiosk-backend-fu5f.onrender.com/api/health
```
**Expected:** `{"status":"ok"}` (200)

### Test 2: Browser Network Test
1. Open: https://earist-queue-management-system.vercel.app
2. Open DevTools: F12
3. Go to Console tab
4. Should see **NO errors**
5. Go to Network tab
6. Perform any action (login, navigate, etc.)
7. Click on any API request
8. Should show:
   - **Request URL:** `https://kiosk-backend-fu5f.onrender.com/api/...`
   - **Status:** 200/201 (NOT 405/404)
   - **Headers → Access-Control-Allow-Origin:** `https://earist-queue-management-system.vercel.app`

### Test 3: Console for CORS Errors
After redeploy, check browser console:
- ✅ Should be **CLEAN** (no red errors)
- ❌ Should NOT see: `"Failed to fetch"` or `"CORS policy"`

---

## 📊 Quick Reference Table

| Component | Service | URL | What to Set |
|-----------|---------|-----|------------|
| **Backend API** | Render | https://kiosk-backend-fu5f.onrender.com | `ALLOWED_ORIGINS` in Render Settings |
| **Frontend App** | Vercel | https://earist-queue-management-system.vercel.app | `VITE_API_URL` in Vercel Settings |
| **Local Dev** | Localhost | http://localhost:3000 | None needed (uses defaults) |

---

## 🎯 Expected Results After Complete Setup

✅ Frontend loads without errors  
✅ API calls succeed (status 200)  
✅ OAuth flow works  
✅ Email notifications send  
✅ WebSocket connects  
✅ Real-time updates appear  
✅ No CORS warnings in console  

---

## 🚨 If You Still See Errors

### Error: "Failed to fetch"
1. Check browser console for exact error
2. Verify VITE_API_URL is set to https:// (not http://)
3. Hard refresh: `Ctrl+Shift+R`
4. Wait 60 seconds for Vercel CDN to update

### Error: "CORS policy"
1. Verify ALLOWED_ORIGINS includes your Vercel domain
2. Check that both redeployments completed successfully
3. Verify backend is returning proper CORS headers:
   ```bash
   curl -H "Origin: https://earist-queue-management-system.vercel.app" \
        https://kiosk-backend-fu5f.onrender.com/api/faculty -v
   ```

### Error: "405 Method Not Allowed"
1. Backend endpoint exists but your frontend URL points to wrong backend
2. Double-check VITE_API_URL is correctly set and redeployed
3. Check Network tab → see if calling wrong domain

---

## ✨ Next Steps After Fix

1. ✅ Set ALLOWED_ORIGINS on Render
2. ✅ Verify VITE_API_URL on Vercel (https://)
3. ✅ Redeploy both services
4. ✅ Test with verification tests above
5. ✅ Monitor browser console for errors
6. ✅ Done! Everything should work

---

## 📞 What Changed

**Backend (server.ts:496-520):**
- CORS now reads environment variable `ALLOWED_ORIGINS`
- Hostname-based wildcard matching (safe and predictable)
- Production self-check for same-app origins

**Frontend (src/utils/api.ts:13):**
- Added `credentials: 'include'` for cross-origin requests
- Ensures cookies/auth headers sent with API calls

**.env.example:63:**
- Documented ALLOWED_ORIGINS format
- Clear example for deployment

**Commit:** 8a4745c  
**Message:** `fix: resolve cross-origin fetch failures for vercel frontend`

---

**Ready? Start with Step 1: Set ALLOWED_ORIGINS on Render! 🚀**
