const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAccokA8hHD60rOs_R-1lrY_zfM3jrBCKI",
  authDomain: "easybuy-7ee49.firebaseapp.com",
  projectId: "easybuy-7ee49",
  storageBucket: "easybuy-7ee49.firebasestorage.app",
  messagingSenderId: "908559589622",
  appId: "1:908559589622:web:e187e48b6aba7ea8944cd7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function dumpStudyOffice() {
  try {
    const q = query(collection(db, 'products'), where('categoryId', '==', 'study_office'));
    const snap = await getDocs(q);
    const products = [];
    snap.forEach((doc) => {
      products.push({ id: doc.id, name: doc.data().name || doc.data().title, price: doc.data().price, city: doc.data().city, stateName: doc.data().stateName });
    });
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error dumping study_office products:', err);
  }
}

dumpStudyOffice();
