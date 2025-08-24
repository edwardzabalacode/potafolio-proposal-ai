'use client'

import Image from 'next/image'
import { Project, projectStatuses } from '@/lib/types/project'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye, Star } from 'lucide-react'

interface ProjectsListProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onView: (project: Project) => void
  onDelete: (project: Project) => void
  onCreate?: () => void
}

export function ProjectsList({
  projects,
  onEdit,
  onView,
  onDelete,
  onCreate,
}: ProjectsListProps) {
  const getStatusConfig = (status: string) => {
    return projectStatuses.find(s => s.value === status)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-text-secondary">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary">
            <Eye className="h-6 w-6" />
          </div>
          <h3 className="text-primary mb-2 text-lg font-medium">
            No projects found
          </h3>
          <p className="mb-4">Get started by creating your first project.</p>
          <Button
            onClick={onCreate}
            className="bg-accent-green text-bg-primary hover:bg-green-600"
          >
            Create Project
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-lg border-2 border-accent-green">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed">
              <colgroup>
                <col className="w-[300px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[200px]" />
                <col className="w-[120px]" />
                <col className="w-[140px]" />
              </colgroup>
              <thead className="bg-bg-tertiary">
                <tr>
                  <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                    Project
                  </th>
                  <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                    Category
                  </th>
                  <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                    Technologies
                  </th>
                  <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                    Updated
                  </th>
                  <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-bg-secondary">
                {projects.map((project, index) => {
                  const statusConfig = getStatusConfig(project.status)
                  return (
                    <tr
                      key={project.id}
                      className={`border-accent-green/20 border-t ${
                        index % 2 === 0
                          ? 'bg-bg-secondary'
                          : 'bg-bg-tertiary/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative h-12 w-12 flex-shrink-0">
                            <Image
                              src={
                                project.image ||
                                'https://picsum.photos/400/400?random=1'
                              }
                              alt={project.title}
                              fill
                              className="border-accent-green/20 rounded-lg border object-cover"
                              onError={e => {
                                const target = e.target as HTMLImageElement
                                target.src =
                                  'https://picsum.photos/400/400?random=1'
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <h3
                                className="text-primary truncate font-medium"
                                title={project.title}
                              >
                                {project.title}
                              </h3>
                              {project.featured && (
                                <Star className="h-4 w-4 flex-shrink-0 fill-current text-yellow-400" />
                              )}
                            </div>
                            <p
                              className="truncate text-sm text-text-secondary"
                              title={project.company}
                            >
                              {project.company}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig?.color} border border-current border-opacity-20 bg-bg-tertiary`}
                        >
                          {statusConfig?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="block truncate text-sm capitalize text-text-secondary"
                          title={project.category}
                        >
                          {project.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="flex flex-wrap gap-1"
                          title={project.technologies.join(', ')}
                        >
                          {project.technologies.slice(0, 2).map(tech => (
                            <span
                              key={tech}
                              className="bg-accent-green/10 inline-flex max-w-[70px] items-center truncate rounded px-2 py-1 text-xs text-accent-green"
                              title={tech}
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 2 && (
                            <span className="flex-shrink-0 text-xs text-text-muted">
                              +{project.technologies.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">
                          {formatDate(project.updatedAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => onView(project)}
                            size="sm"
                            variant="outline"
                            className="border-accent-green/20 text-accent-green hover:bg-accent-green hover:text-bg-primary"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            onClick={() => onEdit(project)}
                            size="sm"
                            variant="outline"
                            className="border-blue-400/20 text-blue-400 hover:bg-blue-400 hover:text-bg-primary"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            onClick={() => onDelete(project)}
                            size="sm"
                            variant="outline"
                            className="border-red-400/20 text-red-400 hover:bg-red-400 hover:text-bg-primary"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet View */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {projects.map(project => {
          const statusConfig = getStatusConfig(project.status)
          return (
            <Card key={project.id} className="p-4">
              <div className="flex items-start space-x-4">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <Image
                    src={
                      project.image || 'https://picsum.photos/400/400?random=1'
                    }
                    alt={project.title}
                    fill
                    className="border-accent-green/20 rounded-lg border object-cover"
                    onError={e => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://picsum.photos/400/400?random=1'
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-primary truncate font-medium">
                        {project.title}
                      </h3>
                      {project.featured && (
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig?.color} border border-current border-opacity-20 bg-bg-tertiary`}
                    >
                      {statusConfig?.label}
                    </span>
                  </div>

                  <p className="mb-2 text-sm text-text-secondary">
                    {project.company} • {project.category}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-1">
                    {project.technologies.slice(0, 4).map(tech => (
                      <span
                        key={tech}
                        className="bg-accent-green/10 inline-flex items-center rounded px-2 py-1 text-xs text-accent-green"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="self-center text-xs text-text-muted">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Updated {formatDate(project.updatedAt)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => onView(project)}
                        size="sm"
                        variant="outline"
                        className="border-accent-green/20 text-accent-green hover:bg-accent-green hover:text-bg-primary"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        onClick={() => onEdit(project)}
                        size="sm"
                        variant="outline"
                        className="border-blue-400/20 text-blue-400 hover:bg-blue-400 hover:text-bg-primary"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        onClick={() => onDelete(project)}
                        size="sm"
                        variant="outline"
                        className="border-red-400/20 text-red-400 hover:bg-red-400 hover:text-bg-primary"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
