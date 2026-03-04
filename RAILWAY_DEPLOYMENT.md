# Railway Deployment Guide

## Fixed Issues
✅ Removed `better-sqlite3` (not used, caused compilation errors)
✅ Set Node.js requirement to >=20.0.0
✅ Added `.nvmrc` for Node version specification
✅ Added `nixpacks.toml` for Railway build configuration

## Prerequisites
- GitHub account with your repo pushed
- Railway account (railway.app)

## Steps to Deploy

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Fix Railway deployment - Node 20+ and remove better-sqlite3"
git push origin main
```

### 2. Connect Railway to GitHub
- Go to [Railway](https://railway.app)
- Click "New Project"
- Select "Deploy from GitHub repo"
- Authorize Railway with your GitHub account
- Select your repository

### 3. Configure Environment Variables
In Railway Dashboard:
1. Go to your project settings (gear icon)
2. Click "Variables"
3. Add all variables from `.env.local`:
   - `GMAIL_USER`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `GMAIL_APP_PASSWORD` (if needed as fallback)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV=production`
   - `GOOGLE_REDIRECT_URL=https://your-railway-domain.up.railway.app/auth/callback`

### 4. Update Callback URL
After Railway assigns a domain:
- Update `GOOGLE_REDIRECT_URL` with your Railway app URL
- Make sure it matches the OAuth app settings in Google Cloud

### 5. Deploy
- Railway auto-deploys on push to main
- Check deployment logs in the Railway dashboard
- Your app will be at: `https://your-app.up.railway.app`

## Troubleshooting

### Build Fails with Node Engine Errors
- The app now requires Node 20+
- Railway will automatically use Node 20 per `.nvmrc`
- If still failing, delete `node_modules` and `package-lock.json`, then push again

### Port Issues
The app now reads `PORT` from environment - Railway sets this automatically.

### OAuth Callback URL
Must match exactly what's registered in Google Cloud Console.

### Database Connection
Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct.

### Email Not Sending
1. Check if OAuth2 credentials are valid
2. Verify Gmail account is not restricted
3. Check Railway logs for error details

## File Structure for Deployment
- `railway.json` - Railway configuration
- `nixpacks.toml` - Nixpacks build configuration (Node 20 + npm ci)
- `Procfile` - Process file for Railway
- `.nvmrc` - Node version specification
- `.env.example` - Template for environment variables
- `package.json` - Updated with Node >=20 requirement and removed better-sqlite3

