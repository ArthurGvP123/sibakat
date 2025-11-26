// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const env = import.meta.env as Record<string, string | undefined>

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const missing = requiredKeys.filter((k) => !env[k])
if (missing.length) {
  // Buat error yang jelas agar tidak blank screen
  throw new Error(
    `Konfigurasi Firebase tidak lengkap. Kunci env yang hilang: ${missing.join(
      ', '
    )}. Pastikan file .env.local berada di root proyek dan restart "npm run dev".`
  )
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY!,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: env.VITE_FIREBASE_APP_ID!,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
