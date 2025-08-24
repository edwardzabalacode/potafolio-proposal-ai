'use client'

import { useState } from 'react'
import { ProfileFormData } from '@/lib/types/profile'
import { Card } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { User, Globe, FileText, ChevronDown, ChevronUp } from 'lucide-react'

interface ProfileFormProps {
  data: ProfileFormData
  onChange: (data: ProfileFormData) => void
  disabled?: boolean
}

interface FormSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function FormSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-accent-green/10 flex w-full items-center justify-between border-b-2 border-accent-green bg-bg-tertiary p-4 text-left transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-primary text-lg font-semibold">{title}</h3>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && <div className="p-6">{children}</div>}
    </Card>
  )
}

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  type?: 'text' | 'url' | 'textarea'
  rows?: number
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  rows = 3,
}: InputFieldProps) {
  const commonProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    placeholder,
    disabled,
    className: `w-full rounded-lg border-2 border-accent-green/20 bg-bg-secondary px-4 py-3 text-primary placeholder-text-muted transition-colors focus:border-accent-green focus:outline-none focus:ring-0 disabled:opacity-50 ${
      disabled ? 'cursor-not-allowed' : ''
    }`,
  }

  return (
    <div className="space-y-2">
      <label className="text-primary block text-sm font-medium">{label}</label>
      {type === 'textarea' ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  )
}

export function ProfileForm({ data, onChange, disabled }: ProfileFormProps) {
  const updatePersonalInfo = (
    field: keyof ProfileFormData['personalInfo'],
    value: string
  ) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    })
  }

  const updateContactInfo = (
    field: keyof ProfileFormData['contactInfo'],
    value: string
  ) => {
    onChange({
      ...data,
      contactInfo: {
        ...data.contactInfo,
        [field]: value,
      },
    })
  }

  const updateHeroContent = (
    field: keyof ProfileFormData['heroContent'],
    value: string
  ) => {
    onChange({
      ...data,
      heroContent: {
        ...data.heroContent,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <FormSection
        title="Personal Information"
        icon={<User className="h-5 w-5 text-accent-green" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <InputField
            label="Display Name"
            value={data.personalInfo.name}
            onChange={value => updatePersonalInfo('name', value)}
            placeholder="Your full name"
            disabled={disabled}
          />

          <InputField
            label="Professional Title"
            value={data.personalInfo.title}
            onChange={value => updatePersonalInfo('title', value)}
            placeholder="e.g., Full Stack Developer"
            disabled={disabled}
          />

          {/* Profile Image Upload */}
          <div>
            <label className="text-primary mb-3 block text-sm font-medium">
              Profile Image
            </label>
            <ImageUpload
              currentImage={data.personalInfo.profileImage}
              onImageUpload={imageUrl =>
                updatePersonalInfo('profileImage', imageUrl)
              }
              onImageRemove={() => updatePersonalInfo('profileImage', '')}
              uploadType="profile"
              disabled={disabled}
              maxSizeMB={3}
              placeholder="Upload your profile photo"
            />
            <p className="mt-2 text-xs text-text-muted">
              Upload a professional profile photo. Square images work best. Max
              3MB.
            </p>
          </div>

          {/* Alternative URL Input */}
          <InputField
            label="Or enter image URL manually"
            value={data.personalInfo.profileImage}
            onChange={value => updatePersonalInfo('profileImage', value)}
            placeholder="https://example.com/your-photo.jpg"
            disabled={disabled}
            type="url"
          />
        </div>
      </FormSection>

      {/* Contact Information */}
      <FormSection
        title="Social Links"
        icon={<Globe className="h-5 w-5 text-accent-green" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <InputField
            label="GitHub URL"
            value={data.contactInfo.github}
            onChange={value => updateContactInfo('github', value)}
            placeholder="https://github.com/yourusername"
            disabled={disabled}
            type="url"
          />

          <InputField
            label="LinkedIn URL"
            value={data.contactInfo.linkedin}
            onChange={value => updateContactInfo('linkedin', value)}
            placeholder="https://linkedin.com/in/yourprofile"
            disabled={disabled}
            type="url"
          />

          <InputField
            label="Upwork URL"
            value={data.contactInfo.upwork}
            onChange={value => updateContactInfo('upwork', value)}
            placeholder="https://www.upwork.com/freelancers/yourprofile"
            disabled={disabled}
            type="url"
          />
        </div>
      </FormSection>

      {/* Hero Content */}
      <FormSection
        title="Hero Section Content"
        icon={<FileText className="h-5 w-5 text-accent-green" />}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <InputField
            label="Introduction"
            value={data.heroContent.introduction}
            onChange={value => updateHeroContent('introduction', value)}
            placeholder="Brief introduction about yourself..."
            disabled={disabled}
            type="textarea"
            rows={3}
          />

          <InputField
            label="Description"
            value={data.heroContent.description}
            onChange={value => updateHeroContent('description', value)}
            placeholder="Detailed description of your skills and experience..."
            disabled={disabled}
            type="textarea"
            rows={4}
          />

          <InputField
            label="Hobbies & Interests"
            value={data.heroContent.hobbies}
            onChange={value => updateHeroContent('hobbies', value)}
            placeholder="What you enjoy outside of work..."
            disabled={disabled}
            type="textarea"
            rows={2}
          />
        </div>
      </FormSection>
    </div>
  )
}
