import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  listAll,
  StorageReference,
  UploadMetadata,
  UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from './config'

// TypeScript interfaces for storage operations
export interface FileUploadOptions {
  file: File
  path: string
  metadata?: UploadMetadata
  onProgress?: (progress: number) => void
  onError?: (error: StorageError) => void
  onComplete?: (downloadURL: string) => void
}

export interface FileMetadata {
  name: string
  fullPath: string
  size: number
  contentType: string
  downloadURL: string
  timeCreated: string
  updated: string
  customMetadata?: { [key: string]: string }
}

export interface StorageError {
  code: string
  message: string
}

export interface ImageUploadOptions extends FileUploadOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

// Storage paths structure for user organization
export const StoragePaths = {
  // User-specific paths
  userRoot: (userUID: string) => `users/${userUID}`,

  // Profile images
  profileImage: (userUID: string) => `users/${userUID}/profile/avatar`,
  profileCover: (userUID: string) => `users/${userUID}/profile/cover`,

  // Project images
  projectImages: (userUID: string, projectId: string) =>
    `users/${userUID}/projects/${projectId}/images`,
  projectThumbnail: (userUID: string, projectId: string) =>
    `users/${userUID}/projects/${projectId}/thumbnail`,

  // Blog images
  blogImages: (userUID: string, postId: string) =>
    `users/${userUID}/blog/${postId}/images`,
  blogFeatured: (userUID: string, postId: string) =>
    `users/${userUID}/blog/${postId}/featured`,

  // General media
  media: (userUID: string) => `users/${userUID}/media`,
  documents: (userUID: string) => `users/${userUID}/documents`,

  // Temporary uploads
  temp: (userUID: string) => `users/${userUID}/temp`,
} as const

// Firebase Storage service class
export class StorageService {
  private userUID: string

  constructor(userUID: string) {
    this.userUID = userUID
  }

  // Helper method to create storage reference
  private createRef(path: string): StorageReference {
    return ref(storage, path)
  }

  // Upload file with progress tracking
  async uploadFile(options: FileUploadOptions): Promise<string> {
    try {
      const { file, path, metadata, onProgress, onError, onComplete } = options
      const storageRef = this.createRef(path)

      if (onProgress) {
        // Use resumable upload for progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file, metadata)

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              onProgress(progress)
            },
            error => {
              const storageError = this.handleError(error)
              onError?.(storageError)
              reject(storageError)
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref
                )
                onComplete?.(downloadURL)
                resolve(downloadURL)
              } catch (error) {
                const storageError = this.handleError(error)
                onError?.(storageError)
                reject(storageError)
              }
            }
          )
        })
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file, metadata)
        return await getDownloadURL(snapshot.ref)
      }
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Upload image with optimization
  async uploadImage(options: ImageUploadOptions): Promise<string> {
    try {
      const {
        file,
        path,
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
      } = options

      // Optimize image before upload
      const optimizedFile = await this.optimizeImage(file, {
        maxWidth,
        maxHeight,
        quality,
      })

      return await this.uploadFile({
        ...options,
        file: optimizedFile,
        path,
      })
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Upload profile avatar
  async uploadProfileAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const fileName = `avatar_${Date.now()}.${this.getFileExtension(file)}`
    const path = `${StoragePaths.profileImage(this.userUID)}/${fileName}`

    return await this.uploadImage({
      file,
      path,
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.9,
      onProgress,
      metadata: {
        customMetadata: {
          type: 'profile_avatar',
          userUID: this.userUID,
        },
      },
    })
  }

  // Upload project image
  async uploadProjectImage(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const fileName = `${Date.now()}_${this.sanitizeFileName(file.name)}`
    const path = `${StoragePaths.projectImages(this.userUID, projectId)}/${fileName}`

    return await this.uploadImage({
      file,
      path,
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      onProgress,
      metadata: {
        customMetadata: {
          type: 'project_image',
          projectId,
          userUID: this.userUID,
        },
      },
    })
  }

  // Upload blog featured image
  async uploadBlogFeaturedImage(
    postId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const fileName = `featured_${Date.now()}.${this.getFileExtension(file)}`
    const path = `${StoragePaths.blogFeatured(this.userUID, postId)}/${fileName}`

    return await this.uploadImage({
      file,
      path,
      maxWidth: 1200,
      maxHeight: 630,
      quality: 0.85,
      onProgress,
      metadata: {
        customMetadata: {
          type: 'blog_featured',
          postId,
          userUID: this.userUID,
        },
      },
    })
  }

  // Delete file
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = this.createRef(path)
      await deleteObject(storageRef)
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Get file metadata
  async getFileMetadata(path: string): Promise<FileMetadata> {
    try {
      const storageRef = this.createRef(path)
      const metadata = await getMetadata(storageRef)
      const downloadURL = await getDownloadURL(storageRef)

      return {
        name: metadata.name,
        fullPath: metadata.fullPath,
        size: metadata.size,
        contentType: metadata.contentType || 'unknown',
        downloadURL,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        customMetadata: metadata.customMetadata,
      }
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // List files in a directory
  async listFiles(directoryPath: string): Promise<FileMetadata[]> {
    try {
      const storageRef = this.createRef(directoryPath)
      const result = await listAll(storageRef)

      const filePromises = result.items.map(async itemRef => {
        const metadata = await getMetadata(itemRef)
        const downloadURL = await getDownloadURL(itemRef)

        return {
          name: metadata.name,
          fullPath: metadata.fullPath,
          size: metadata.size,
          contentType: metadata.contentType || 'unknown',
          downloadURL,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          customMetadata: metadata.customMetadata,
        }
      })

      return await Promise.all(filePromises)
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Get user's project images
  async getProjectImages(projectId: string): Promise<FileMetadata[]> {
    const path = StoragePaths.projectImages(this.userUID, projectId)
    return await this.listFiles(path)
  }

  // Get user's media files
  async getUserMedia(): Promise<FileMetadata[]> {
    const path = StoragePaths.media(this.userUID)
    return await this.listFiles(path)
  }

  // Clean up temporary files older than specified hours
  async cleanupTempFiles(hoursOld: number = 24): Promise<void> {
    try {
      const tempPath = StoragePaths.temp(this.userUID)
      const files = await this.listFiles(tempPath)
      const cutoffTime = Date.now() - hoursOld * 60 * 60 * 1000

      const deletePromises = files
        .filter(file => new Date(file.timeCreated).getTime() < cutoffTime)
        .map(file => this.deleteFile(file.fullPath))

      await Promise.all(deletePromises)
    } catch (error: unknown) {
      // Ignore errors for temp cleanup
      // eslint-disable-next-line no-console
      console.warn('Temp cleanup failed:', error)
    }
  }

  // Image optimization utility
  private async optimizeImage(
    file: File,
    options: { maxWidth: number; maxHeight: number; quality: number }
  ): Promise<File> {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        const { maxWidth, maxHeight, quality } = options

        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          blob => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(optimizedFile)
            } else {
              resolve(file) // Fallback to original
            }
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Utility methods
  private getFileExtension(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() || 'unknown'
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase()
  }

  // Error handling
  private handleError(error: unknown): StorageError {
    const storageError = error as { code?: string; message?: string }
    return {
      code: storageError.code || 'storage/unknown-error',
      message: storageError.message || 'An unknown storage error occurred',
    }
  }
}

// Factory function to create Storage service instance
export const createStorageService = (userUID: string): StorageService => {
  return new StorageService(userUID)
}

// Helper function to get user-friendly error messages
export const getStorageErrorMessage = (error: StorageError): string => {
  switch (error.code) {
    case 'storage/unauthorized':
      return 'You do not have permission to access this file.'
    case 'storage/canceled':
      return 'File upload was cancelled.'
    case 'storage/unknown':
      return 'An unknown error occurred during file upload.'
    case 'storage/object-not-found':
      return 'The requested file was not found.'
    case 'storage/bucket-not-found':
      return 'Storage bucket not found.'
    case 'storage/project-not-found':
      return 'Project not found.'
    case 'storage/quota-exceeded':
      return 'Storage quota exceeded.'
    case 'storage/unauthenticated':
      return 'You must be signed in to upload files.'
    case 'storage/retry-limit-exceeded':
      return 'Maximum retry limit exceeded. Please try again.'
    case 'storage/invalid-checksum':
      return 'File upload failed due to invalid checksum.'
    default:
      return error.message || 'An unexpected storage error occurred.'
  }
}

// Utility function to validate file types
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type)
}

// Utility function to validate file size
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

// Common file type validators
export const FileValidators = {
  images: (file: File) =>
    validateFileType(file, [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ]),

  documents: (file: File) =>
    validateFileType(file, [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]),

  maxSize: (maxMB: number) => (file: File) => validateFileSize(file, maxMB),
} as const

// Export storage instance for direct use if needed
export { storage }
