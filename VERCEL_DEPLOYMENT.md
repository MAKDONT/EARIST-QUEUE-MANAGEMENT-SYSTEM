# Vercel Deployment Guide: Frontend + Backend Separation

## Architecture Overview

Your application has been refactored for Vercel + Railway/Render deployment:

```
┌─────────────────────┐         ┌──────────────────────┐
│   Vercel (Frontend) │◄───────►│ Railway/Render       │
│   React 19 + Vite   │ HTTPS   │ Express + WebSocket  │
│   React Router 7    │         │ node-schedule        │
└─────────────────────┘         └──────────────────────┘
     (Static SPA)               (Always-on Server)
```

**Why this architecture?**
- ✅ **Vercel Frontend**: Perfect for static SPA, instant deploys, CDN, automatic HTTPS
- ✅ **Railway/Render Backend**: Supports WebSockets, persistent connections, scheduled jobs
- ❌ **Vercel Backend**: Cannot support WebSockets or always-running background jobs

---

## Step 1: Deploy Frontend to Vercel

### 1.1 Prerequisites
- Vercel account (free tier works)
- GitHub repo with your code (or connect Git)

### 1.2 Environment Variables (Vercel Dashboard)
Go to **Settings → Environment Variables** and add:

```
VITE_API_URL = https://your-backend-url.railway.app
```

Replace `your-backend-url` with your actual Railway/Render domain.

### 1.3 Deploy Steps
1. Connect your GitHub repository to Vercel
2. Vercel auto-detects Vite configuration
3. Click "Deploy"
4. Wait for build to complete

**That's it!** Your frontend is now on Vercel.

---

## Step 2: Update Frontend to Call Backend API

In your React components, use the environment variable to build API URLs:

### Example: Fetch data from backend

```typescript
// src/utils/api.ts (create this new file)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchQueue() {
  const response = await fetch(`${API_BASE_URL}/api/queue`);
  return response.json();
}

export async function updateQueue(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include', // Important: send cookies for auth
  });
  return response.json();
}

// Add headers for CORS if needed
export async function withAuth(url: string, options?: RequestInit) {
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
  });
}
```

### Example: Update component to use API

```typescript
// Changes needed in React components that call the backend
import { fetchQueue, updateQueue } from '@/utils/api';

function YourComponent() {
  useEffect(() => {
    fetchQueue().then(data => {
      // Use the data
    });
  }, []);
}
```

---

## Step 3: Deploy Backend to Railway or Render

### Option A: Railway (Recommended for Express + WebSocket)

1. **Push code to GitHub**
2. **Go to https://railway.app**
3. **Connect GitHub account**
4. **Create new project → Deploy from GitHub**
5. **Select your repository**
6. **Railway auto-detects `package.json` and `server.ts`**
7. **Add environment variables:**
   ```
   NODE_ENV = production
   PORT = 8000  (Railway assigns this automatically)
   SUPABASE_URL = <your-value>
   SUPABASE_KEY = <your-value>
   GOOGLE_CLIENT_ID = <your-value>
   # ... other env vars
   ```
8. **Deploy!**

**Your backend URL will be:** `https://yourapp-production.up.railway.app`

### Option B: Render

1. **Go to https://render.com**
2. **Create account → Connect GitHub**
3. **New Web Service**
4. **Select your repository**
5. **Set build command:** `npm install`
6. **Set start command:** `npm start`
7. **Add environment variables**
8. **Deploy!**

---

## Step 4: Update CORS Settings in Backend

Your `server.ts` needs to allow requests from Vercel domain.

**Find this in server.ts:**
```typescript
app.use((req, res, next) => {
  // ... existing CORS code
```

**Update to allow Vercel frontend:**
```typescript
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://your-domain.vercel.app',  // Your Vercel frontend
    'http://localhost:5173',            // Local dev
  ];
  
  if (allowedOrigins.includes(req.origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', req.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

---

## Step 5: Configure WebSocket Connection on Frontend

Update your WebSocket client to connect to backend:

```typescript
// src/hooks/useWebSocket.ts or similar
const WS_URL = import.meta.env.VITE_API_URL?.replace('https://', 'wss://') || 'ws://localhost:5000';

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    
    socket.onopen = () => {
      console.log('Connected to backend');
    };
    
    socket.onmessage = (event) => {
      // Handle messages
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    setWs(socket);
    
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);
  
  return ws;
}
```

---

## Step 6: Fix React Router SPA Routing

The `vercel.json` rewrite rule will handle this, but ensure your `index.html` has correct routing:

```tsx
// src/main.tsx
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
```

All non-matching routes will now fallback to `index.html` and React Router will handle them.

---

## Step 7: Verify Deployment

### Test Frontend
- Visit your Vercel URL: `https://your-app.vercel.app`
- Check console for API calls
- Verify all routes load without 404

### Test Backend Connection
```bash
# From your Vercel frontend console
fetch('https://your-backend-domain.railway.app/api/queue')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Test WebSocket Connection
```typescript
// In browser console
const ws = new WebSocket('wss://your-backend-domain.railway.app');
ws.onopen = () => console.log('Connected!');
```

---

## Environment Variables Summary

### Vercel Frontend (.env.production)
```
VITE_API_URL=https://your-backend.railway.app
```

### Railway/Render Backend (.env)
```
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SENDGRID_API_KEY=...
```

---

## Troubleshooting

### React Router returns 404 on refresh
✅ **Fixed**: `vercel.json` rewrite rules ensure `index.html` is served for all routes

### CORS errors when calling backend
✅ **Fixed**: Update Express CORS middleware with Vercel domain

### WebSocket connection fails
- Verify backend is running on Railway/Render
- Check `VITE_API_URL` is correct
- Ensure firewall allows WebSocket traffic
- Use `wss://` for HTTPS (Railway/Render both support this)

### Scheduled jobs not running
- Ensure backend is deployed to Railway/Render (not Vercel)
- `node-schedule` runs on the always-on server

### Environment variables not loading
- Vercel: Add via Dashboard (Settings → Environment Variables)
- Railway/Render: Add to `.env` or dashboard
- Restart deployment after adding vars

---

## Cleanup: What Changed

### ✅ Removed Deprecated Dependencies
- `crypto` (use Node.js built-in)
- `http` (use Node.js built-in)

### ✅ Updated Files
- `package.json`: Removed `crypto`, `http`
- `server.ts`: Changed imports to use Node.js built-ins
- `vite.config.ts`: Added build output configuration
- `vercel.json`: Created for SPA routing

### ✅ Configuration
- All routes in React Router now work on Vercel
- Backend APIs remain on Railway/Render with full WebSocket + scheduling support

---

## Quick Start Checklist

- [ ] Update `VITE_API_URL` in Vercel environment variables
- [ ] Deploy backend to Railway/Render
- [ ] Update CORS in `server.ts` with Vercel domain
- [ ] Update frontend WebSocket client to use backend URL
- [ ] Test frontend deployment
- [ ] Test backend API calls from frontend
- [ ] Test WebSocket connection

---

## Need Help?

### Vercel
- Docs: https://vercel.com/docs
- Build logs: Vercel Dashboard → Deployments

### Railway
- Docs: https://docs.railway.app
- WebSocket support: Yes ✅

### Render
- Docs: https://render.com/docs
- WebSocket support: Yes ✅

---

## Production Checklist

Before deploying to production:

- [ ] All env vars added to Vercel + Railway/Render
- [ ] Backend CORS updated with production frontend URL
- [ ] WebSocket uses `wss://` (secure)
- [ ] API calls use `VITE_API_URL` environment variable
- [ ] Credentials included in fetch: `credentials: 'include'`
- [ ] No hardcoded `localhost` URLs
- [ ] TypeScript builds without errors: `npm run lint`
- [ ] Test on production domains (not localhost)
