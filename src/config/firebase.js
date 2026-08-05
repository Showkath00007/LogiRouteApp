import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDQP6NIxHQY3G5GaA5io9DH9R3XlY5BjG4",
  authDomain: "logiroute-560a5.firebaseapp.com",
  projectId: "logiroute-560a5",
  storageBucket: "logiroute-560a5.firebasestorage.app",
  messagingSenderId: "449422980462",
  appId: "1:449422980462:web:b8024ec016671707187d7f",
  // ⚠️ REPLACE THIS with the exact URL from:
  // Firebase Console → Realtime Database → (top of page)
  // It must end in .firebasedatabase.app (or older projects: .firebaseio.com)
  // NOT .firebaseapp.com — that domain is for Hosting/Auth, not RTDB.
  databaseURL: "https://logiroute-560a5-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;