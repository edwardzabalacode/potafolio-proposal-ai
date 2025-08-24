export interface Project {
  id?: string
  title: string
  company: string
  description: string
  longDescription?: string
  image: string // Main image for backward compatibility
  images: string[] // Array of multiple images
  technologies: string[]
  slug: string
  category: string
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  order: number
  status: 'draft' | 'published' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface ProjectFormData {
  title: string
  company: string
  description: string
  longDescription: string
  image: string // Main image for backward compatibility
  images: string[] // Array of multiple images
  technologies: string[]
  slug: string
  category: string
  liveUrl: string
  githubUrl: string
  featured: boolean
  status: 'draft' | 'published' | 'archived'
}

export interface ProjectFilter {
  category?: string
  status?: 'draft' | 'published' | 'archived'
  featured?: boolean
  search?: string
}

export const defaultProjectData: ProjectFormData = {
  title: '',
  company: '',
  description: '',
  longDescription: '',
  image: '',
  images: [],
  technologies: [],
  slug: '',
  category: 'web',
  liveUrl: '',
  githubUrl: '',
  featured: false,
  status: 'draft',
}

export const projectCategories = [
  { value: 'web', label: 'Web Development' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'desktop', label: 'Desktop Application' },
  { value: 'api', label: 'API/Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'other', label: 'Other' },
]

export const projectStatuses = [
  { value: 'draft', label: 'Draft', color: 'text-yellow-400' },
  { value: 'published', label: 'Published', color: 'text-green-400' },
  { value: 'archived', label: 'Archived', color: 'text-gray-400' },
]
