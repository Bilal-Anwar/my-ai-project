import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: move these secrets to environment variables in production.
const firebaseConfig = {
  apiKey: "AIzaSyBf0Y_2SAc-G0p6k3AOq12ebd3w74xYQ5k",
  authDomain: "my-ai-project-3b7a6.firebaseapp.com",
  projectId: "my-ai-project-3b7a6",
  storageBucket: "my-ai-project-3b7a6.firebasestorage.app",
  messagingSenderId: "115238040475",
  appId: "1:115238040475:web:7ae427e00b789d5543273e",
  measurementId: "G-RY2XCDHVKP",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);