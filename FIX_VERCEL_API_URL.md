# 🔴 CRITICAL: Fix API URL on Vercel

## Problem
Your frontend deployed successfully to Vercel but API requests are failing because the backend URL is not configured.

**Evidence:**
```
POST https://earist-queue-management-system.vercel.app/api/admin/email 405 (Method Not Allowed)
```

The frontend is calling **Vercel's domain** (wrong) instead of **Render's domain** (correct):
- ❌ `https://earist-queue-management-system.vercel.app/api/admin/email` (Vercel frontend)
- ✅ `https://kiosk-backend-fu5f.onrender.com/api/admin/email` (Render backend)

---

## Solution: Set VITE_API_URL in Vercel

### Step 1: Open Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project: **earist-queue-management-system**
3. Click **Settings** (top navigation)

### Step 2: Add Environment Variable
1. Click **Environment Variables** (left sidebar)
2. Click **Add New** button
3. Fill in:
   ```
   Name:  VITE_API_URL
   Value: https://kiosk-backend-fu5f.onrender.com
   ```
4. Select Environments:
   - ☑ Production
   - ☑ Preview  
   - ☑ Development
5. Click **Save**

### Step 3: Redeploy
1. Go back to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Wait for build to complete (~2-3 minutes)

---

## Verification Checklist

Once redeploy completes:

1. ✅ Visit: https://earist-queue-management-system.vercel.app
2. ✅ Open DevTools (F12) → Console tab
3. ✅ Look for the error message - should be GONE
4. ✅ Open Network tab
5. ✅ Perform an action (login, save settings, etc.)
6. ✅ Verify API requests show:
   - URL: `https://kiosk-backend-fu5f.onrender.com/api/...`
   - Status: 200/201/204 (not 405/404)
7. ✅ Frontend loads data correctly

---

## Why This Happened

Your `src/utils/api.ts` reads the `VITE_API_URL` environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

- **During build on Vercel:** `VITE_API_URL` was not set, so it defaulted to `http://localhost:5000`
- **In production:** The relative API calls defaulted to the current domain (Vercel)
- **Solution:** Set `VITE_API_URL` before deploying so Vercel bakes it into the build

---

## Quick Reference

| Setting | Value |
|---------|-------|
| Environment Variable Name | `VITE_API_URL` |
| Value | `https://kiosk-backend-fu5f.onrender.com` |
| Environments | Production, Preview, Development |
| Action After Setting | Redeploy (via Deployments tab) |

---

## Troubleshooting

**Still seeing API errors after redeploy:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Wait 60 seconds for Vercel CDN to update
4. Visit Vercel dashboard → check that VITE_API_URL is showing in Environment Variables list

**Verify backend is accessible:**
```bash
curl https://kiosk-backend-fu5f.onrender.com/api/faculty
# Should return JSON array of faculty
```

**Check Vercel build logs:**
1. Vercel Dashboard → Deployments → Latest Deployment
2. Click **View Build Logs**
3. Search for `VITE_API_URL` - should show the environment variable was injected

---

## Expected After Fix

✅ API calls go to: `https://kiosk-backend-fu5f.onrender.com`  
✅ OAuth flow works  
✅ Email notifications sent successfully  
✅ Real-time queue updates via WebSocket  
✅ Google Meet integration functions  

**Redeploy now and you're done!** 🚀
