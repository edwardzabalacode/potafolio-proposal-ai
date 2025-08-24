import {
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { auth } from './config'

// TypeScript interfaces for authentication
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  displayName?: string
}

export interface AuthError {
  code: string
  message: string
}

// Convert Firebase User to our AuthUser interface
export const convertFirebaseUser = (user: User | null): AuthUser | null => {
  if (!user) return null

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  }
}

// Authentication service functions
export const authService = {
  // Sign in with email and password
  signIn: async (credentials: LoginCredentials): Promise<AuthUser> => {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      )
      const authUser = convertFirebaseUser(userCredential.user)
      if (!authUser) {
        throw new Error('Failed to convert user data')
      }
      return authUser
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      throw {
        code: firebaseError.code || 'auth/unknown-error',
        message:
          firebaseError.message || 'An unknown error occurred during sign in',
      } as AuthError
    }
  },

  // Register new user with email and password
  register: async (credentials: RegisterCredentials): Promise<AuthUser> => {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        )

      // Update profile with display name if provided
      if (credentials.displayName) {
        await updateProfile(userCredential.user, {
          displayName: credentials.displayName,
        })
      }

      const authUser = convertFirebaseUser(userCredential.user)
      if (!authUser) {
        throw new Error('Failed to convert user data')
      }
      return authUser
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      throw {
        code: firebaseError.code || 'auth/unknown-error',
        message:
          firebaseError.message ||
          'An unknown error occurred during registration',
      } as AuthError
    }
  },

  // Sign out current user
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth)
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      throw {
        code: firebaseError.code || 'auth/unknown-error',
        message:
          firebaseError.message || 'An unknown error occurred during sign out',
      } as AuthError
    }
  },

  // Send password reset email
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      throw {
        code: firebaseError.code || 'auth/unknown-error',
        message:
          firebaseError.message ||
          'An unknown error occurred while sending reset email',
      } as AuthError
    }
  },

  // Update user profile
  updateProfile: async (updates: {
    displayName?: string
    photoURL?: string
  }): Promise<void> => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user')
      }
      await updateProfile(auth.currentUser, updates)
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      throw {
        code: firebaseError.code || 'auth/unknown-error',
        message:
          firebaseError.message ||
          'An unknown error occurred while updating profile',
      } as AuthError
    }
  },

  // Change user password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No authenticated user')
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, newPassword)
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      throw {
        code: firebaseError.code || 'auth/unknown-error',
        message:
          firebaseError.message ||
          'An unknown error occurred while changing password',
      } as AuthError
    }
  },

  // Get current user
  getCurrentUser: (): AuthUser | null => {
    return convertFirebaseUser(auth.currentUser)
  },

  // Subscribe to auth state changes
  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChanged(auth, user => {
      callback(convertFirebaseUser(user))
    })
  },
}

// Helper function to handle auth errors with user-friendly messages
export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No user found with this email address.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This user account has been disabled.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    case 'auth/requires-recent-login':
      return 'Please sign in again to complete this action.'
    default:
      return error.message || 'An unexpected error occurred.'
  }
}

// Export auth instance for direct use if needed
export { auth }
