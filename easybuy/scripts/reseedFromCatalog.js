/**
 * EasyBuy — Purge & Re-Seed Script
 *
 * Usage:
 *   node scripts/reseedFromCatalog.js
 *
 * What it does:
 *   1. Clears existing mock collections: products, states, categories, subcategories, trending_banners
 *   2. Seeds fresh data from scripts/catalog.json into Firestore
 *
 * SAFETY: Never touches  →  users, orders, cart, wishlist, addresses, auth
 */

const { initializeApp, getApps, getApp } = require('firebase/app');
const {
  getFirestore,
  writeBatch,
  collection,
  getDocs,
  doc,
  setDoc,
} = require('firebase/firestore');
const path  = require('path');
const fs    = require('fs');

// ─── Firebase Config ────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            || 'AIzaSyAccokA8hHD60rOs_R-1lrY_zfM3jrBCKI',
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        || 'easybuy-7ee49.firebaseapp.com',
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         || 'easybuy-7ee49',
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     || 'easybuy-7ee49.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '908559589622',
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID              || '1:908559589622:web:e187e48b6aba7ea8944cd7',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db  = getFirestore(app);

// ─── Collections to purge (NEVER add users / orders / cart / wishlist / addresses) ──
const COLLECTIONS_TO_PURGE = [
  'products',
  'states',
  'categories',
  'subcategories',
  'trending_banners',
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function purgeCollection(collName) {
  const snap = await getDocs(collection(db, collName));
  if (snap.empty) {
    console.log(`  ℹ️  '${collName}' is already empty — skipping.`);
    return 0;
  }
  console.log(`  🗑️  Deleting ${snap.size} docs from '${collName}'…`);

  let deleted = 0;
  for (const batch_docs of chunk(snap.docs, 400)) {
    const batch = writeBatch(db);
    batch_docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += batch_docs.length;
  }
  console.log(`  ✅ '${collName}' — ${deleted} docs deleted.`);
  return deleted;
}

async function seedCollection(collName, items, idField) {
  if (!items || items.length === 0) {
    console.log(`  ⚠️  No items to seed for '${collName}' — skipping.`);
    return 0;
  }
  console.log(`  📤 Seeding ${items.length} docs into '${collName}'…`);

  let seeded = 0;
  for (const batch_items of chunk(items, 400)) {
    const batch = writeBatch(db);
    batch_items.forEach((item) => {
      const id  = item[idField] || item.id || item.productId;
      const ref = doc(collection(db, collName), String(id));
      batch.set(ref, { ...item, _seededAt: new Date().toISOString() });
    });
    await batch.commit();
    seeded += batch_items.length;
    process.stdout.write(`     → ${seeded} / ${items.length} seeded\r`);
  }
  console.log(`  ✅ '${collName}' — ${seeded} docs seeded.`);
  return seeded;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const catalogPath = path.join(__dirname, 'catalog.json');
  if (!fs.existsSync(catalogPath)) {
    console.error(`❌  catalog.json not found at: ${catalogPath}`);
    process.exit(1);
  }

  console.log('📂  Loading catalog.json…');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  const { states = [], categories = [], subcategories = [], products = [] } = catalog;

  console.log(`\n📊  Catalog Summary:`);
  console.log(`    States:        ${states.length}`);
  console.log(`    Categories:    ${categories.length}`);
  console.log(`    Subcategories: ${subcategories.length}`);
  console.log(`    Products:      ${products.length}`);

  // ── STEP 1: Purge ──────────────────────────────────────────────────────
  console.log('\n━━━ STEP 1: Purging old mock data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒  SAFE COLLECTIONS (untouched): users, orders, cart, wishlist, addresses\n');

  let totalPurged = 0;
  for (const coll of COLLECTIONS_TO_PURGE) {
    totalPurged += await purgeCollection(coll);
  }
  console.log(`\n✅  Total purged: ${totalPurged} documents\n`);

  // ── STEP 2: Seed ───────────────────────────────────────────────────────
  console.log('━━━ STEP 2: Seeding fresh catalog data ━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await seedCollection('states',        states,        'id');
  await seedCollection('categories',    categories,    'id');
  await seedCollection('subcategories', subcategories, 'id');
  await seedCollection('products',      products,      'productId');

  // ── STEP 3: Summary ────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉  Re-seed Complete!');
  console.log(`    States:        ${states.length} seeded`);
  console.log(`    Categories:    ${categories.length} seeded`);
  console.log(`    Subcategories: ${subcategories.length} seeded`);
  console.log(`    Products:      ${products.length} seeded`);
  console.log('\n🔒  users / orders / cart / wishlist / addresses — untouched.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Fatal error during seed:', err.message || err);
  process.exit(1);
});
