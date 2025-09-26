// config/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANhzRv7Sp-J3onlTMnL_QjN79thoBqMK8",
  authDomain: "brainboost-8ace5.firebaseapp.com",
  databaseURL: "https://brainboost-8ace5-default-rtdb.firebaseio.com",
  projectId: "brainboost-8ace5",
  storageBucket: "brainboost-8ace5.appspot.com",
  messagingSenderId: "443801293160",
  appId: "1:443801293160:android:366702af16fcc33450c6dd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);

// Log successful initialization
console.log('🔥 Firebase initialized successfully');
console.log('✅ Auth instance created:', !!auth);
console.log('✅ Firestore instance created:', !!firestore);
console.log('📋 Project ID:', firebaseConfig.projectId);

export { auth, firestore };
export default app;