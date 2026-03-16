# Architecture Decision: Vercel Frontend + Railway/Render Backend

## Executive Summary

**Decision:** Deploy React frontend to **Vercel** and Express backend to **Railway or Render**.

**Rationale:** Your current backend uses WebSockets and scheduled jobs, which are fundamentally incompatible with Vercel's serverless architecture.

---

## Why NOT Vercel for Your Backend?

### 1. WebSocket Support ❌

**Your code:**
```typescript
const wss = new WebSocketServer({ server });
```

**The problem:**
- Vercel functions timeout after 10-60 seconds
- WebSockets require persistent, long-lived connections
- Vercel is stateless—connections cannot survive function restarts
- CSP 2.0 (Vercel's constraint): Functions only handle HTTP/HTTPS requests

**The result:**
```
Client: Connect WebSocket
Vercel: Receives connection, starts function
Vercel: ~30 seconds later → Function timeout → Connection closed
Client: Sees "WebSocket closed"
```

### 2. Scheduled Jobs ❌

**Your code:**
```typescript
const scheduleQueueClear = () => {
  // Runs every 11:59 PM
};

const scheduleDriveCleanup = () => {
  // Runs periodically
};
```

**The problem:**
- `node-schedule` requires a running process
- Vercel functions are event-driven (only run when called)
- No process= no scheduler
- Between requests, the function is paused/destroyed

**The result:**
```
Time: 11:59 PM
Your scheduler: ❌ Not running (no active function)
Queue clearing: ❌ Doesn't happen
```

### 3. In-Memory State ❌

**Your code:**
```typescript
const adminSessions = new Map<string, {...}>(); // Store sessions in memory
const loginAttempts = new Map<string, {...}>();  // Rate limit tracking
```

**The problem:**
- Vercel creates new function instances for each request
- Each instance has fresh memory
- Sessions/rate-limits lost between requests

**The result:**
```
Request 1: Function A created, adminSessions = new Map()
Request 2: Function B created, adminSessions = new Map() (DIFFERENT instance)
Admin session from Req 1: ❌ Lost
```

### 4. WebSocket Broadcasting ❌

**Your code:**
```typescript
wss.clients.forEach((client) => {
  // Broadcast queue updates to all connected clients
});
```

**The problem:**
- Each Vercel function is isolated
- Clients connected to Function A can't receive messages from Function B
- No way to broadcast across instanced

**The result:**
```
Client 1 ↔️ Function A
Client 2 ↔️ Function B
Client 1 updates queue
Function A tries to broadcast to Client 2 via Function B: ❌ Can't reach
```

---

## Railway/Render: Why They Work ✅

### WebSockets ✅
- **Always-on server**: Same process runs continuously
- **Persistent connections**: Function doesn't timeout
- **Stateful**: Can maintain active WebSocket connections
- **Broadcasting**: All clients connected to same process can receive messages

### Scheduled Jobs ✅
- **Background process**: `node-schedule` runs while server is up
- **Timely execution**: Scheduled tasks trigger at exact times
- **No timeout**: Process doesn't reset between tasks

### In-Memory State ✅
- **Single instance**: One server = one in-memory store
- **Session persistence**: `adminSessions` Map persists across requests
- **Rate limiting**: Attempts tracked across all requests

---

## Deployment Comparison

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| **WebSockets** | ❌ No | ✅ Yes | ✅ Yes |
| **Scheduled Jobs** | ❌ No | ✅ Yes | ✅ Yes |
| **In-Memory State** | ❌ No | ✅ Yes | ✅ Yes |
| **Always-On** | ❌ No | ✅ Yes | ✅ Yes |
| **Free Tier** | ✅ Yes | ✅ $5/mo | ✅ No |
| **Startup Time** | ⚡ Instant | 🟡 10-30s | 🟡 10-30s |
| **Cold Starts** | ❌ Yes* | ❌ No | ❌ No |
| **Price for 24/7** | 💸 $20/mo | 💰 $5-20/mo | 💰 $7-24/mo |
| **Best For** | Static SPA | Always-on API | Always-on API |

*Vercel has cold starts on first request after inactivity

---

## Your Current Architecture Problems

### Problem 1: HTTP-based import wrongly installed
```json
❌ "http": "^0.0.1-security",
❌ "crypto": "^1.0.1",
```

These are **built-in Node.js modules**, not npm packages. The npm versions are deprecated wrappers.

**Fix:** Use Node.js built-ins
```typescript
✅ import * as http from 'http';
✅ import * as crypto from 'crypto';
```

**Status:** ✅ FIXED

---

### Problem 2: Single Server Can't Run on Vercel
You have a single hybrid server:
```typescript
const server = http.createServer(app);        // HTTP server
const wss = new WebSocketServer({ server });  // WebSocket server
server.listen(PORT);                           // Starts server
```

This **requires a always-on process** ↔️ **Vercel doesn't support this**.

**Solution:** Split responsibility
```
Frontend (React Router) → Vercel         (Stateless, event-driven)
Backend (Express + ws)   → Railway       (Stateful, always-on)
```

**Status:** ✅ FIXED (see VERCEL_DEPLOYMENT.md)

---

### Problem 3: React Router Routes Return 404
When you refresh on a sub-route (e.g., `/dashboard/settings`):
- Vercel receives request for `/dashboard/settings`
- No file at `dist/dashboard/settings`
- Vercel returns 404

**Why it happens:**
- Traditional servers serve files from filesystem
- React Router is client-side; all routes exist in `index.html`

**Solution:** 
```json
// vercel.json - rewrite URLs to index.html
{
  "rewrites": [
    {
      "source": "/:path((?!.*\\.).*)",
      "destination": "/index.html"
    }
  ]
}
```

This says: "All routes without a file extension → serve index.html"

**Status:** ✅ FIXED

---

## Migration Path (What We Did)

### 1. ✅ Cleaned up package.json
Removed deprecated `crypto` and `http` npm packages

### 2. ✅ Fixed imports in server.ts
```diff
- import http from "http";
- import crypto from "crypto";
+ import * as http from "http";
+ import * as crypto from "crypto";
```

### 3. ✅ Created vercel.json
Configured SPA routing and build settings for Vercel

### 4. ✅ Updated vite.config.ts
Added proper build output configuration

### 5. ✅ Documented deployment steps
See VERCEL_DEPLOYMENT.md for full instructions

---

## Next Steps

### For Frontend (Vercel)
1. Add `VITE_API_URL` environment variable
2. Update React components to call backend APIs
3. Deploy to Vercel

### For Backend (Railway/Render)
1. Choose Railway (recommended) or Render
2. Connect GitHub repository
3. Add environment variables
4. Update CORS in `server.ts`
5. Deploy

### Local Development
```bash
# Terminal 1: Frontend dev server
npm run dev

# Terminal 2: Backend dev server
npm start
```

Then set `VITE_API_URL=http://localhost:5000` in your dev environment.

---

## Security Notes

### ✅ Before
- In-memory admin sessions (lost on crashes)
- Rate limiting state (lost between restarts)
- No environment variable isolation

### ✅ After
- Use persistent session storage (Database) for multi-instance deployments
- Rate limiting persisted in Redis or database
- Secrets managed via provider dashboards (Vercel + Railway)
- CORS restricted to exact frontend domain

---

## FAQ

**Q: Can I use Vercel's API Routes?**
A: Yes, but not for WebSockets or scheduled jobs. If you split your architecture, API routes become unnecessary.

**Q: Does Railway/Render support HTTPS?**
A: Yes, both provide automatic HTTPS certificates.

**Q: Can I keep everything on Vercel?**
A: Only if you remove WebSockets and scheduled jobs, and move sessions/state to a database.

**Q: How much will Railway/Render cost?**
A: Railway~$5-20/mo, Render ~$7-24/mo (For always-on instances)

**Q: Will my site go slower with separate domains?**
A: No, it's actually faster because Vercel has CDN edge locations worldwide.

---

## References

- **Vercel Docs:** https://vercel.com/docs/concepts/functions/serverless-functions
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs/web-services
- **WebSocket Limitations:** https://vercel.com/docs/concepts/performance/streaming
