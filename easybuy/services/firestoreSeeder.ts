import { db } from './firebase';
import { doc, writeBatch, collection, getDocs, limit, query } from 'firebase/firestore';
import {
  INDIAN_STATES_AND_UTS,
  PRODUCT_CATEGORIES,
  generateFullIndianCatalog,
  ProductItem,
} from '../constants/mockDataGenerator';

/**
 * Seeds all 36 Indian States/UTs, Categories, and Products to Firebase Firestore.
 * Uses batch writes (450 items per batch) for optimal performance.
 */
export async function seedFirestoreData(
  onProgress?: (written: number, total: number) => void
): Promise<{ success: boolean; totalProducts: number; message: string }> {
  try {
    const products = generateFullIndianCatalog();
    const totalItems = INDIAN_STATES_AND_UTS.length + PRODUCT_CATEGORIES.length + products.length;
    let written = 0;

    console.log(`🚀 Starting Firestore Seed: ${INDIAN_STATES_AND_UTS.length} States/UTs, ${PRODUCT_CATEGORIES.length} Categories, ${products.length} Products...`);

    // 1. Seed States & UTs
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const state of INDIAN_STATES_AND_UTS) {
      const stateRef = doc(db, 'states', state.id);
      batch.set(stateRef, state, { merge: true });
      batchCount++;
      written++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
        if (onProgress) onProgress(written, totalItems);
      }
    }

    // 2. Seed Categories
    for (const cat of PRODUCT_CATEGORIES) {
      const catRef = doc(db, 'categories', cat.id);
      batch.set(catRef, cat, { merge: true });
      batchCount++;
      written++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
        if (onProgress) onProgress(written, totalItems);
      }
    }

    // 3. Seed Products in batches of 400
    for (const prod of products) {
      const prodRef = doc(db, 'products', prod.id);
      batch.set(prodRef, prod, { merge: true });
      batchCount++;
      written++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
        if (onProgress) onProgress(written, totalItems);
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    if (onProgress) onProgress(totalItems, totalItems);

    console.log(`✅ Firestore Seed Completed Successfully! Wrote ${totalItems} documents.`);
    return {
      success: true,
      totalProducts: products.length,
      message: `Successfully seeded ${INDIAN_STATES_AND_UTS.length} States, ${PRODUCT_CATEGORIES.length} Categories, and ${products.length} Products to Firestore!`,
    };
  } catch (error: any) {
    console.error('❌ Error seeding Firestore:', error);
    return {
      success: false,
      totalProducts: 0,
      message: error.message || 'Failed to seed Firestore data',
    };
  }
}

/**
 * Checks if Firestore is already seeded with data.
 */
export async function isFirestoreSeeded(): Promise<boolean> {
  try {
    const q = query(collection(db, 'products'), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    console.log('Error checking Firestore seed status:', e);
    return false;
  }
}
