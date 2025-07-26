import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUHD-6nW4Ug5FCxoWRfPp7FR7mFTck_ug",
  authDomain: "sahayak-3d284.firebaseapp.com",
  databaseURL: "https://sahayak-3d284-default-rtdb.firebaseio.com",
  projectId: "sahayak-3d284",
  storageBucket: "sahayak-3d284.appspot.com",
  messagingSenderId: "426703834892",
  appId: "1:426703834892:web:2c0ef6eeb35e79e8d70329",
  measurementId: "G-7QY6NQEKXW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app }; 