// Debug script to check Firestore data
const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBzTnhCHKHYYel7IZ4D7fWD7tWm4fv7B3k",
  authDomain: "finapp-551d3.firebaseapp.com",
  projectId: "finapp-551d3",
  storageBucket: "finapp-551d3.firebasestorage.app",
  messagingSenderId: "525395309052",
  appId: "1:525395309052:web:9a9477d7abeed6bed40279"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function debugFirestore() {
  try {
    console.log('🔍 Checking Firestore data...');

    // Check authentication
    const user = auth.currentUser;
    console.log('Current user:', user ? user.uid : 'Not authenticated');

    if (!user) {
      console.log('Signing in anonymously...');
      await signInAnonymously(auth);
      console.log('Signed in as:', auth.currentUser?.uid);
    }

    // Check financialRecords collection
    console.log('\n📊 Checking financialRecords collection...');
    const financialRecordsRef = collection(db, 'financialRecords');
    const financialRecordsQuery = query(financialRecordsRef);
    const financialRecordsSnapshot = await getDocs(financialRecordsQuery);

    console.log(`Found ${financialRecordsSnapshot.size} documents in financialRecords`);
    financialRecordsSnapshot.forEach((doc) => {
      console.log('Document:', doc.id, doc.data());
    });

    // Check old collection structure
    console.log('\n📊 Checking old users/{userId}/transactions structure...');
    if (auth.currentUser) {
      const oldTransactionsRef = collection(db, `users/${auth.currentUser.uid}/transactions`);
      const oldTransactionsSnapshot = await getDocs(oldTransactionsRef);

      console.log(`Found ${oldTransactionsSnapshot.size} documents in old structure`);
      oldTransactionsSnapshot.forEach((doc) => {
        console.log('Document:', doc.id, doc.data());
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugFirestore();
