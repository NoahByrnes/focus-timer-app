# Focus Timer - Production-Ready Pomodoro App

A modern, production-ready Pomodoro timer application with task management, real-time syncing, and user authentication.

## Features

✅ **User Authentication**: Secure email/password authentication with Supabase Auth  
✅ **Real-time Data Sync**: All data syncs in real-time across devices  
✅ **Task Management**: Create, edit, and organize tasks with tags  
✅ **Time Tracking**: Track focus sessions for each task  
✅ **Tag System**: Color-coded tags for organizing tasks  
✅ **Responsive Design**: Clean, modern UI built with Tailwind CSS  
✅ **Production Ready**: Row Level Security, proper error handling, and TypeScript  

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Routing**: React Router v7
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)

### 2. Clone and Install

```bash
git clone <repository-url>
cd kairu-clone
npm install
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run the SQL from `supabase_schema.sql` to create tables and policies
4. Enable email authentication in Authentication > Providers
5. Get your project URL and anon key from Settings > API

### 4. Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

## Database Schema

The app uses three main tables:

- **tags**: User's task categories with colors
- **todos**: Tasks with completion status and time tracking
- **sessions**: Individual focus sessions linked to tasks

All tables have:
- Row Level Security (RLS) enabled
- User isolation (each user sees only their data)
- Proper indexes for performance
- Real-time subscriptions enabled

## Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ User data isolation
- ✅ Secure authentication with Supabase Auth
- ✅ Environment variables for sensitive data
- ✅ HTTPS only in production
- ✅ SQL injection protection via parameterized queries

## Usage

1. **Sign Up**: Create an account with email/password
2. **Create Tags**: Organize tasks with color-coded tags
3. **Add Tasks**: Create tasks and assign them to tags
4. **Start Timer**: Select a task and start focusing
5. **Track Progress**: View session history and total time per task

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT

## Support

For issues or questions, please open a GitHub issue.