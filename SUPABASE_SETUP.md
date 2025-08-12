# Fix Email Verification Redirect

## The Issue
When users verify their email, they're being redirected to localhost instead of your production URL.

## Quick Fix in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - https://supabase.com/dashboard/project/gdnoynprtbhgzhppexaz

2. **Navigate to Authentication → URL Configuration**

3. **Update the Site URL:**
   - Change from: `http://localhost:3000` (or similar)
   - Change to: `https://focus-timer-app.vercel.app` (or your actual Vercel URL)

4. **Update Redirect URLs:**
   Add your production URL to the allowed redirect URLs:
   ```
   https://focus-timer-app.vercel.app
   https://focus-timer-app.vercel.app/*
   https://*.vercel.app/*
   ```

5. **Save the changes**

## Alternative: Update in Code

If you want to handle this programmatically, update the auth calls in `AuthContext.tsx`:

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: