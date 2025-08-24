'use client'

import { BlogPost, blogStatuses } from '@/lib/types/blog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react'

interface BlogListProps {
  posts: BlogPost[]
  onEdit: (post: BlogPost) => void
  onView: (post: BlogPost) => void
  onDelete: (post: BlogPost) => void
  onCreate?: () => void
}

export function BlogList({
  posts,
  onEdit,
  onView,
  onDelete,
  onCreate,
}: BlogListProps) {
  const getStatusConfig = (status: string) => {
    return blogStatuses.find(s => s.value === status)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  if (posts.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-text-secondary">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-primary mb-2 text-lg font-medium">
            No blog posts found
          </h3>
          <p className="mb-4">Get started by creating your first blog post.</p>
          <Button
            onClick={onCreate}
            className="bg-accent-green text-bg-primary hover:bg-green-600"
          >
            Create Post
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
          <table className="w-full">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                  Post
                </th>
                <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                  Status
                </th>
                <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                  Category
                </th>
                <th className="text-primary px-6 py-4 text-left text-sm font-medium">
                  Read Time
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
              {posts.map((post, index) => {
                const statusConfig = getStatusConfig(post.status)
                return (
                  <tr
                    key={post.id}
                    className={`border-accent-green/20 border-t ${
                      index % 2 === 0 ? 'bg-bg-secondary' : 'bg-bg-tertiary/50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-primary truncate font-medium">
                              {post.title}
                            </h3>
                            {post.featured && (
                              <Star className="h-4 w-4 fill-current text-yellow-400" />
                            )}
                          </div>
                          <p className="line-clamp-2 text-sm text-text-secondary">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig?.color} bg-current bg-opacity-10`}
                      >
                        {statusConfig?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-sm text-text-secondary">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {formatDate(post.updatedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => onView(post)}
                          size="sm"
                          variant="outline"
                          className="border-accent-green/20 text-accent-green hover:bg-accent-green hover:text-bg-primary"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          onClick={() => onEdit(post)}
                          size="sm"
                          variant="outline"
                          className="border-blue-400/20 text-blue-400 hover:bg-blue-400 hover:text-bg-primary"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          onClick={() => onDelete(post)}
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

      {/* Mobile/Tablet View */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {posts.map(post => {
          const statusConfig = getStatusConfig(post.status)
          return (
            <Card key={post.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center space-x-2">
                      <h3 className="text-primary line-clamp-2 font-medium">
                        {post.title}
                      </h3>
                      {post.featured && (
                        <Star className="h-4 w-4 flex-shrink-0 fill-current text-yellow-400" />
                      )}
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm text-text-secondary">
                      {post.excerpt}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig?.color} ml-2 flex-shrink-0 bg-current bg-opacity-10`}
                  >
                    {statusConfig?.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <div className="flex items-center space-x-4">
                    <span>{post.category}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onView(post)}
                    size="sm"
                    variant="outline"
                    className="border-accent-green/20 flex-1 text-accent-green hover:bg-accent-green hover:text-bg-primary"
                  >
                    <Eye size={14} />
                    View
                  </Button>
                  <Button
                    onClick={() => onEdit(post)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-blue-400/20 text-blue-400 hover:bg-blue-400 hover:text-bg-primary"
                  >
                    <Edit size={14} />
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDelete(post)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-400/20 text-red-400 hover:bg-red-400 hover:text-bg-primary"
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
