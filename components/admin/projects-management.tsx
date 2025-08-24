'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { projectsService } from '@/lib/services/projects-service'
import { Project, ProjectFilter, projectStatuses } from '@/lib/types/project'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectsList } from './projects-list'
import { ProjectForm } from './project-form'
import { ProjectFilters } from './project-filters'
import { Loader2, Plus, ArrowLeft, Edit, Trash2, Eye } from 'lucide-react'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

export function ProjectsManagement() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<ProjectFilter>({})

  useEffect(() => {
    if (user?.uid) {
      loadProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, filter])

  const loadProjects = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const fetchedProjects = await projectsService.getProjects(user.uid)
      setProjects(fetchedProjects)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...projects]

    if (filter.status) {
      filtered = filtered.filter(project => project.status === filter.status)
    }

    if (filter.category) {
      filtered = filtered.filter(
        project => project.category === filter.category
      )
    }

    if (filter.featured !== undefined) {
      filtered = filtered.filter(
        project => project.featured === filter.featured
      )
    }

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      filtered = filtered.filter(
        project =>
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.technologies.some(tech =>
            tech.toLowerCase().includes(searchTerm)
          )
      )
    }

    setFilteredProjects(filtered)
  }

  const handleCreateProject = () => {
    setSelectedProject(null)
    setViewMode('create')
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setViewMode('edit')
  }

  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setViewMode('view')
  }

  const handleDeleteProject = async (project: Project) => {
    if (!user?.uid || !project.id) return

    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar el proyecto "${project.title}"?`
      )
    ) {
      return
    }

    try {
      await projectsService.deleteProject(user.uid, project.id)
      await loadProjects()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting project:', error)
      alert('Error al eliminar el proyecto')
    }
  }

  const handleProjectSaved = () => {
    loadProjects()
    setViewMode('list')
  }

  const handleBackToList = () => {
    setSelectedProject(null)
    setViewMode('list')
  }

  const getStatusColor = (status: string) => {
    const statusConfig = projectStatuses.find(s => s.value === status)
    return statusConfig?.color || 'text-gray-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent-green" />
        <span className="ml-2 text-text-secondary">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            {viewMode !== 'list' && (
              <Button
                onClick={handleBackToList}
                variant="outline"
                className="border-accent-green text-accent-green hover:bg-accent-green hover:text-bg-primary"
              >
                <ArrowLeft size={16} />
                Back to List
              </Button>
            )}
            <div>
              <h1 className="text-primary text-2xl font-bold">
                {viewMode === 'list' && 'Projects Management'}
                {viewMode === 'create' && 'Create New Project'}
                {viewMode === 'edit' && `Edit: ${selectedProject?.title}`}
                {viewMode === 'view' && `View: ${selectedProject?.title}`}
              </h1>
              <p className="text-text-secondary">
                {viewMode === 'list' && 'Manage your portfolio projects'}
                {viewMode === 'create' && 'Add a new project to your portfolio'}
                {viewMode === 'edit' && 'Edit project information and settings'}
                {viewMode === 'view' && 'View project details and information'}
              </p>
            </div>
          </div>
        </div>

        {viewMode === 'list' && (
          <Button
            onClick={handleCreateProject}
            className="bg-accent-green text-bg-primary hover:bg-green-600"
          >
            <Plus size={16} />
            New Project
          </Button>
        )}
      </div>

      {/* Stats */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Projects</p>
                <p className="text-primary text-2xl font-bold">
                  {projects.length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-accent-green" />
            </div>
          </Card>

          {projectStatuses.map(status => (
            <Card key={status.value} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{status.label}</p>
                  <p className={`text-2xl font-bold ${status.color}`}>
                    {projects.filter(p => p.status === status.value).length}
                  </p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${status.color.replace('text-', 'bg-')}`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Content */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          <ProjectFilters filter={filter} onFilterChange={setFilter} />
          <ProjectsList
            projects={filteredProjects}
            onEdit={handleEditProject}
            onView={handleViewProject}
            onDelete={handleDeleteProject}
            onCreate={handleCreateProject}
          />
        </div>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <ProjectForm
          project={selectedProject}
          onSave={handleProjectSaved}
          onCancel={handleBackToList}
        />
      )}

      {viewMode === 'view' && selectedProject && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => handleEditProject(selectedProject)}
              variant="outline"
              className="border-accent-green text-accent-green hover:bg-accent-green hover:text-bg-primary"
            >
              <Edit size={16} />
              Edit Project
            </Button>
            <Button
              onClick={() => handleDeleteProject(selectedProject)}
              variant="outline"
              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-bg-primary"
            >
              <Trash2 size={16} />
              Delete Project
            </Button>
          </div>
          {/* Project detail view would go here */}
          <Card className="p-6">
            <h2 className="text-primary mb-4 text-xl font-bold">
              {selectedProject.title}
            </h2>
            <div className="space-y-4">
              <div>
                <strong className="text-accent-green">Company:</strong>{' '}
                {selectedProject.company}
              </div>
              <div>
                <strong className="text-accent-green">Status:</strong>{' '}
                <span className={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </span>
              </div>
              <div>
                <strong className="text-accent-green">Category:</strong>{' '}
                {selectedProject.category}
              </div>
              <div>
                <strong className="text-accent-green">Description:</strong>
                <p className="mt-1 text-text-secondary">
                  {selectedProject.description}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
