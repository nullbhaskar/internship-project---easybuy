# EasyBuy — Smart Indian E-Commerce App

A full-featured, production-ready e-commerce mobile application built with **React Native** and **Expo**, designed for the Indian market. EasyBuy combines a rich consumer shopping experience with a powerful admin dashboard.

---

## Features

### Consumer App
- **QuickBuy** — 10–20 minute express delivery for essential products
- **AI Voice Shopping** — Gemini-powered voice assistant for hands-free product search
- **AI Chat Assistant** — Smart product recommendations via chat
- **Smart Trending Banners** — Location-aware trending product suggestions
- **Curated Editorial Sections** — Premium browsing experience with lifestyle collections
- **Real-time Cart & Wishlist** — Persistent across sessions with Firebase sync
- **Regional Catalog** — State and UT-specific product listings across all 36 Indian states and UTs
- **Dark / Light Mode** — User-selectable app theme

### Admin Dashboard
- **Product Management** — Add, edit, and delete products with image support
- **Order Management** — View and update order statuses in real time
- **Analytics Dashboard** — Revenue charts, weekly trends, and KPI cards
- **Customer Insights** — Registered user tracking with order history
- **Category Management** — Organise products into searchable categories

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 (React Native) |
| Navigation | Expo Router (file-based) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Animations | React Native Reanimated 3 |
| AI | Groq AI + Gemini API |
| State | React Context API |
| Language | TypeScript |

---

## Project Structure

```
easybuy/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout with providers
│   ├── home.tsx            # Main home screen
│   ├── admin.tsx           # Admin dashboard
│   ├── orders.tsx          # Order history
│   ├── quickbuy.tsx        # QuickBuy express screen
│   └── ...
├── components/             # Reusable UI components
│   ├── admin/              # Admin-specific components
│   ├── ai/                 # AI chat and voice components
│   ├── cart/               # Cart drawer and modals
│   ├── home/               # Home screen sections
│   ├── search/             # Search and filter modals
│   └── ui/                 # Shared UI primitives
├── constants/              # Static data, catalog generators, theme
├── context/                # React Context providers (Auth, Cart, etc.)
├── hooks/                  # Custom React hooks
│   ├── useAdminCheck.ts
│   ├── useDebounce.ts
│   └── useThemePreference.ts
├── services/               # Firebase config, AI services, email
├── types/                  # Shared TypeScript type definitions
└── utils/                  # Pure utility functions
    ├── formatters.ts       # Price, date, string formatters
    ├── arrayUtils.ts       # Shuffle, groupBy, chunk helpers
    └── validators.ts       # Form validation (email, phone, etc.)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone, or an Android/iOS emulator

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd easybuy

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root with your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Running the App

```bash
# Start the development server
npx expo start

# Clear cache if needed
npx expo start -c
```

Then scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

---

## Admin Access

To access the admin dashboard, log in with the admin credentials and tap the hidden admin button on the home screen, or navigate directly to `/admin`.

---

## Firebase Setup

See `FIRESTORE_SEED_GUIDE.md` for instructions on seeding the Firestore database with initial product and category data.

---

## License

This project was built as an internship project. All rights reserved.
