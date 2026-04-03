import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkZMobQjG_GBfWM9l3LROxyoCNmMDZfAw",
  authDomain: "acte-lms-4a2e2.firebaseapp.com",
  projectId: "acte-lms-4a2e2",
  storageBucket: "acte-lms-4a2e2.firebasestorage.app",
  messagingSenderId: "579579365578",
  appId: "1:579579365578:web:a4eb509007f4a53703cc33",
  measurementId: "G-CYZRHBP58B",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
