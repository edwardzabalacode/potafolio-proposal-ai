import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// Firebase configuration object
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

// Validate Firebase configuration
const validateFirebaseConfig = (config: FirebaseConfig): void => {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ]

  const missingFields = requiredFields.filter(field => !config[field])

  if (missingFields.length > 0) {
    throw new Error(
      `Firebase configuration is missing required fields: ${missingFields.join(', ')}`
    )
  }
}

// Validate configuration before initializing
validateFirebaseConfig(firebaseConfig)

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics (only on client-side)
export let analytics: ReturnType<typeof getAnalytics> | null = null

if (typeof window !== 'undefined') {
  isSupported()
    .then(supported => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
    .catch(() => {
      // Analytics not supported
      analytics = null
    })
}

// Export the Firebase app instance
export default app

// Export configuration for reference
export { firebaseConfig }
