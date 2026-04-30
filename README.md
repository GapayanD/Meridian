# Meridian

A feature-dense, secure, and beautiful e-commerce marketplace designed for high conversion and mobile-first users.

## Features

- 🛒 **E-commerce Platform**: Complete marketplace with product listings, categories, and shopping cart
- 🛍️ **Cart Persistence**: Shopping cart state is maintained across sessions
- 🔍 **Product Search**: Search functionality for finding products
- 📱 **Mobile-First Design**: Responsive design optimized for mobile devices
- 🔐 **Supabase Integration**: Backend services for authentication and data storage
- 🎨 **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- ⚡ **Fast Performance**: Powered by Vite for quick development and builds

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Icons**: Lucide React
- **Animations**: Motion
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Meridian
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings → API
   - Copy your project URL and anon/public key

4. Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Update the Supabase configuration in `src/lib/supabase.ts` with your credentials, or use environment variables.

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Banner.tsx
│   ├── CategoryGrid.tsx
│   ├── Header.tsx
│   ├── Layout.tsx
│   ├── MobileNav.tsx
│   └── ProductCard.tsx
├── context/             # React context providers
│   └── CartContext.tsx
├── data/                # Mock data and constants
│   └── mock.ts
├── lib/                 # Utility libraries
│   ├── supabase.ts
│   └── utils.ts
├── pages/               # Page components
│   ├── Cart.tsx
│   ├── CategoryDetail.tsx
│   ├── Home.tsx
│   ├── ProductDetail.tsx
│   ├── Wishlist.tsx
│   └── Profile.tsx
└── types/               # TypeScript type definitions
    └── index.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Clean build directory
- `npm run lint` - Run TypeScript type checking

## License

This project is licensed under the Apache-2.0 License.
