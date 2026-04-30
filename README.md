# Meridian Mart

> A mobile-first e-commerce marketplace built with React 19, TypeScript, Supabase, and Tailwind CSS 4. Features a full storefront, admin panel, and server-side order validation via Supabase Edge Functions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Edge Function Deployment](#edge-function-deployment)
- [Admin Setup](#admin-setup)
- [Project Structure](#project-structure)
- [Known Issues & Roadmap](#known-issues--roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Storefront
- Animated hero banner with auto-rotating slides
- Category grid with icon-based navigation
- Flash Sale section with live countdown timer
- Product cards with hover animations (Framer Motion)
- Full product detail page with image gallery, variant selector, and quantity picker
- Search across product names and descriptions
- Category filtering with skeleton loading states
- Wishlist page (UI ready, persistence coming)
- Guest profile page

### Cart & Checkout
- Persistent cart via `localStorage` (with Safari private mode fallback)
- Multi-variant item support — same product with different options stored separately
- Three delivery options (Standard, Express, Free Shipping)
- Client-side form validation (name, email, phone, address)
- XSS-safe input sanitization before submission
- Cash on Delivery (COD) order flow
- Order submission via Supabase Edge Function with **server-side price recalculation** — clients cannot spoof totals

### Admin Panel
- Supabase Auth–protected login (admin role verified against `admin_users` table)
- Orders dashboard: search, filter by status, update order status inline
- Order detail modal with full customer and item breakdown
- Products dashboard: add, edit, hide/show, delete products
- Variant builder for product options
- Image URL preview during product creation

### Security
- Prices are ignored from the client payload; the Edge Function fetches them from the database
- All user inputs sanitized (HTML tag stripping) before insertion
- Row Level Security (RLS) on all Supabase tables
- Admin access double-checked server-side on every session

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 (Vite plugin) |
| Animation | Motion (Framer Motion) |
| Routing | React Router DOM v7 |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| Icons | Lucide React |
| Utilities | clsx, tailwind-merge |

---

## Prerequisites

- **Node.js** v20 or higher
- **npm** v9 or higher
- A **Supabase** project (free tier works fine)
- Supabase CLI (only needed for Edge Function deployment)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/meridian-mart.git
cd meridian-mart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase credentials (see [Environment Variables](#environment-variables)).

### 4. Set up the database

Run the migration SQL in your Supabase project (see [Database Setup](#database-setup)).

### 5. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file in the project root. **Never commit this file — it is gitignored.**

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → `anon` `public` key |

> **Without these variables the app runs in demo mode** using local mock data. The cart, search, and navigation all work, but orders cannot be saved and the admin panel is non-functional.

---

## Database Setup

1. Open your Supabase project dashboard.
2. Go to **SQL Editor → New Query**.
3. Paste the entire contents of `supabase/migrations/001_schema.sql` and click **Run**.

This creates:

- `products` — authoritative product catalogue with pricing
- `orders` — customer orders written by the Edge Function
- `admin_users` — allow-list that maps Supabase Auth UIDs to admin access
- Row Level Security policies on all three tables
- `is_admin()` helper function used by RLS policies
- Auto-updating `updated_at` triggers

---

## Edge Function Deployment

The order validation logic runs as a Supabase Edge Function so that prices are always fetched from the database — the client payload is never trusted for totals.

```bash
# Install the Supabase CLI if you haven't already
npm install -g supabase

# Log in
supabase login

# Link to your project (find the project ref in your dashboard URL)
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy validate-order
```

The function source lives at `supabase/functions/validate-order/index.ts`.

---

## Admin Setup

After running the schema migration:

1. In the Supabase Dashboard go to **Authentication → Users → Add User** and create a user with an email and password.
2. Copy the UUID shown for that user.
3. In **SQL Editor** run:

```sql
INSERT INTO public.admin_users (id, email)
VALUES ('paste-uuid-here', 'admin@yourdomain.com');
```

4. Visit `/admin/login` in the app and sign in with those credentials.

---

## Project Structure

```
meridian-mart/
├── public/
├── src/
│   ├── components/
│   │   ├── Banner.tsx          # Auto-rotating hero slider
│   │   ├── CategoryGrid.tsx    # Icon category navigation
│   │   ├── Header.tsx          # Sticky nav with search
│   │   ├── Layout.tsx          # Page wrapper + footer
│   │   ├── MobileNav.tsx       # Bottom tab bar (mobile)
│   │   └── ProductCard.tsx     # Card with add-to-cart
│   ├── context/
│   │   └── CartContext.tsx     # Cart state + localStorage persistence
│   ├── data/
│   │   └── mock.ts             # Fallback data used when Supabase is not configured
│   ├── hooks/
│   │   └── useProducts.ts      # Supabase product fetching hooks
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client initialisation
│   │   └── utils.ts            # cn(), formatCurrency(), validators, sanitizeInput()
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx   # Auth guard + sidebar layout
│   │   │   ├── AdminLogin.tsx    # Email/password login form
│   │   │   ├── AdminOrders.tsx   # Orders table + status management
│   │   │   └── AdminProducts.tsx # Product CRUD
│   │   ├── Cart.tsx            # Cart review + checkout form
│   │   ├── CategoryDetail.tsx  # Filtered product grid + sidebar filters
│   │   ├── Home.tsx            # Landing page
│   │   ├── ProductDetail.tsx   # Image gallery + variant picker
│   │   ├── Profile.tsx         # Guest profile placeholder
│   │   └── Wishlist.tsx        # Wishlist placeholder
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces (Product, CartItem)
│   ├── App.tsx                 # Router + provider setup
│   ├── index.css               # Tailwind imports + CSS custom properties
│   └── main.tsx                # React DOM entry point
├── supabase/
│   ├── functions/
│   │   └── validate-order/
│   │       └── index.ts        # Deno Edge Function — server-side order validation
│   └── migrations/
│       └── 001_schema.sql      # Full database schema + RLS policies
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Remove the `dist/` directory |

---


## License

Licensed under the **Apache License 2.0**. See [LICENSE](./LICENSE) for full terms.

© 2026 GapayanD
