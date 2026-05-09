# CampusBite Admin Dashboard

Next.js 14+ admin dashboard for CampusBite cafeteria system.

## Features

- **Authentication**: JWT-based authentication with httpOnly cookies
- **Dashboard Overview**: Real-time metrics, charts, and recent orders
- **Menu Management**: CRUD operations for menu items and categories
- **Orders Management**: View, filter, and update order status
- **Users Management**: User verification and management
- **Payments**: Payment records and analytics
- **Analytics & Reports**: Sales reports and popular items
- **Demand Forecasts**: AI-powered demand predictions

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **UI Components**: Custom components with Tailwind

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_BASE_URL=https://your-ngrok-url.ngrok.io/api/v1
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages (protected)
│   └── api/               # API routes
├── components/            # React components
│   ├── layout/           # Layout components (Sidebar, Header)
│   ├── ui/               # Reusable UI components
│   ├── tables/            # Table components
│   └── charts/           # Chart components
├── lib/                   # Utilities and configurations
│   ├── api/              # API client and endpoints
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── stores/                # Zustand stores
```

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL
- `NEXT_PUBLIC_COOKIE_DOMAIN`: Cookie domain (default: localhost)
- `NEXT_PUBLIC_COOKIE_SECURE`: Use secure cookies (default: false for dev)

## Authentication

The app uses JWT tokens stored in httpOnly cookies for security. Tokens are automatically refreshed when they expire.

## Features Implemented

✅ **Authentication**
- JWT-based login with httpOnly cookies
- Protected routes with middleware
- Automatic token refresh

✅ **Dashboard Overview**
- Real-time metrics (orders, revenue, pending orders, active riders)
- Revenue trend chart (7 days)
- Orders by category pie chart
- Peak hours bar chart
- Recent orders table with priority highlighting

✅ **Menu Management**
- View all menu items with search and category filter
- Add new menu items
- Edit existing menu items
- Toggle item availability
- Delete menu items
- Image support

✅ **Orders Management**
- View all orders with advanced filters (status, payment, priority, date range)
- Real-time order updates (auto-refresh every 30 seconds)
- Order detail page with status timeline
- Update order status
- Cancel orders
- Priority order highlighting

✅ **Users Management**
- View all users with filters (type, verification, rider status)
- Verify users
- Activate/deactivate users
- Search by email, name, or student ID

✅ **Payments**
- View all payment records
- Summary cards (total, cash, empower, pending)
- Export to CSV
- Filter by method and status

✅ **Analytics & Reports**
- Sales report with date range selector
- Revenue trend chart
- Orders by category chart
- Popular items table (top 10)
- Growth indicators
- Export reports

✅ **Demand Forecasts**
- Daily forecast table
- Item-specific 7-day forecast chart
- Stock adjustment from forecasts
- Confidence intervals

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The app can be deployed to Vercel, Netlify, or any Node.js hosting service.

For Vercel:
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Notes

- The app uses httpOnly cookies for secure token storage
- All API calls include automatic token refresh
- Real-time updates are implemented via polling (can be upgraded to WebSockets)
- CSV export functionality is implemented client-side
- Image uploads currently use URL input (can be enhanced with file upload)

## License

Private - CampusBite Project
