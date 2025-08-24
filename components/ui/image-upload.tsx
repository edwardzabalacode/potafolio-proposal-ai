'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/contexts/auth-context'
import {
  createStorageService,
  FileValidators,
  getStorageErrorMessage,
  StorageError,
} from '@/lib/firebase/storage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertCircle,
  Camera,
  Trash2,
} from 'lucide-react'

export interface ImageUploadProps {
  currentImage?: string
  onImageUpload: (imageUrl: string) => void
  onImageRemove?: () => void
  uploadType: 'profile' | 'project' | 'blog'
  entityId?: string // For project/blog uploads
  disabled?: boolean
  maxSizeMB?: number
  className?: string
  placeholder?: string
  acceptedTypes?: string[]
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
  success: boolean
}

export function ImageUpload({
  currentImage,
  onImageUpload,
  onImageRemove,
  uploadType,
  entityId,
  disabled = false,
  maxSizeMB = 5,
  className = '',
  placeholder,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}: ImageUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    success: false,
  })
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const resetState = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      success: false,
    })
    setPreviewUrl(null)
  }, [])

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!FileValidators.images(file)) {
        return `Invalid file type. Please upload: ${acceptedTypes.join(', ')}`
      }

      // Check file size
      if (!FileValidators.maxSize(maxSizeMB)(file)) {
        return `File size must be less than ${maxSizeMB}MB`
      }

      return null
    },
    [acceptedTypes, maxSizeMB]
  )

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!user?.uid) {
        setUploadState(prev => ({
          ...prev,
          error: 'You must be signed in to upload images',
        }))
        return
      }

      const validationError = validateFile(file)
      if (validationError) {
        setUploadState(prev => ({ ...prev, error: validationError }))
        return
      }

      try {
        resetState()
        setUploadState(prev => ({ ...prev, uploading: true }))

        // Create preview
        const preview = URL.createObjectURL(file)
        setPreviewUrl(preview)

        const storageService = createStorageService(user.uid)
        let uploadPromise: Promise<string>

        const onProgress = (progress: number) => {
          setUploadState(prev => ({ ...prev, progress }))
        }

        // Choose upload method based on type
        switch (uploadType) {
          case 'profile':
            uploadPromise = storageService.uploadProfileAvatar(file, onProgress)
            break
          case 'project':
            if (!entityId)
              throw new Error('Project ID required for project image upload')
            uploadPromise = storageService.uploadProjectImage(
              entityId,
              file,
              onProgress
            )
            break
          case 'blog':
            if (!entityId)
              throw new Error('Post ID required for blog image upload')
            uploadPromise = storageService.uploadBlogFeaturedImage(
              entityId,
              file,
              onProgress
            )
            break
          default:
            throw new Error(`Unsupported upload type: ${uploadType}`)
        }

        const downloadURL = await uploadPromise

        setUploadState(prev => ({
          ...prev,
          uploading: false,
          success: true,
          progress: 100,
        }))

        // Clean up preview
        URL.revokeObjectURL(preview)
        setPreviewUrl(null)

        // Notify parent component
        onImageUpload(downloadURL)

        // Reset success state after 2 seconds
        setTimeout(() => {
          setUploadState(prev => ({ ...prev, success: false }))
        }, 2000)
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Upload error:', error)

        const storageError = error as StorageError
        const errorMessage = storageError.code
          ? getStorageErrorMessage({
              code: storageError.code,
              message: storageError.message,
            })
          : storageError.message || 'Failed to upload image'

        setUploadState(prev => ({
          ...prev,
          uploading: false,
          error: errorMessage,
        }))

        // Clean up preview on error
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
          setPreviewUrl(null)
        }
      }
    },
    [
      user?.uid,
      uploadType,
      entityId,
      validateFile,
      onImageUpload,
      previewUrl,
      resetState,
    ]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
      // Clear input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [handleFileUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find(file => acceptedTypes.includes(file.type))

      if (imageFile) {
        handleFileUpload(imageFile)
      } else if (files.length > 0) {
        setUploadState(prev => ({
          ...prev,
          error: 'Please drop an image file (JPEG, PNG, WebP, or GIF)',
        }))
      }
    },
    [acceptedTypes, handleFileUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove()
    }
    resetState()
  }

  const displayImage = previewUrl || currentImage
  const showUploadArea = !displayImage || uploadState.uploading

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Current Image Display */}
      {displayImage && !showUploadArea && (
        <Card className="relative overflow-hidden">
          <div className="aspect-video w-full">
            <Image
              src={displayImage}
              alt="Uploaded image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Image Controls */}
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={openFileDialog}
                  className="bg-accent-green text-bg-primary hover:bg-green-600"
                >
                  <Camera size={16} />
                  Replace
                </Button>
                {onImageRemove && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRemoveImage}
                    variant="outline"
                    className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                  >
                    <Trash2 size={16} />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Upload Area */}
      {showUploadArea && (
        <Card
          className={`transition-all duration-200 ${
            dragOver
              ? 'bg-accent-green/10 border-accent-green'
              : 'border-accent-green/20 hover:border-accent-green/40'
          } ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <div className="flex flex-col items-center justify-center p-8 text-center">
            {uploadState.uploading ? (
              <>
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-accent-green" />
                <p className="text-primary mb-2 font-medium">
                  Uploading image... {Math.round(uploadState.progress)}%
                </p>
                <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-bg-secondary">
                  <div
                    className="h-full bg-accent-green transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              </>
            ) : uploadState.success ? (
              <>
                <Check className="mb-4 h-12 w-12 text-green-500" />
                <p className="font-medium text-green-500">Upload successful!</p>
              </>
            ) : (
              <>
                <div className="bg-accent-green/10 mb-4 rounded-full p-4">
                  <Upload className="h-8 w-8 text-accent-green" />
                </div>
                <h3 className="text-primary mb-2 text-lg font-semibold">
                  {placeholder || 'Upload Image'}
                </h3>
                <p className="mb-4 text-sm text-text-muted">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-xs text-text-muted">
                  Supports:{' '}
                  {acceptedTypes
                    .map(type => type.split('/')[1].toUpperCase())
                    .join(', ')}
                  • Max size: {maxSizeMB}MB
                </p>
                {!disabled && (
                  <Button
                    type="button"
                    className="mt-4 bg-accent-green text-bg-primary hover:bg-green-600"
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Choose File
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {/* Error Display */}
      {uploadState.error && (
        <Card className="border-red-400/20 bg-red-400/10">
          <div className="flex items-center p-4 text-red-400">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Upload Error</p>
              <p className="text-sm opacity-90">{uploadState.error}</p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={resetState}
              className="ml-auto"
              variant="secondary"
            >
              <X size={16} />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
