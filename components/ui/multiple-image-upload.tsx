'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Plus, Loader2 } from 'lucide-react'
import { storage } from '@/lib/firebase/storage'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { BrutalistButton } from './brutalist-button'
import { cn } from '@/lib/utils'

interface MultipleImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
  maxSizeMB?: number
  uploadPath?: string
}

export function MultipleImageUpload({
  images = [],
  onImagesChange,
  maxImages = 5,
  disabled = false,
  maxSizeMB = 5,
  uploadPath = 'projects',
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState<boolean[]>([])
  const [dragOver, setDragOver] = useState(false)

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const timestamp = Date.now()
      const fileName = `${uploadPath}/${timestamp}-${file.name}`
      const storageRef = ref(storage, fileName)

      const snapshot = await uploadBytes(storageRef, file)
      return await getDownloadURL(snapshot.ref)
    },
    [uploadPath]
  )

  const deleteImage = async (imageUrl: string) => {
    try {
      // Extract file path from URL to delete from storage
      const urlParts = imageUrl.split('/o/')
      if (urlParts.length > 1) {
        const filePath = decodeURIComponent(urlParts[1].split('?')[0])
        const storageRef = ref(storage, filePath)
        await deleteObject(storageRef)
      }
    } catch (error) {
      // Could not delete image from storage
    }
  }

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (disabled) return

      const availableSlots = maxImages - images.length
      const filesToUpload = Array.from(files).slice(0, availableSlots)

      if (filesToUpload.length === 0) return

      // Validate file sizes
      const oversizedFiles = filesToUpload.filter(
        file => file.size > maxSizeMB * 1024 * 1024
      )
      if (oversizedFiles.length > 0) {
        alert(`Algunos archivos exceden el límite de ${maxSizeMB}MB`)
        return
      }

      // Validate file types
      const invalidFiles = filesToUpload.filter(
        file => !file.type.startsWith('image/')
      )
      if (invalidFiles.length > 0) {
        alert('Solo se permiten archivos de imagen')
        return
      }

      setUploading(prev => [
        ...prev,
        ...new Array(filesToUpload.length).fill(true),
      ])

      try {
        const uploadPromises = filesToUpload.map(file => uploadImage(file))

        const newImageUrls = await Promise.all(uploadPromises)
        onImagesChange([...images, ...newImageUrls])
      } catch (error) {
        // Error uploading images
        alert('Error al subir las imágenes')
      } finally {
        setUploading([])
      }
    },
    [images, onImagesChange, maxImages, disabled, maxSizeMB, uploadImage]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files) {
        handleFileSelect(e.dataTransfer.files)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = async (index: number) => {
    if (disabled) return

    const imageToRemove = images[index]

    // Delete from storage
    await deleteImage(imageToRemove)

    // Update images array
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      {/* Current Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((imageUrl, index) => (
            <div
              key={imageUrl}
              className="shadow-brutal-sm group relative aspect-square overflow-hidden border-4 border-border transition-all duration-300 hover:border-accent-green"
            >
              <Image
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover"
              />
              {!disabled && (
                <button
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && !disabled && (
        <div
          className={cn(
            'border-4 border-dashed border-border p-8 text-center transition-colors duration-300',
            dragOver && 'bg-accent-green/10 border-accent-green',
            'hover:bg-accent-green/5 hover:border-accent-green'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
            id="multiple-image-upload"
            disabled={disabled || uploading.length > 0}
          />

          {uploading.length > 0 ? (
            <div className="flex flex-col items-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-accent-green" />
              <p className="font-mono text-text-secondary">
                Subiendo {uploading.length} imagen(es)...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Plus className="mb-4 h-12 w-12 text-text-muted" />
              <p className="mb-2 font-mono text-text-primary">
                Agrega más imágenes
              </p>
              <p className="mb-4 font-mono text-sm text-text-muted">
                {images.length}/{maxImages} imágenes • Máximo {maxSizeMB}MB por
                imagen
              </p>
              <BrutalistButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById('multiple-image-upload')?.click()
                }
              >
                <Upload className="h-4 w-4" />
                Seleccionar Imágenes
              </BrutalistButton>
            </div>
          )}
        </div>
      )}

      {/* Max Images Reached */}
      {!canAddMore && (
        <div className="rounded border-4 border-border bg-bg-tertiary p-4 text-center">
          <p className="font-mono text-text-muted">
            Máximo de {maxImages} imágenes alcanzado
          </p>
        </div>
      )}
    </div>
  )
}
