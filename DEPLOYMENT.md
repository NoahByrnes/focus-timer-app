# Deployment Instructions

## Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `focus-timer-app` (or your preferred name)
   - Description: "Production-ready Pomodoro timer with task management, real-time sync, and authentication"
   - Set to **Public** (or Private if you prefer)
   - DO NOT initialize with README, .gitignore, or license
   - Click "Create repository"

2. **Push your local repository:**
   ```bash
   git remote add origin https://github.com/noahbyrnes/focus-timer-app.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select `focus-timer-app` repository
   - Click "Import"

3. **Configure Build Settings:**
   - Framework Preset: **Vite** (should auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Set Environment Variables:**
   Click "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL=https://gdnoynprtbhgzhppexaz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbm95bnBydGJoZ3pocHBleGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzY2MDIsImV4cCI6MjA3MDYxMjYwMn0._HWHaWmrU_CY0wjZaaBKZBS6GC5M9xnsY2z-L49tATg
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment (usually 1-2 minutes)
   - Your app will be live at: `https://focus-timer-app.vercel.app`

## Step 3: Set up Supabase (if not done already)

1. **Run the SQL schema:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Create a new query
   - Copy and paste the contents of `supabase_schema.sql`
   - Click "Run"

2. **Enable Email Authentication:**
   - Go to Authentication → Providers
   - Enable "Email" provider
   - Configure email templates if desired

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Create a new account
3. Test all features:
   - Create tags
   - Add todos
   - Start timer sessions
   - Verify real-time sync (open in two tabs)

## Alternative: Deploy with Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project name? focus-timer-app
# - In which directory is your code located? ./
# - Want to override settings? No
```

## Troubleshooting

- **Build fails:** Check Node version (should be 18+)
- **Auth not working:** Verify Supabase environment variables
- **Database errors:** Ensure SQL schema was run successfully
- **Real-time not working:** Check Supabase Realtime is enabled

## Your URLs

Once deployed, you'll have:
- **Production:** `https://focus-timer-app.vercel.app`
- **Preview:** Created for each git branch
- **Analytics:** Available in Vercel dashboard

## Next Steps

1. Set up custom domain (optional)
2. Configure email templates in Supabase
3. Set up monitoring (Vercel Analytics)
4. Add error tracking (Sentry, etc.)