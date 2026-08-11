/**
 * EasyBuy Mock Data Purge Script
 *
 * Usage:
 *   node scripts/clearMockData.js
 *   or: npm run clear-mock
 *
 * NOTE: This script ONLY deletes mock product, state, category, and banner collections.
 * It NEVER touches user account data ('users' collection or Firebase Auth).
 */

const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, writeBatch, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAccokA8hHD60rOs_R-1lrY_zfM3jrBCKI",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "easybuy-7ee49.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "easybuy-7ee49",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "easybuy-7ee49.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "908559589622",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:908559589622:web:e187e48b6aba7ea8944cd7",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const COLLECTIONS_TO_CLEAR = ['products', 'states', 'categories', 'trending_banners'];

async function clearMockData() {
  console.log('\n🧹 Starting Mock Data Purge (Preserving Users & Auth Data)...');
  console.log('------------------------------------------------------------');

  for (const collName of COLLECTIONS_TO_CLEAR) {
    try {
      const snap = await getDocs(collection(db, collName));
      if (snap.empty) {
        console.log(`ℹ️  Collection '${collName}' is already empty.`);
        continue;
      }

      console.log(`🗑️  Deleting ${snap.size} mock documents from '${collName}'...`);
      let batch = writeBatch(db);
      let count = 0;
      let deletedTotal = 0;

      for (const docSnap of snap.docs) {
        batch.delete(docSnap.ref);
        count++;
        deletedTotal++;

        if (count >= 400) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
      }

      console.log(`✅ Collection '${collName}' cleared (${deletedTotal} documents removed).`);
    } catch (err) {
      console.error(`❌ Error clearing collection '${collName}':`, err.message);
    }
  }

  console.log('------------------------------------------------------------');
  console.log('🎉 Mock Data Purge Completed Successfully!');
  console.log('🔒 User accounts, logins, & user profiles in "users" remain 100% untouched.\n');
  process.exit(0);
}

clearMockData();
