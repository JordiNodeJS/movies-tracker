# Vercel Environment Variables Configuration

This file documents the exact environment variables needed for production deployment.

## Critical Variables for Production

### 1. DATABASE_URL

**Purpose**: Connection string to Neon PostgreSQL database  
**Required**: YES (without this, authentication and data operations fail)  
**Format**: PostgreSQL connection string with schema specification  
**Value Example**:

```
postgresql://neondb_owner:<REDACTED_NEON_PASSWORD>@<REDACTED>/neondb?sslmode=require&channel_binding=require&options=-csearch_path%3D%22movies-tracker%22
```

**Where to find**:

- Open `.env.local` in the project root
- Copy the entire `DATABASE_URL=...` value
- Paste into Vercel Settings → Environment Variables

**Common issues**:

- ❌ Using old/expired credentials → regenerate in Neon console
- ❌ Missing `search_path` parameter → schema access fails
- ❌ Incorrect encoding of quotes in `search_path` → use exactly: `%3D%22movies-tracker%22`

---

### 2. JWT_SECRET

**Purpose**: Secret key for signing JWT authentication tokens  
**Required**: YES (without this, user authentication fails with 500 error)  
**Format**: Random string of at least 32 characters  
**Example**:

```
your-32-character-random-secret-key-here1234
```

**How to generate a secure one**:

```bash
# macOS/Linux
openssl rand -hex 32

# Node.js (cross-platform)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Important**:

- ⚠️ Use a **different secret** for production than development
- 🔒 Never expose this value in git or public code
- 🔄 Changing this value will invalidate all existing tokens (users will need to login again)

---

### 3. TMDB_READ_ACCESS_TOKEN

**Purpose**: Bearer token for TMDB API (movie data)  
**Required**: YES for full functionality (without it, movies won't load)  
**Format**: JWT token from TMDB  
**Value Example**:

```
eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDUxNzQwOTY5NzYzMWQ2MDEwN2E0ZjUyMzFlNmM3MiIsIm5iZiI6MTc2NjQ0NDkxNC42ODMsInN1YiI6IjY5NDljZjcyNmQzNjU2MDBmYWZiMWE0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NowHJhmYPsvo9a4eyHKCBX60RdFmHk6-4H9DlFIYuwU
```

**Where to find**:

- Open `.env.local` in the project root
- Copy the entire `TMDB_READ_ACCESS_TOKEN=...` value

---

## Optional Variables

### TMDB_API_KEY

**Purpose**: Fallback TMDB API key (if READ_ACCESS_TOKEN is not available)  
**Required**: NO (only if TMDB_READ_ACCESS_TOKEN is missing)  
**Format**: Hex string

---

## Setup Instructions for Vercel

### Method 1: Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your **movies-tracker** project
3. Click **Settings** in the top navigation
4. Select **Environment Variables** from the left sidebar
5. For each variable (DATABASE_URL, JWT_SECRET, TMDB_READ_ACCESS_TOKEN):
   - Click **Add New**
   - **Key**: Enter the variable name
   - **Value**: Enter the secret value
   - **Environments**: Check `Production`, `Preview`, and `Development`
   - Click **Save**
6. Wait 30 seconds for the page to refresh
7. You should see all 3 variables listed

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
cd /g/DEV/LAB/movies-tracker
vercel link

# Add environment variables (you'll be prompted for values)
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add TMDB_READ_ACCESS_TOKEN

# Redeploy to apply changes
vercel --prod
```

### Method 3: vercel.json Configuration

Add this to `vercel.json` (already exists in your project):

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "env": [
    "DATABASE_URL",
    "JWT_SECRET",
    "TMDB_READ_ACCESS_TOKEN",
    "TMDB_API_KEY"
  ]
}
```

---

## Verification Checklist

After adding environment variables to Vercel:

- [ ] All 3 required variables are in Vercel Settings → Environment Variables
- [ ] Each variable is assigned to `Production`, `Preview`, and `Development` environments
- [ ] Vercel shows a green checkmark next to each variable
- [ ] At least 3 minutes have passed since the last deployment
- [ ] Visit https://movies-trackers.vercel.app/register
- [ ] Try to create a new account
- [ ] Should redirect to /login without HTTP 500 error
- [ ] Try to login with the account you just created
- [ ] Should redirect to home page without HTTP 500 error

---

## Troubleshooting

| Symptom                          | Likely Cause                          | Solution                                   |
| -------------------------------- | ------------------------------------- | ------------------------------------------ |
| **HTTP 500 on /register**        | DATABASE_URL not configured           | Add DATABASE_URL to Vercel env vars        |
| **HTTP 500 on /login**           | JWT_SECRET not configured             | Add JWT_SECRET to Vercel env vars          |
| **Movies not loading**           | TMDB_READ_ACCESS_TOKEN not configured | Add TMDB token to Vercel env vars          |
| **"Database connection failed"** | CONNECTION string is wrong            | Double-check DATABASE_URL format           |
| **"Invalid credentials" always** | JWT_SECRET mismatch                   | Ensure same secret is used for sign/verify |
| **Changes not reflected**        | Deployment cache                      | Click "Redeploy" in Vercel dashboard       |

---

## Security Notes

🔒 **Best Practices**:

1. **Never commit secrets to git**
   - `.env.local` is already in `.gitignore` ✅
   - Only configure secrets in Vercel dashboard

2. **Use different secrets for different environments**
   - Development: Use current `.env.local` values
   - Production: Generate new, strong secrets

3. **Rotate secrets periodically**
   - JWT_SECRET should be rotated every 6 months
   - DATABASE_URL if credentials are compromised

4. **Monitor access**
   - Check Vercel Deployment Logs for errors
   - Check Neon Console for connection attempts
   - Monitor TMDB API usage

5. **Secret Expiration**
   - Neon database passwords never expire
   - TMDB tokens may expire (check TMDB dashboard)
   - JWT tokens are session-based (7 days default)

---

## Performance Notes

After configuration, the application should:

- Load in < 2 seconds globally (Vercel Edge Network)
- Database queries should be < 200ms (Neon serverless)
- TMDB API calls cached for optimal performance

Monitor performance in Vercel Analytics:

1. Project Dashboard → Analytics
2. Look for Web Vitals and Performance Metrics
3. Check for any 500 errors in the Functions section
