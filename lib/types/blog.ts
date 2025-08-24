export interface BlogPost {
  id?: string
  title: string
  excerpt: string
  content: string
  slug: string
  category: string
  featured: boolean
  publishedAt?: Date
  status: 'draft' | 'published' | 'archived'
  readTime: string
  featuredImage?: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface BlogFormData {
  title: string
  excerpt: string
  content: string
  slug: string
  category: string
  featured: boolean
  status: 'draft' | 'published' | 'archived'
  featuredImage: string
  tags: string[]
  seoTitle: string
  seoDescription: string
}

export interface BlogFilter {
  category?: string
  status?: 'draft' | 'published' | 'archived'
  featured?: boolean
  search?: string
}

export const defaultBlogData: BlogFormData = {
  title: '',
  excerpt: '',
  content: '',
  slug: '',
  category: 'Tech',
  featured: false,
  status: 'draft',
  featuredImage: '',
  tags: [],
  seoTitle: '',
  seoDescription: '',
}

export const blogCategories = [
  { value: 'Tech', label: 'Technology' },
  { value: 'React', label: 'React' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Backend', label: 'Backend' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Tutorial', label: 'Tutorial' },
  { value: 'Opinion', label: 'Opinion' },
  { value: 'News', label: 'News' },
]

export const blogStatuses = [
  { value: 'draft', label: 'Draft', color: 'text-yellow-400' },
  { value: 'published', label: 'Published', color: 'text-green-400' },
  { value: 'archived', label: 'Archived', color: 'text-gray-400' },
]

export function calculateReadTime(content: string): string {
  // Estimate read time based on ~200 words per minute
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const readTime = Math.ceil(wordCount / wordsPerMinute)

  return readTime === 1 ? '1 min' : `${readTime} min`
}

export function generateExcerpt(
  content: string,
  maxLength: number = 150
): string {
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '').trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  // Cut at word boundary
  const truncated = plainText.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}
