// Script to add test data to financialRecords collection
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

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

async function addTestData() {
  try {
    console.log('🔄 Adding test data to financialRecords...');

    // For testing, let's use a test user ID directly
    // In a real app, you'd use proper authentication
    const userId = 'test-user-' + Date.now();
    console.log('Using test user ID:', userId);

    // Add some test financial records
    const testTransactions = [
      {
        userId,
        sheetName: 'Test Sheet 1',
        data: '12/1/2024',
        shuma: 150.00,
        pershkrimi: 'Salary payment',
        category: 'Income',
        uploadedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        userId,
        sheetName: 'Test Sheet 1',
        data: '12/2/2024',
        shuma: -25.50,
        pershkrimi: 'Coffee purchase',
        category: 'Food',
        uploadedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        userId,
        sheetName: 'Test Sheet 1',
        data: '12/3/2024',
        shuma: -100.00,
        pershkrimi: 'Electricity bill',
        category: 'Utilities',
        uploadedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const transaction of testTransactions) {
      const docRef = await addDoc(collection(db, 'financialRecords'), transaction);
      console.log('✅ Added transaction with ID:', docRef.id);
    }

    console.log('🎉 Test data added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);

    // If auth fails, let's try to add data without authentication to see if the rules are the issue
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.log('🔄 Trying to add data without authentication to test rules...');

      try {
        const testTransaction = {
          userId: 'test-user-id',
          sheetName: 'Test Sheet',
          data: '12/1/2024',
          shuma: 100.00,
          pershkrimi: 'Test transaction',
          category: 'Test',
          uploadedAt: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await addDoc(collection(db, 'financialRecords'), testTransaction);
        console.log('✅ Added test transaction without auth');
      } catch (ruleError) {
        console.log('❌ Rules error:', ruleError.message);
        console.log('This suggests the Firestore rules are blocking the write operation.');
      }
    }
  }
}

addTestData();
