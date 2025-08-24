import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { ProfileData, ProfileFormData } from '@/lib/types/profile'

export class ProfileService {
  private getUserProfileRef(userUID: string): DocumentReference {
    return doc(db, 'stores', userUID, 'profile', 'data')
  }

  async getProfile(userUID: string): Promise<ProfileData | null> {
    try {
      const profileRef = this.getUserProfileRef(userUID)
      const profileSnap = await getDoc(profileRef)

      if (profileSnap.exists()) {
        const data = profileSnap.data()
        return {
          id: profileSnap.id,
          ...data,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ProfileData
      }

      return null
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error fetching profile:', error)
      throw new Error('Failed to fetch profile data')
    }
  }

  async updateProfile(
    userUID: string,
    profileData: ProfileFormData
  ): Promise<void> {
    try {
      const profileRef = this.getUserProfileRef(userUID)

      await setDoc(
        profileRef,
        {
          ...profileData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating profile:', error)
      throw new Error('Failed to update profile data')
    }
  }

  async createProfile(
    userUID: string,
    profileData: ProfileFormData
  ): Promise<void> {
    try {
      const profileRef = this.getUserProfileRef(userUID)

      await setDoc(profileRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating profile:', error)
      throw new Error('Failed to create profile data')
    }
  }
}

export const profileService = new ProfileService()
