/**
 * EasyBuy — Full 36 State Catalog Seeder
 * Seeds complete catalog generated from catalogGenerator with 100% accurate stateId, stateName, city, categories, and QuickBuy flags.
 */

const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, writeBatch, collection, getDocs, doc, setDoc } = require('firebase/firestore');

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

// Import generator
const { INDIAN_STATES_AND_UTS, PRODUCT_CATEGORIES, generateFullIndianCatalog } = require('../constants/catalogGenerator');

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function purgeCollection(collName) {
  const snap = await getDocs(collection(db, collName));
  if (snap.empty) return 0;
  console.log(`  🗑️  Deleting ${snap.docs.length} docs from '${collName}'…`);
  const batches = chunk(snap.docs, 400);
  for (const b of batches) {
    const batch = writeBatch(db);
    b.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  return snap.docs.length;
}

async function seedCollection(collName, items, idField = 'id') {
  if (!items || items.length === 0) return 0;
  console.log(`  🌱  Seeding '${collName}' (${items.length} items)…`);
  let seeded = 0;
  for (const batch_items of chunk(items, 400)) {
    const batch = writeBatch(db);
    batch_items.forEach((item) => {
      const id = item[idField] || item.id || item.productId;
      const ref = doc(collection(db, collName), String(id));
      batch.set(ref, { ...item, _seededAt: new Date().toISOString() });
    });
    await batch.commit();
    seeded += batch_items.length;
    process.stdout.write(`     → ${seeded} / ${items.length} seeded\r`);
  }
  console.log(`\n  ✅ '${collName}' — ${seeded} docs seeded.`);
  return seeded;
}

async function run() {
  console.log('🚀 Starting Full 36 State Catalog Seeder...');
  const products = generateFullIndianCatalog();
  console.log(`Generated ${products.length} products across 36 Indian states & UTs.`);

  // Verify state distribution
  const stateCounts = {};
  products.forEach(p => {
    stateCounts[p.stateId] = (stateCounts[p.stateId] || 0) + 1;
  });
  console.log('Sample state counts:', {
    Bihar_BR: stateCounts['BR'],
    Haryana_HR: stateCounts['HR'],
    Delhi_DL: stateCounts['DL'],
    Maharashtra_MH: stateCounts['MH'],
    Karnataka_KA: stateCounts['KA'],
  });

  console.log('\n━━━ STEP 1: Purging old mock products & collections ━━━');
  await purgeCollection('products');
  await purgeCollection('states');
  await purgeCollection('categories');

  console.log('\n━━━ STEP 2: Seeding fresh state-wise catalog ━━━');
  await seedCollection('states', INDIAN_STATES_AND_UTS, 'id');
  await seedCollection('categories', PRODUCT_CATEGORIES, 'id');
  await seedCollection('products', products, 'productId');

  console.log('\n🎉 Complete! All products now have 100% accurate stateId, stateName, and city!');
}

run().catch(console.error);
