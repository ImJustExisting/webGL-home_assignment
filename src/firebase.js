import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB570MdL38ePMQKOkoGZl8rFFJMhf7XN_M",
  authDomain: "webgl-ha.firebaseapp.com",
  projectId: "webgl-ha",
  storageBucket: "webgl-ha.firebasestorage.app",
  messagingSenderId: "738128093535",
  appId: "1:738128093535:web:3787d1e7fc37c0a49816ea",
  measurementId: "G-M22B634FZZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);