'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  AuthError as FirebaseAuthError,
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw handleAuthError(error as FirebaseAuthError)
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<void> => {
    try {
      setLoading(true)
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (displayName && user) {
        await updateProfile(user, { displayName })
        // Force refresh the user object to get updated profile
        await user.reload()
        setUser(auth.currentUser)
      }
    } catch (error) {
      throw handleAuthError(error as FirebaseAuthError)
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await signOut(auth)
    } catch (error) {
      throw handleAuthError(error as FirebaseAuthError)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw handleAuthError(error as FirebaseAuthError)
    }
  }

  const updateUserProfile = async (displayName: string): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in')

      await updateProfile(user, { displayName })
      await user.reload()
      setUser(auth.currentUser)
    } catch (error) {
      throw handleAuthError(error as FirebaseAuthError)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Helper function to handle auth errors and provide user-friendly messages
function handleAuthError(error: FirebaseAuthError): Error {
  let message = 'An unexpected error occurred'

  switch (error.code) {
    case 'auth/user-not-found':
      message = 'No account found with this email address'
      break
    case 'auth/wrong-password':
      message = 'Incorrect password'
      break
    case 'auth/invalid-email':
      message = 'Invalid email address'
      break
    case 'auth/user-disabled':
      message = 'This account has been disabled'
      break
    case 'auth/email-already-in-use':
      message = 'An account with this email already exists'
      break
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters'
      break
    case 'auth/network-request-failed':
      message = 'Network error. Please check your connection'
      break
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later'
      break
    case 'auth/invalid-credential':
      message = 'Invalid email or password'
      break
    default:
      message = error.message || 'Authentication failed'
  }

  return new Error(message)
}
