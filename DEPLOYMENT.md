# Deployment Guide - Firuzeh OMS

## Deploy to Vercel (Easiest - 2 minutes)

### Step 1: Sign Up
Go to https://vercel.com and sign in with GitHub

### Step 2: Import Project
1. Click "Add New" → "Project"
2. Select your Firuzeh repository
3. Click "Import"

### Step 3: Deploy
1. Vercel auto-detects Vite configuration
2. Click "Deploy"
3. Wait 1-2 minutes
4. Your live URL appears!

**Your app is live!** Share the URL immediately.

## Supabase Database Setup (Required)

In Supabase SQL Editor, run:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  cloth_description TEXT NOT NULL,
  cloth_quantity DECIMAL NOT NULL,
  delivery_deadline DATE NOT NULL,
  pricing_mode TEXT NOT NULL,
  fixed_charge DECIMAL DEFAULT 0,
  final_charge DECIMAL DEFAULT 0,
  notes TEXT,
  current_stage TEXT NOT NULL DEFAULT 'Order Received',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  note TEXT
);

CREATE TABLE costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  note TEXT,
  date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_deadline ON orders(delivery_deadline);
CREATE INDEX idx_orders_is_completed ON orders(is_completed);
CREATE INDEX idx_costs_order_id ON costs(order_id);
CREATE INDEX idx_stage_history_order_id ON stage_history(order_id);
```

## Alternative: Deploy to Netlify

1. Go to netlify.com
2. Click "New site from Git"
3. Select your repository
4. Build command: `npm run build`
5. Publish: `dist`
6. Click "Deploy"

## Custom Domain

On Vercel: Settings → Domains → Add your domain
On Netlify: Settings → Domain → Connect custom domain

## Environment Variables (Optional)

If using custom Supabase:

1. Vercel: Project Settings → Environment Variables
2. Add: VITE_SUPABASE_URL and VITE_SUPABASE_KEY
3. Re-deploy

Or locally create `.env.local`:
```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_KEY=your-key
```

## Cost

- **Vercel**: Free (unlimited deployments)
- **Supabase Free**: 500MB database (plenty for years of orders)
- **Total**: $0/month forever

Upgrade to Pro tiers ($20-25/month) only if you need more.

---

**You're live! Time to start managing orders.**
