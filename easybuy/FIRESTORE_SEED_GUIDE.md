# 📦 EasyBuy Firestore Safe Data Seed & Validation Guide

This document explains the safe, scalable, and idempotent Firestore seed workflow for the **EasyBuy** React Native (Expo) application.

---

## 📑 Overview & Architecture

The seed workflow populates your Firebase Firestore database with **3,600+ normalized products** across **all 28 Indian States and 8 Union Territories**, with **10+ categories per state** and authentic local specialties (e.g. Sattu in Bihar, Amritsari Papad in Punjab, Banana Chips in Kerala, Mishti Doi in West Bengal, Mojari Shoes in Rajasthan, etc.).

---

## 🔒 Data Safety & Idempotency Guarantee

1. **Zero Duplicate Documents**:
   - Every state, category, and product uses deterministic document IDs:
     - `states/{stateId}` (e.g., `BR`, `PB`, `KL`, `MH`, `DL`)
     - `categories/{categoryId}` (e.g., `quickbuy`, `grocery`, `local_specialties`)
     - `products/{productId}` (e.g., `prod_br_1`, `local_br_2`)
   - Uses `setDoc(docRef, data, { merge: true })` with batch commits of 400 documents. Running the script 1 time or 100 times produces the exact same clean dataset without duplicates.

2. **User Data Protection**:
   - The seeder **ONLY** touches product-related collections:
     - ✅ `states`
     - ✅ `categories`
     - ✅ `products`
   - The seeder **NEVER** touches or modifies user data collections:
     - 🛡️ `users`
     - 🛡️ `orders`
     - 🛡️ `cart`
     - 🛡️ `addresses`
     - 🛡️ `wishlist`

---

## 🛠️ How to Run the Seed & Verification Suite

### Command Line Execution

Run the developer seed runner command in your terminal:

```bash
npm run seed
```

Or execute directly via `npx ts-node`:

```bash
npx ts-node scripts/seedRunner.ts
```

---

## 🧪 Automated Verification & Audit Suite

When the seed script completes, it automatically executes `verifyFirestoreSeed('BR')` which validates:

1. **States Check**: Verifies 36 States and UTs are present in `states` collection.
2. **Categories Check**: Verifies 10 categories are present in `categories` collection.
3. **Products Count Check**: Verifies total product count in `products` collection.
4. **Schema & Image Link Integrity**: Ensures all products contain valid thumbnails, image arrays, prices, and descriptions.
5. **State Filtering Query**: Verifies `where('stateId', '==', 'BR')` returns matching regional products.
6. **Category Filtering Query**: Verifies `where('categoryId', '==', 'quickbuy')` returns instant delivery items.
7. **Search Indexing**: Verifies `where('searchKeywords', 'array-contains', 'milk')` array queries.
8. **Sample Audit**: Audits a selected sample state (e.g. Bihar / Maharashtra) ensuring every single category contains products.

---

## 📁 Key File Map

| File Path | Description |
| :--- | :--- |
| [`constants/mockDataGenerator.ts`](file:///d:/internship%20project/easybuy/constants/mockDataGenerator.ts) | Normalized 36 States/UTs, 10 categories, and 3,600+ product catalog generator |
| [`services/firestoreSeeder.ts`](file:///d:/internship%20project/easybuy/services/firestoreSeeder.ts) | Safe batch write seeder module with `{ merge: true }` idempotency |
| [`services/verifyFirestoreSeed.ts`](file:///d:/internship%20project/easybuy/services/verifyFirestoreSeed.ts) | Verification test suite for schema, images, state filtering, and search queries |
| [`scripts/seedRunner.ts`](file:///d:/internship%20project/easybuy/scripts/seedRunner.ts) | Developer CLI entry point script for running seeding & validation |
