'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { blogService } from '@/lib/services/blog-service'
import { BlogPost, BlogFilter, blogStatuses } from '@/lib/types/blog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BlogList } from './blog-list'
import { BlogForm } from './blog-form'
import { BlogFilters } from './blog-filters'
import { Loader2, Plus, ArrowLeft, Edit, Trash2, FileText } from 'lucide-react'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

export function BlogManagement() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [filter, setFilter] = useState<BlogFilter>({})

  useEffect(() => {
    if (user?.uid) {
      loadPosts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, filter])

  const loadPosts = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const fetchedPosts = await blogService.getPosts(user.uid)
      setPosts(fetchedPosts)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...posts]

    if (filter.status) {
      filtered = filtered.filter(post => post.status === filter.status)
    }

    if (filter.category) {
      filtered = filtered.filter(post => post.category === filter.category)
    }

    if (filter.featured !== undefined) {
      filtered = filtered.filter(post => post.featured === filter.featured)
    }

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    setFilteredPosts(filtered)
  }

  const handleCreatePost = () => {
    setSelectedPost(null)
    setViewMode('create')
  }

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post)
    setViewMode('edit')
  }

  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post)
    setViewMode('view')
  }

  const handleDeletePost = async (post: BlogPost) => {
    if (!user?.uid || !post.id) return

    if (
      !confirm(`¿Estás seguro de que quieres eliminar el post "${post.title}"?`)
    ) {
      return
    }

    try {
      await blogService.deletePost(user.uid, post.id)
      await loadPosts()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting blog post:', error)
      alert('Error al eliminar el post')
    }
  }

  const handlePostSaved = () => {
    loadPosts()
    setViewMode('list')
  }

  const handleBackToList = () => {
    setSelectedPost(null)
    setViewMode('list')
  }

  const getStatusColor = (status: string) => {
    const statusConfig = blogStatuses.find(s => s.value === status)
    return statusConfig?.color || 'text-gray-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent-green" />
        <span className="ml-2 text-text-secondary">Loading blog posts...</span>
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
                {viewMode === 'list' && 'Blog Management'}
                {viewMode === 'create' && 'Create New Post'}
                {viewMode === 'edit' && `Edit: ${selectedPost?.title}`}
                {viewMode === 'view' && `View: ${selectedPost?.title}`}
              </h1>
              <p className="text-text-secondary">
                {viewMode === 'list' && 'Manage your blog posts and articles'}
                {viewMode === 'create' && 'Create a new blog post'}
                {viewMode === 'edit' && 'Edit blog post content and settings'}
                {viewMode === 'view' &&
                  'View blog post details and information'}
              </p>
            </div>
          </div>
        </div>

        {viewMode === 'list' && (
          <Button
            onClick={handleCreatePost}
            className="bg-accent-green text-bg-primary hover:bg-green-600"
          >
            <Plus size={16} />
            New Post
          </Button>
        )}
      </div>

      {/* Stats */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Posts</p>
                <p className="text-primary text-2xl font-bold">
                  {posts.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-accent-green" />
            </div>
          </Card>

          {blogStatuses.map(status => (
            <Card key={status.value} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{status.label}</p>
                  <p className={`text-2xl font-bold ${status.color}`}>
                    {posts.filter(p => p.status === status.value).length}
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
          <BlogFilters filter={filter} onFilterChange={setFilter} />
          <BlogList
            posts={filteredPosts}
            onEdit={handleEditPost}
            onView={handleViewPost}
            onDelete={handleDeletePost}
            onCreate={handleCreatePost}
          />
        </div>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <BlogForm
          post={selectedPost}
          onSave={handlePostSaved}
          onCancel={handleBackToList}
        />
      )}

      {viewMode === 'view' && selectedPost && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => handleEditPost(selectedPost)}
              variant="outline"
              className="border-accent-green text-accent-green hover:bg-accent-green hover:text-bg-primary"
            >
              <Edit size={16} />
              Edit Post
            </Button>
            <Button
              onClick={() => handleDeletePost(selectedPost)}
              variant="outline"
              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-bg-primary"
            >
              <Trash2 size={16} />
              Delete Post
            </Button>
          </div>
          <Card className="p-6">
            <div className="mb-4 flex items-center space-x-4">
              <h2 className="text-primary text-xl font-bold">
                {selectedPost.title}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-sm ${getStatusColor(selectedPost.status)} bg-current bg-opacity-10`}
              >
                {selectedPost.status}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <strong className="text-accent-green">Category:</strong>{' '}
                {selectedPost.category}
              </div>
              <div>
                <strong className="text-accent-green">Read Time:</strong>{' '}
                {selectedPost.readTime}
              </div>
              <div>
                <strong className="text-accent-green">Excerpt:</strong>
                <p className="mt-1 text-text-secondary">
                  {selectedPost.excerpt}
                </p>
              </div>
              <div>
                <strong className="text-accent-green">Tags:</strong>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedPost.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-accent-green/10 rounded px-2 py-1 text-xs text-accent-green"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
