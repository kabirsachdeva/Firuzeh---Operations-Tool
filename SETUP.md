# Firuzeh OMS - Complete Setup Guide

## Quick Start (5 minutes)

### Step 1: Clone & Install

```bash
git clone https://github.com/kabirsachdeva/Firuzeh---Operations-Tool.git
cd Firuzeh---Operations-Tool
npm install
```

### Step 2: Create Supabase Database Tables

1. Go to your Supabase project: https://app.supabase.com
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste and run the SQL from DEPLOYMENT.md

### Step 3: Start Development Server

```bash
npm run dev
```

Your app is now running! The terminal shows the URL.

## Key Features

- ✅ Auto-generated job numbers (FRZ-001, FRZ-002, etc.)
- ✅ Real-time profit calculations
- ✅ Cost tracking by stage
- ✅ Smart search & filtering
- ✅ Excel export in one click
- ✅ PWA for mobile installation
- ✅ Works offline with service worker

## Database Connection

Already configured in `src/lib/supabase.js`:
- **Project**: https://ivzccafiiqpenedfnrxv.supabase.co
- **Tables**: orders, costs, stage_history

No additional setup needed unless using custom Supabase.

## Deployment

Ready to deploy to Vercel (easiest):

1. Push to GitHub
2. Go to vercel.com → Import repository  
3. Click Deploy
4. Your app is live!

See DEPLOYMENT.md for detailed instructions.
