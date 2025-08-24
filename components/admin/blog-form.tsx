'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { blogService } from '@/lib/services/blog-service'
import {
  BlogPost,
  BlogFormData,
  defaultBlogData,
  blogCategories,
  blogStatuses,
  generateExcerpt,
  calculateReadTime,
} from '@/lib/types/blog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  Loader2,
  Save,
  X,
  Plus,
  FileText,
  Image as ImageIcon,
  Tag,
  Search,
} from 'lucide-react'

interface BlogFormProps {
  post?: BlogPost | null
  onSave: () => void
  onCancel: () => void
}

interface FormSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

function FormSection({
  title,
  icon,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="border-b-2 border-accent-green bg-bg-tertiary p-4">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-primary text-lg font-semibold">{title}</h3>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </Card>
  )
}

interface InputFieldProps {
  label: string
  value: string | number | boolean
  onChange: (value: string | number | boolean) => void
  placeholder?: string
  disabled?: boolean
  type?: 'text' | 'url' | 'textarea' | 'select' | 'checkbox'
  options?: { value: string; label: string }[]
  rows?: number
  required?: boolean
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  options,
  rows = 3,
  required = false,
}: InputFieldProps) {
  const baseClassName =
    'w-full rounded-lg border-2 border-accent-green/20 bg-bg-secondary px-4 py-3 text-primary placeholder-text-muted transition-colors focus:border-accent-green focus:outline-none focus:ring-0 disabled:opacity-50'

  if (type === 'checkbox') {
    return (
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="border-accent-green/20 h-5 w-5 rounded border-2 bg-bg-secondary text-accent-green focus:ring-accent-green focus:ring-offset-0"
        />
        <label className="text-primary text-sm font-medium">{label}</label>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-primary block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={baseClassName}
        />
      ) : type === 'select' ? (
        <select
          value={value as string}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={baseClassName}
        >
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={baseClassName}
        />
      )}
    </div>
  )
}

export function BlogForm({ post, onSave, onCancel }: BlogFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<BlogFormData>(defaultBlogData)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [autoExcerpt, setAutoExcerpt] = useState(true)

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        slug: post.slug,
        category: post.category,
        featured: post.featured,
        status: post.status,
        featuredImage: post.featuredImage || '',
        tags: post.tags,
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || '',
      })
      setAutoExcerpt(false)
    }
  }, [post])

  const updateField = (
    field: keyof BlogFormData,
    value: string | string[] | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Auto-generate slug when title changes
    if (field === 'title' && !post && typeof value === 'string') {
      const slug = blogService.generateSlug(value)
      setFormData(prev => ({ ...prev, slug }))
    }

    // Auto-generate excerpt from content if enabled
    if (field === 'content' && autoExcerpt && typeof value === 'string') {
      const excerpt = generateExcerpt(value)
      setFormData(prev => ({ ...prev, excerpt }))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) return
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required')
      return
    }

    try {
      setSaving(true)

      if (post?.id) {
        await blogService.updatePost(user.uid, post.id, formData)
      } else {
        await blogService.createPost(user.uid, formData)
      }

      onSave()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving blog post:', error)
      alert('Error saving blog post')
    } finally {
      setSaving(false)
    }
  }

  const currentReadTime = calculateReadTime(formData.content)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <FormSection
        title="Basic Information"
        icon={<FileText className="h-5 w-5 text-accent-green" />}
      >
        <div className="space-y-4">
          <InputField
            label="Post Title"
            value={formData.title}
            onChange={value => updateField('title', value as string)}
            placeholder="Your awesome blog post title"
            required
            disabled={saving}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Category"
              value={formData.category}
              onChange={value => updateField('category', value as string)}
              type="select"
              options={blogCategories}
              disabled={saving}
            />

            <InputField
              label="Status"
              value={formData.status}
              onChange={value => updateField('status', value as string)}
              type="select"
              options={blogStatuses}
              disabled={saving}
            />
          </div>

          <InputField
            label="URL Slug"
            value={formData.slug}
            onChange={value => updateField('slug', value as string)}
            placeholder="your-awesome-blog-post"
            required
            disabled={saving}
          />
          <p className="mt-1 text-xs text-text-muted">
            This will be used in the post URL. Use lowercase letters, numbers,
            and hyphens only.
          </p>
        </div>
      </FormSection>

      {/* Content */}
      <FormSection
        title="Content"
        icon={<FileText className="h-5 w-5 text-accent-green" />}
      >
        <div className="space-y-4">
          <InputField
            label="Post Content"
            value={formData.content}
            onChange={value => updateField('content', value as string)}
            placeholder="Write your blog post content here. You can use markdown formatting..."
            type="textarea"
            rows={15}
            required
            disabled={saving}
          />

          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>Estimated read time: {currentReadTime}</span>
            <span>Characters: {formData.content.length}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={autoExcerpt}
                onChange={e => setAutoExcerpt(e.target.checked)}
                disabled={saving}
                className="border-accent-green/20 h-4 w-4 rounded border-2 bg-bg-secondary text-accent-green"
              />
              <label className="text-primary text-sm">
                Auto-generate excerpt from content
              </label>
            </div>
          </div>

          <InputField
            label="Excerpt"
            value={formData.excerpt}
            onChange={value => updateField('excerpt', value as string)}
            placeholder="Brief description of your post..."
            type="textarea"
            rows={3}
            disabled={saving || autoExcerpt}
          />
        </div>
      </FormSection>

      {/* Media */}
      <FormSection
        title="Featured Image"
        icon={<ImageIcon className="h-5 w-5 text-accent-green" />}
      >
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="text-primary mb-3 block text-sm font-medium">
              Featured Image
            </label>
            <ImageUpload
              currentImage={formData.featuredImage}
              onImageUpload={imageUrl => updateField('featuredImage', imageUrl)}
              onImageRemove={() => updateField('featuredImage', '')}
              uploadType="blog"
              entityId={post?.id || 'temp'}
              disabled={saving}
              maxSizeMB={8}
              placeholder="Upload featured image for your blog post"
            />
            <p className="mt-2 text-xs text-text-muted">
              Upload a featured image for your blog post. Recommended size:
              1200x630px for optimal social sharing.
            </p>
          </div>

          {/* Alternative URL Input */}
          <div>
            <InputField
              label="Or enter image URL manually"
              value={formData.featuredImage}
              onChange={value => updateField('featuredImage', value as string)}
              placeholder="https://example.com/featured-image.jpg"
              type="url"
              disabled={saving}
            />
            <p className="mt-1 text-xs text-text-muted">
              You can also provide a direct URL to an image hosted elsewhere.
            </p>
          </div>
        </div>
      </FormSection>

      {/* Tags */}
      <FormSection
        title="Tags"
        icon={<Tag className="h-5 w-5 text-accent-green" />}
      >
        <div className="space-y-4">
          <div>
            <label className="text-primary mb-2 block text-sm font-medium">
              Add Tags
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="React, JavaScript, etc."
                disabled={saving}
                className="border-accent-green/20 text-primary flex-1 rounded-lg border-2 bg-bg-secondary px-4 py-2 placeholder-text-muted transition-colors focus:border-accent-green focus:outline-none focus:ring-0"
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || saving}
                className="bg-accent-green text-bg-primary hover:bg-green-600"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {formData.tags.length > 0 && (
            <div>
              <label className="text-primary mb-2 block text-sm font-medium">
                Selected Tags ({formData.tags.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-accent-green/10 border-accent-green/20 inline-flex items-center rounded-full border px-3 py-1 text-sm text-accent-green"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={saving}
                      className="ml-2 transition-colors hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* SEO & Settings */}
      <FormSection
        title="SEO & Settings"
        icon={<Search className="h-5 w-5 text-accent-green" />}
      >
        <div className="space-y-4">
          <InputField
            label="SEO Title"
            value={formData.seoTitle}
            onChange={value => updateField('seoTitle', value as string)}
            placeholder="Optional SEO title (defaults to post title)"
            disabled={saving}
          />

          <InputField
            label="SEO Description"
            value={formData.seoDescription}
            onChange={value => updateField('seoDescription', value as string)}
            placeholder="Meta description for search engines"
            type="textarea"
            rows={2}
            disabled={saving}
          />

          <InputField
            label="Featured Post"
            value={formData.featured}
            onChange={value => updateField('featured', value as boolean)}
            type="checkbox"
            disabled={saving}
          />
          <p className="text-sm text-text-muted">
            Featured posts will be highlighted and may appear first in listings.
          </p>
        </div>
      </FormSection>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={saving}
          className="border-red-400 text-red-400 hover:bg-red-400 hover:text-bg-primary"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={
            saving || !formData.title.trim() || !formData.content.trim()
          }
          className="bg-accent-green text-bg-primary hover:bg-green-600"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
}
