import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSy..._LTE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'turnero-4fa62.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'turnero-4fa62',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'turnero-4fa62.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || '980829554580',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:980829554580:web:476c13f22a2fd058f17181',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
