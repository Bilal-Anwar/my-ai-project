import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Hum direct keys yahan likh rahe hain taake error khatam ho jaye
const firebaseConfig = {
  apiKey: "AIzaSyBf0Y_2SAc-G0p6k3AOq12ebd3w74xYQ5k",
  authDomain: "my-ai-project-3b7a6.firebaseapp.com",
  projectId: "my-ai-project-3b7a6",
  storageBucket: "my-ai-project-3b7a6.firebasestorage.app",
  messagingSenderId: "115238040475",
  appId: "1:115238040475:web:7ae427e00b789d5543273e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;