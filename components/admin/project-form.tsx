'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { projectsService } from '@/lib/services/projects-service'
import {
  Project,
  ProjectFormData,
  defaultProjectData,
  projectCategories,
  projectStatuses,
} from '@/lib/types/project'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'
import { MultipleImageUpload } from '@/components/ui/multiple-image-upload'
import {
  Loader2,
  Save,
  X,
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Star,
} from 'lucide-react'

interface ProjectFormProps {
  project?: Project | null
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

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ProjectFormData>(defaultProjectData)
  const [saving, setSaving] = useState(false)
  const [techInput, setTechInput] = useState('')

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        company: project.company,
        description: project.description,
        longDescription: project.longDescription || '',
        image: project.image,
        images: project.images || [], // Backward compatibility
        technologies: project.technologies,
        slug: project.slug,
        category: project.category,
        liveUrl: project.liveUrl || '',
        githubUrl: project.githubUrl || '',
        featured: project.featured,
        status: project.status,
      })
    }
  }, [project])

  const updateField = (
    field: keyof ProjectFormData,
    value: string | string[] | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Auto-generate slug when title changes
    if (field === 'title' && !project && typeof value === 'string') {
      const slug = projectsService.generateSlug(value)
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }))
      setTechInput('')
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) return
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required')
      return
    }

    try {
      setSaving(true)

      if (project?.id) {
        await projectsService.updateProject(user.uid, project.id, formData)
      } else {
        await projectsService.createProject(user.uid, formData)
      }

      onSave()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving project:', error)
      alert('Error saving project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <FormSection
        title="Basic Information"
        icon={<Code className="h-5 w-5 text-accent-green" />}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Project Title"
            value={formData.title}
            onChange={value => updateField('title', value as string)}
            placeholder="My Awesome Project"
            required
            disabled={saving}
          />

          <InputField
            label="Company/Client"
            value={formData.company}
            onChange={value => updateField('company', value as string)}
            placeholder="Company Name or Personal"
            required
            disabled={saving}
          />

          <InputField
            label="Category"
            value={formData.category}
            onChange={value => updateField('category', value as string)}
            type="select"
            options={projectCategories}
            disabled={saving}
          />

          <InputField
            label="Status"
            value={formData.status}
            onChange={value => updateField('status', value as string)}
            type="select"
            options={projectStatuses}
            disabled={saving}
          />
        </div>

        <div className="mt-4">
          <InputField
            label="URL Slug"
            value={formData.slug}
            onChange={value => updateField('slug', value as string)}
            placeholder="my-awesome-project"
            required
            disabled={saving}
          />
          <p className="mt-1 text-xs text-text-muted">
            This will be used in the project URL. Use lowercase letters,
            numbers, and hyphens only.
          </p>
        </div>

        <div className="mt-4">
          <InputField
            label="Short Description"
            value={formData.description}
            onChange={value => updateField('description', value as string)}
            placeholder="Brief description of the project..."
            type="textarea"
            rows={3}
            required
            disabled={saving}
          />
        </div>

        <div className="mt-4">
          <InputField
            label="Detailed Description"
            value={formData.longDescription}
            onChange={value => updateField('longDescription', value as string)}
            placeholder="Detailed description with technical details, challenges, and solutions..."
            type="textarea"
            rows={6}
            disabled={saving}
          />
        </div>
      </FormSection>

      {/* Media & Links */}
      <FormSection
        title="Media & Links"
        icon={<ImageIcon className="h-5 w-5 text-accent-green" />}
      >
        <div className="space-y-6">
          {/* Main Project Image */}
          <div>
            <label className="text-primary mb-3 block text-sm font-medium">
              Main Project Image
            </label>
            <ImageUpload
              currentImage={formData.image}
              onImageUpload={imageUrl => updateField('image', imageUrl)}
              onImageRemove={() => updateField('image', '')}
              uploadType="project"
              entityId={project?.id || 'temp'}
              disabled={saving}
              maxSizeMB={10}
              placeholder="Upload main project image"
            />
            <p className="mt-2 text-xs text-text-muted">
              Imagen principal que aparecerá en la lista de proyectos. Tamaño
              recomendado: 1920x1080px.
            </p>
          </div>

          {/* Multiple Project Images */}
          <div>
            <label className="text-primary mb-3 block text-sm font-medium">
              Galería de Imágenes del Proyecto (Opcional)
            </label>
            <MultipleImageUpload
              images={formData.images}
              onImagesChange={images => updateField('images', images)}
              maxImages={5}
              disabled={saving}
              maxSizeMB={10}
              uploadPath={`projects/${project?.id || 'temp'}/gallery`}
            />
            <p className="mt-2 text-xs text-text-muted">
              Sube hasta 5 imágenes adicionales para mostrar en el detalle del
              proyecto con carousel.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Live Demo URL"
              value={formData.liveUrl}
              onChange={value => updateField('liveUrl', value as string)}
              placeholder="https://myproject.com"
              type="url"
              disabled={saving}
            />

            <InputField
              label="GitHub Repository URL"
              value={formData.githubUrl}
              onChange={value => updateField('githubUrl', value as string)}
              placeholder="https://github.com/username/project"
              type="url"
              disabled={saving}
            />
          </div>
        </div>
      </FormSection>

      {/* Technologies */}
      <FormSection
        title="Technologies"
        icon={<LinkIcon className="h-5 w-5 text-accent-green" />}
      >
        <div className="space-y-4">
          <div>
            <label className="text-primary mb-2 block text-sm font-medium">
              Add Technologies
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTechnology()
                  }
                }}
                placeholder="React, TypeScript, etc."
                disabled={saving}
                className="border-accent-green/20 text-primary flex-1 rounded-lg border-2 bg-bg-secondary px-4 py-2 placeholder-text-muted transition-colors focus:border-accent-green focus:outline-none focus:ring-0"
              />
              <Button
                type="button"
                onClick={addTechnology}
                disabled={!techInput.trim() || saving}
                className="bg-accent-green text-bg-primary hover:bg-green-600"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {formData.technologies.length > 0 && (
            <div>
              <label className="text-primary mb-2 block text-sm font-medium">
                Selected Technologies ({formData.technologies.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map(tech => (
                  <span
                    key={tech}
                    className="bg-accent-green/10 border-accent-green/20 inline-flex items-center rounded-full border px-3 py-1 text-sm text-accent-green"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
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

      {/* Settings */}
      <FormSection
        title="Settings"
        icon={<Star className="h-5 w-5 text-accent-green" />}
      >
        <div className="space-y-4">
          <InputField
            label="Featured Project"
            value={formData.featured}
            onChange={value => updateField('featured', value as boolean)}
            type="checkbox"
            disabled={saving}
          />
          <p className="text-sm text-text-muted">
            Featured projects will be highlighted and may appear first in
            listings.
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
            saving || !formData.title.trim() || !formData.description.trim()
          }
          className="bg-accent-green text-bg-primary hover:bg-green-600"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}
