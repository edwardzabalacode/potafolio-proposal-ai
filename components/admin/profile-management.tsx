'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { profileService } from '@/lib/services/profile-service'
import { ProfileFormData, defaultProfileData } from '@/lib/types/profile'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProfileForm } from './profile-form'
import { ProfilePreview } from './profile-preview'
import { Loader2, Save, Eye, Edit } from 'lucide-react'

export function ProfileManagement() {
  const { user } = useAuth()
  const [profileData, setProfileData] =
    useState<ProfileFormData>(defaultProfileData)
  const [originalData, setOriginalData] =
    useState<ProfileFormData>(defaultProfileData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (user?.uid) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  useEffect(() => {
    const isChanged =
      JSON.stringify(profileData) !== JSON.stringify(originalData)
    setHasChanges(isChanged)
  }, [profileData, originalData])

  const loadProfile = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const profile = await profileService.getProfile(user.uid)

      if (profile) {
        const formData: ProfileFormData = {
          personalInfo: profile.personalInfo,
          contactInfo: profile.contactInfo,
          heroContent: profile.heroContent,
        }
        setProfileData(formData)
        setOriginalData(formData)
        setLastSaved(profile.updatedAt)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.uid) return

    try {
      setSaving(true)
      await profileService.updateProfile(user.uid, profileData)
      setOriginalData(profileData)
      setLastSaved(new Date())
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleFormChange = (newData: ProfileFormData) => {
    setProfileData(newData)
  }

  const handleReset = () => {
    setProfileData(originalData)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent-green" />
        <span className="ml-2 text-text-secondary">Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary text-2xl font-bold">
            Profile Management
          </h1>
          <p className="text-text-secondary">
            Manage your hero section content and personal information
          </p>
          {lastSaved && (
            <p className="text-sm text-text-muted">
              Last saved: {lastSaved.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="border-accent-green text-accent-green hover:bg-accent-green hover:text-bg-primary"
          >
            {showPreview ? <Edit size={16} /> : <Eye size={16} />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>

          {hasChanges && (
            <>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-bg-primary"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-accent-green text-bg-primary hover:bg-green-600"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {hasChanges && (
        <Card className="border-l-4 border-l-yellow-400 bg-yellow-400/10 p-4">
          <p className="text-sm text-yellow-400">
            You have unsaved changes. Don&apos;t forget to save your work!
          </p>
        </Card>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className={showPreview ? 'lg:order-2' : ''}>
          <ProfileForm
            data={profileData}
            onChange={handleFormChange}
            disabled={saving}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:order-1">
            <ProfilePreview data={profileData} />
          </div>
        )}
      </div>
    </div>
  )
}
