# Supabase Authentication Setup Instructions

## Overview
I've successfully integrated Supabase authentication into your Crebit application. Users can now sign up, log in, and their information will be stored in Supabase along with their UnblockPay customer ID.

## What Was Implemented

### 1. **Supabase Client Configuration**
- Created `/src/lib/supabase.ts` with Supabase client initialization
- Added environment variables to `.env.local`

### 2. **Authentication Service**
- Created `/src/services/authService.ts` with methods for:
  - `signup()` - Creates Supabase auth user, UnblockPay customer, and saves profile
  - `login()` - Authenticates users with email/password
  - `logout()` - Signs users out
  - `getCurrentUser()` - Gets current authenticated user
  - `getUserProfile()` - Retrieves user profile from database

### 3. **Login & Signup Pages**
- Created `/src/pages/Login.tsx` - Clean login form
- Updated `/src/pages/Signup.tsx` - Multi-step signup with Supabase integration
- Added routes in `App.tsx` for `/login` and `/signup`

### 4. **Header Updates**
- Added "ACCOUNTS" dropdown button with:
  - "Log In" option → `/login`
  - "Sign Up" option → `/signup`

## Required: Supabase Database Setup

You need to create the `user_profiles` table in your Supabase database:

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL

This will create:
- `user_profiles` table with all necessary fields
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic timestamp updates

## Environment Variables

Already configured in `.env.local`:
```
VITE_SUPABASE_URL=https://ywicjcey0kj2vuafm2semvw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How It Works

### Signup Flow:
1. User fills out signup form (4 steps: account, personal info, address, optional bank)
2. `authService.signup()` is called which:
   - Creates Supabase auth user with email/password
   - Creates UnblockPay customer via API
   - Saves user profile to `user_profiles` table with UnblockPay customer ID
3. User is redirected to login page
4. Success toast notification shown

### Login Flow:
1. User enters email and password
2. `authService.login()` authenticates with Supabase
3. User is redirected to `/dashboard`
4. User session is maintained across page refreshes

## Testing

1. **Sign Up**: Go to `/signup` and create a new account
2. **Log In**: Go to `/login` and sign in with your credentials
3. **Check Database**: Verify user profile was created in Supabase

## Next Steps (Optional)

If you want to add protected routes:
- Create an auth context provider to manage user state
- Add route guards to protect authenticated pages
- Display user info in header when logged in
- Add logout functionality to header dropdown

## Files Created/Modified

**New Files:**
- `/src/lib/supabase.ts`
- `/src/services/authService.ts`
- `/src/pages/Login.tsx`
- `supabase-schema.sql`
- `SETUP_INSTRUCTIONS.md`

**Modified Files:**
- `/src/pages/Signup.tsx` - Integrated Supabase auth
- `/src/components/layout/Header.tsx` - Added ACCOUNTS dropdown
- `/src/App.tsx` - Added `/login` route
- `/.env.local` - Added Supabase credentials
- `/.env.example` - Added Supabase variable templates

## Important Notes

- User passwords are securely hashed by Supabase Auth
- Email confirmation is disabled by default (can be enabled in Supabase settings)
- UnblockPay customer ID is stored with each user profile
- All user data follows Row Level Security policies
