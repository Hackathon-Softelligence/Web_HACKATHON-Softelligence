// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqRGT8xrx4ZVqW2OczZ1DkyAcMTubilqY",
  authDomain: "modern-environs-437216-m4.firebaseapp.com",
  projectId: "modern-environs-437216-m4",
  storageBucket: "modern-environs-437216-m4.firebasestorage.app",
  messagingSenderId: "524169331415",
  appId: "1:524169331415:web:7ab86e5e9095b34f07a692",
  measurementId: "G-BF66W6J31T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firestore
export const db = getFirestore(app, "drowsiness-detection");
export { analytics };
