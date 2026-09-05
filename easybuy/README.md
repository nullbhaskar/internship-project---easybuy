<div align="center">
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/assets/images/easybuy_logo.png" alt="EasyBuy Logo" width="140" />

  # 🛒 EasyBuy: Next-Gen AI E-Commerce

  **An intelligent, seamless, and highly personalized mobile shopping experience powered by Artificial Intelligence.**

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Groq AI](https://img.shields.io/badge/Powered_by-Groq_AI-F6511D?style=for-the-badge)](https://groq.com/)
</div>

<br />

## 🌟 Overview

**EasyBuy** is a modern, high-performance e-commerce mobile application designed to redefine the digital shopping journey. Built from the ground up for a university internship project, it integrates cutting-edge AI technologies, robust real-time database management, and a meticulously crafted user interface to deliver a truly premium experience.

From dynamic AI-powered pricing to dual intelligent shopping assistants, EasyBuy represents the future of mobile retail.

---

## ✨ Signature Features

### 🤖 Dual AI Shopping Assistants
- **Interactive Voice Assistant:** Speak directly to the app to search for products, check orders, or ask for recommendations hands-free. Features a stunning interactive 3D orb UI.
- **Context-Aware Chat AI:** A conversational text assistant powered by LLaMA 3 (via Groq) that understands your shopping context, helps you find products, and answers complex queries instantly.

### ⚡ Smart Dynamic Pricing & Curation
- **Intelligent Algorithms:** Real-time dynamic pricing that adjusts based on demand, time of day, and user behavior.
- **Location-Aware Content:** The home screen dynamically curates products and banners based on your active location (e.g., "Curated for Gurgaon").
- **Time-Contextual Greetings:** The app greets you dynamically ("Quiet night in", "Looking for something before the day ends?") based on the time and weather.

### 🔐 Enterprise-Grade Security
- **Real-Time Email OTP:** Full email verification system sending live 6-digit OTP codes straight to the user's inbox during registration.
- **Secure Guest Mode:** A robust guest fallback that allows users to browse seamlessly while locking protected features (Wishlist, Orders) behind beautifully designed login prompts.

### 🛒 Seamless Shopping Experience
- **Fluid UI/UX:** Built with React Native Animated and Expo Haptics for buttery-smooth micro-animations, glassmorphic overlays, and tactile swipe gestures.
- **Advanced Cart & Checkout:** Persistent sticky cart bars, multi-item bundling, and a streamlined checkout flow.
- **Order Tracking:** Detailed visual timelines tracking orders from "Placed" to "Delivered".

### 📊 Hidden Admin Dashboard & AI Control Center
- **Store Management:** A powerful administrative interface to manage inventory, edit products, and update order statuses in real-time.
- **AI Catalog Scanner:** An automated audit system that scans the database for critical bugs (e.g., $0 prices, missing images) and SEO warnings.
- **AI Automation Settings:** Toggle smart auto-pricing, weekend discounts, and low-stock alerts natively from the Admin Control Center.
- **Analytics:** Beautifully rendered SVG curved graphs displaying live revenue and stock distribution metrics.

---

## 📸 Application Showcase

### Part 1
<div align="center">
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img1.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img2.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img3.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img4.png" width="200" />
</div>

### Part 2
<div align="center">
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img5.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img6.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img7.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img8.png" width="200" />
</div>

### Part 3
<div align="center">
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img9.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img10.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img11.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img12.png" width="200" />
</div>

### Part 4
<div align="center">
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img13.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img14.png" width="200" />
  <img src="https://raw.githubusercontent.com/nullbhaskar/internship-project---easybuy/main/easybuy/screenshots/img15.png" width="200" />
</div>

---

## 🛠 Tech Stack

- **Frontend Core:** React Native, Expo, Expo Router, React Navigation
- **State Management & Context:** React Context API (Auth, Cart, Wishlist, Location, Theme)
- **Backend & Database:** Firebase (Firestore DB, Firebase Authentication, Firebase Storage)
- **AI Integration:** Groq API (LLaMA 3) for lightning-fast natural language processing
- **Styling & Animation:** Custom Stylesheets, React Native Animated API, Glassmorphism, Expo Blur, Expo Haptics

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn
- Expo Go app on your iOS/Android device (or a local emulator)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nullbhaskar/internship-project---easybuy.git
   cd "internship-project---easybuy/easybuy"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device:**
   - Scan the QR code shown in the terminal using the **Expo Go** app on your phone.
   - Or press `a` to open on an Android emulator, or `i` for an iOS simulator.

---

<div align="center">
  <h3>Designed & Developed by <b>Bhaskar Das</b></h3>
  <p>Internship Project Evaluation</p>
</div>
