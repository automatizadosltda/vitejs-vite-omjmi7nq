// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0VwcOC7kE4jP5njGPH4Ccpe8IHjAw6FQ",
  authDomain: "automatizados-a8be5.firebaseapp.com",
  projectId: "automatizados-a8be5",
  storageBucket: "automatizados-a8be5.firebasestorage.app",
  messagingSenderId: "804577624203",
  appId: "1:804577624203:web:3b27b699021ea64068d48e",
  measurementId: "G-NGE7F4857N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);