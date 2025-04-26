import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwlnt2b58Sr2BLC4X9OgMJqpc3xP-5C48",
  authDomain: "ideas-8839a.firebaseapp.com",
  projectId: "ideas-8839a",
  storageBucket: "ideas-8839a.appspot.com",
  messagingSenderId: "703772235630",
  appId: "1:703772235630:web:722080a2eaf15ee4fe937f",
  measurementId: "G-F5GXR00HWS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let analytics = null;

// Initialize analytics conditionally
isSupported().then(yes => yes ? analytics = getAnalytics(app) : console.log('Analytics not supported in this environment'));

export { app, db, auth, analytics }; 