# Fix "Failed to load data" Error

## Issue
The app is deployed but can't fetch data from Supabase, showing "Error: Failed to load data"

## Solution Steps

### 1. Enable Supabase CORS for your domain

In your Supabase Dashboard:

1. Go to **Settings → API**
2. Under **CORS Allowed Origins**, add:
   ```
   https://focus-timer-app-seven.vercel.app
   https://*.vercel.app
   ```
3. Click **Save**

### 2. Check RLS Policies

The issue might be that the RLS policies are blocking access. In Supabase SQL Editor, run:

```sql
-- Temporarily disable RLS to test (NOT for production!)
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
```

If this fixes it, re-enable RLS and update policies:

```sql
-- Re-enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tags" ON tags;
DROP POLICY IF EXISTS "Users can create their own tags" ON tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON tags;

DROP POLICY IF EXISTS "Users can view their own todos" ON todos;
DROP POLICY IF EXISTS "Users can create their own todos" ON todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON todos;

DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions;

-- Create new policies that handle both authenticated and unauthenticated states
-- Tags policies
CREATE POLICY "Enable all operations for authenticated users on tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

-- Todos policies  
CREATE POLICY "Enable all operations for authenticated users on todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Enable all operations for authenticated users on sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Quick Fix - Update the code to handle auth better

Update `/src/context/TodoContext.tsx` at line 166-171:

```typescript
const loadData = async () => {
  try {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Don't show error for unauthenticated users
      setLoading(false);
      setTodos([]);
      setTags([]);
      return;
    }
```

### 4. Verify Environment Variables in Vercel

1. Go to your Vercel project settings
2. Click on **Environment Variables**
3. Make sure these are set:
   ```
   VITE_SUPABASE_URL=https://gdnoynprtbhgzhppexaz.supabase.co
   VITE_SUPABASE_ANON_KEY=[your key]
   ```
4. Redeploy if you add/change them

### 5. Check Browser Console

Open browser DevTools (F12) and check the Console for specific error messages. Common issues:
- CORS errors → Fix in Supabase settings
- 401 Unauthorized → RLS policy issue
- Network errors → Check Supabase URL

## Immediate Fix

The quickest fix is to run this SQL in your Supabase dashboard:

```sql
-- Allow authenticated users to manage their own data
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Then re-enable with simpler policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can do everything with their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can do everything with their own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can do everything with their own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);
```