'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from 'firebase/auth'
import { profileService } from '@/lib/services/profile-service'
import { ProfileData } from '@/lib/types/profile'

export interface UseProfileReturn {
  profile: ProfileData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProfile(user: User | null = null): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.uid) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const profileData = await profileService.getProfile(user.uid)
      setProfile(profileData)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load profile'
      setError(errorMessage)
      // eslint-disable-next-line no-console
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  const refetch = async () => {
    await fetchProfile()
  }

  useEffect(() => {
    fetchProfile()
  }, [user?.uid, fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch,
  }
}
