# Quick Start Guide

Follow these steps to get your Excavation ERP running in under 10 minutes!

## Step 1: Set Up Supabase (3 minutes)

1. Go to https://supabase.com and create a free account
2. Create a new project (give it any name you like)
3. Wait for the project to initialize (~2 minutes)
4. Go to SQL Editor (left sidebar) and run the `database-schema.sql` file from this project
5. Go to Settings → API and copy:
   - Project URL
   - anon/public key

## Step 2: Configure Your App (2 minutes)

1. In this project folder, copy `.env.example` to `.env`
2. Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 3: Create a User (1 minute)

1. In Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Create a user with email and password
4. This will be your login credentials!

## Step 4: Run the App (1 minute)

```bash
cd c:\Users\alexd\Desktop\ERP\excavation-erp-new
npm run dev
```

Open http://localhost:5173 (or the port shown in terminal)

## Step 5: Start Using It!

1. Log in with the credentials you created
2. Add your first client
3. Create a project
4. Start tracking!

---

**That's it! You're ready to manage your excavation business.**

For detailed documentation, see [README.md](README.md)
