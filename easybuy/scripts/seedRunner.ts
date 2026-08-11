/**
 * EasyBuy Firestore Database Seeder & Validator Script
 *
 * Usage:
 *   npx ts-node scripts/seedRunner.ts
 */

import { seedFirestoreData } from '../services/firestoreSeeder';
import { verifyFirestoreSeed } from '../services/verifyFirestoreSeed';

async function main() {
  console.log('====================================================');
  console.log('📦 EASYBUY FIRESTORE SAFE DATA SEEDER & AUDITOR');
  console.log('====================================================');

  const startTime = Date.now();

  console.log('\nStep 1: Running Safe Idempotent Seed...');
  const seedResult = await seedFirestoreData((written, total) => {
    const pct = Math.round((written / total) * 100);
    process.stdout.write(`\r⏳ Seeding Progress: ${written}/${total} documents (${pct}%)`);
  });

  console.log(`\n\nResult: ${seedResult.message}`);

  if (!seedResult.success) {
    console.error('\n❌ Seeding failed. Aborting verification.');
    process.exit(1);
  }

  console.log('\nStep 2: Running Automatic Verification Suite...');
  const report = await verifyFirestoreSeed('BR');

  console.log('\n====================================================');
  console.log('📊 VERIFICATION SUMMARY REPORT');
  console.log('====================================================');
  console.log(`Timestamp:               ${report.timestamp}`);
  console.log(`Overall Success:         ${report.success ? 'PASSED ✅' : 'WARNING ⚠️'}`);
  console.log(`States/UTs Created:      ${report.totalStatesFound} / ${report.expectedStates}`);
  console.log(`Categories Created:      ${report.totalCategoriesFound} / ${report.expectedCategories}`);
  console.log(`Products Created:        ${report.totalProductsFound}`);
  console.log(`State Filtering Query:   ${report.checks.stateFilteringVerified ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Category Query:          ${report.checks.categoryFilteringVerified ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Search Keywords Query:   ${report.checks.searchIndexingVerified ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Sample Audit (Bihar):    ${report.sampleStateAudit.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Elapsed Time:            ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Unhandled error in seedRunner:', err);
  process.exit(1);
});
