import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzTnhCHKHYYel7IZ4D7fWD7tWm4fv7B3k",
  authDomain: "finapp-551d3.firebaseapp.com",
  projectId: "finapp-551d3",
  storageBucket: "finapp-551d3.firebasestorage.app",
  messagingSenderId: "525395309052",
  appId: "1:525395309052:web:9a9477d7abeed6bed40279"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development (optional)
// if (__DEV__ && !auth._delegate._config?.emulator) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

export default app;