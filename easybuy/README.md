# 🛍️ EasyBuy - Smart Indian E-Commerce App

![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=D04A37)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

A full-featured, production-ready e-commerce mobile application built with **React Native** and **Expo SDK 54**, specifically tailored for the Indian market. EasyBuy brings a premium consumer shopping experience combined with a powerful, secure admin dashboard.

---

## ✨ Key Features

### 🛒 Consumer Experience
- **QuickBuy Engine:** 10–20 minute express delivery UI for essential products and groceries.
- **Dynamic Festive Engine:** A time-aware "Dynamic Island" style event system that morphs into curated bundles based on time of day (Morning Fuel, Late Night Cravings) or Indian Festivals (Diwali, Rakhi, Holi).
- **AI-Powered Discovery:** Integrated Groq AI & Gemini API for a smart Voice Assistant and Chatbot that provides conversational product recommendations.
- **Hyper-Localized Catalog:** State and UT-specific product listings natively adapted for all 36 Indian regions.
- **Bulletproof Cart & Auth:** True multi-tenant cart isolation using Firebase Firestore. Secure guest-to-registered user flow.
- **Premium UI/UX:** Frosted glass components (expo-blur), Reanimated 3 spring physics, and haptic feedback for a buttery smooth native feel.
- **Full Theming:** Complete Dark / Light mode support out of the box.

### 🛡️ Admin Dashboard (The "Dynamic Island" Toggle)
- **Seamless Mode Switching:** True Dynamic Island-style floating pill at the top of the screen to seamlessly toggle between Consumer App and Admin Dashboard.
- **Full Inventory Control:** Add, edit, and delete products, categories, and inventory counts in real time.
- **Analytics & KPIs:** Track registered users, live revenue, and weekly order trends in a clean, visual dashboard.
- **Order Pipeline:** View and update fulfillment statuses of customer orders.

---

## 🏗️ Tech Stack & Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Core Framework** | Expo SDK 54 (React Native) | Cross-platform (iOS, Android, Web) runtime |
| **Routing** | Expo Router | File-based navigation & deep linking |
| **Backend & Auth** | Firebase (Auth, Firestore) | Secure user accounts and real-time database |
| **Animations** | React Native Reanimated 3 | High-performance 60fps spring animations |
| **State Management**| React Context API | Global state (Cart, Auth, Theme, Favorites) |
| **AI Integration** | Groq / Google Gemini | Smart recommendations and chat |
| **Language** | TypeScript | Strict type safety and autocompletion |

### 🚀 Recent Optimizations
- **Data Decoupling:** Ripped out 6,500+ lines of mock data into independent `.ts` vaults, massively dropping bundle sizes and eliminating React re-render lag.
- **Cross-Account Leak Prevention:** Implemented unique `activeUid` storage keys to guarantee 100% data isolation between Admins and multiple User accounts on the same device.
- **Cross-Platform Fixes:** Rewrote the dynamic animations to fully support Web-based shadow rendering and Reanimated layouts.

---

## 📂 Project Structure

```bash
easybuy/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout with providers
│   ├── home.tsx            # Main storefront
│   ├── admin.tsx           # Admin dashboard entry
│   └── ...                 
├── components/             # Reusable UI components
│   ├── admin/              # Admin-specific (Floating Bar, Sidebar, Panels)
│   ├── ai/                 # AI chat and voice UI
│   └── home/               # Hero sections, Carousels, etc.
├── constants/              # System constants (Colors, Typography)
├── context/                # React Context (AuthContext, CartContext)
├── data/                   # Data vaults (mockHomeData.ts)
├── services/               # Firebase config, AI service adapters
└── utils/                  # Pure logic (price formatters, date parsers)
```

---

## 💻 Getting Started

### 1. Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator, Android Emulator, or Expo Go on physical device.

### 2. Installation
```bash
git clone <your-repo-url>
cd easybuy
npm install
```

### 3. Environment Variables
Create a `.env` file at the root of the project with your Firebase config:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Application
```bash
# Start the Expo bundler
npx expo start -c
```
Press `w` to open on web, `i` for iOS simulator, or `a` for Android emulator.

---

## 🔑 Admin Access

1. Log into the application using an account flagged with `isAdmin = true` (e.g., `admineasybuy@gmail.com`).
2. The **Dynamic Island** will automatically appear at the top center of the screen.
3. Tap **Dashboard** to seamlessly morph into the Admin Control Panel.

---

## 📜 License
Built for the EasyBuy Internship Project. All rights reserved.
