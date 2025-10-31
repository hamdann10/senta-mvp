import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBmmFTu0pPm-vGmLopwrNIBg2hV05jeCb4",
    authDomain: "senta-app.firebaseapp.com",
    projectId: "senta-app",
    storageBucket: "senta-app.firebasestorage.app",
    messagingSenderId: "23135430189",
    appId: "1:23135430189:web:5a64776d7089b37b263aa4"
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
