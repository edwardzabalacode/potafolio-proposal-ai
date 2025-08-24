import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  type DocumentReference,
  type Query,
  type UpdateData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
  BlogPost,
  BlogFormData,
  BlogFilter,
  calculateReadTime,
} from '@/lib/types/blog'

export class BlogService {
  private getUserBlogCollection(userUID: string) {
    return collection(db, 'stores', userUID, 'blog')
  }

  private getUserBlogRef(userUID: string, postId: string): DocumentReference {
    return doc(db, 'stores', userUID, 'blog', postId)
  }

  async getPosts(userUID: string, filter?: BlogFilter): Promise<BlogPost[]> {
    try {
      const blogCollection = this.getUserBlogCollection(userUID)
      let blogQuery: Query = query(blogCollection, orderBy('order', 'desc'))

      // Apply filters
      if (filter?.status) {
        blogQuery = query(blogQuery, where('status', '==', filter.status))
      }

      if (filter?.category) {
        blogQuery = query(blogQuery, where('category', '==', filter.category))
      }

      if (filter?.featured !== undefined) {
        blogQuery = query(blogQuery, where('featured', '==', filter.featured))
      }

      const snapshot = await getDocs(blogQuery)
      let posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        publishedAt: doc.data().publishedAt?.toDate(),
      })) as BlogPost[]

      // Apply search filter (client-side for now)
      if (filter?.search) {
        const searchTerm = filter.search.toLowerCase()
        posts = posts.filter(
          post =>
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }

      return posts
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching blog posts:', error)
      throw new Error('Failed to fetch blog posts')
    }
  }

  async getPost(userUID: string, postId: string): Promise<BlogPost | null> {
    try {
      const postRef = this.getUserBlogRef(userUID, postId)
      const postSnap = await getDoc(postRef)

      if (postSnap.exists()) {
        const data = postSnap.data()
        return {
          id: postSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          publishedAt: data.publishedAt?.toDate(),
        } as BlogPost
      }

      return null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching blog post:', error)
      throw new Error('Failed to fetch blog post')
    }
  }

  async createPost(userUID: string, postData: BlogFormData): Promise<string> {
    try {
      const blogCollection = this.getUserBlogCollection(userUID)
      const newPostRef = doc(blogCollection)

      // Get the highest order number and increment
      const existingPosts = await this.getPosts(userUID)
      const maxOrder = Math.max(...existingPosts.map(p => p.order || 0), 0)

      // Calculate read time
      const readTime = calculateReadTime(postData.content)

      const postToSave = {
        ...postData,
        readTime,
        order: maxOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: postData.status === 'published' ? serverTimestamp() : null,
      }

      await setDoc(newPostRef, postToSave)
      return newPostRef.id
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating blog post:', error)
      throw new Error('Failed to create blog post')
    }
  }

  async updatePost(
    userUID: string,
    postId: string,
    postData: Partial<BlogFormData>
  ): Promise<void> {
    try {
      const postRef = this.getUserBlogRef(userUID, postId)

      // If content changed, recalculate read time
      const updateData: UpdateData<BlogPost> = {
        ...postData,
        updatedAt: serverTimestamp(),
      }

      if (postData.content) {
        updateData.readTime = calculateReadTime(postData.content)
      }

      // Handle publish status change
      if (postData.status === 'published') {
        const currentPost = await this.getPost(userUID, postId)
        if (currentPost && currentPost.status !== 'published') {
          updateData.publishedAt = serverTimestamp()
        }
      }

      await updateDoc(postRef, updateData)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating blog post:', error)
      throw new Error('Failed to update blog post')
    }
  }

  async deletePost(userUID: string, postId: string): Promise<void> {
    try {
      const postRef = this.getUserBlogRef(userUID, postId)
      await deleteDoc(postRef)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting blog post:', error)
      throw new Error('Failed to delete blog post')
    }
  }

  async reorderPosts(userUID: string, postIds: string[]): Promise<void> {
    try {
      const batch = []

      for (let i = 0; i < postIds.length; i++) {
        const postRef = this.getUserBlogRef(userUID, postIds[i])
        batch.push(
          updateDoc(postRef, {
            order: postIds.length - i, // Reverse order for newest first
            updatedAt: serverTimestamp(),
          })
        )
      }

      await Promise.all(batch)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error reordering blog posts:', error)
      throw new Error('Failed to reorder blog posts')
    }
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  async checkSlugExists(
    userUID: string,
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const posts = await this.getPosts(userUID)
      return posts.some(post => post.slug === slug && post.id !== excludeId)
    } catch (error) {
      return false
    }
  }

  async getPublishedPosts(userUID: string): Promise<BlogPost[]> {
    return this.getPosts(userUID, { status: 'published' })
  }

  async getFeaturedPosts(userUID: string, limit?: number): Promise<BlogPost[]> {
    const posts = await this.getPosts(userUID, {
      status: 'published',
      featured: true,
    })

    return limit ? posts.slice(0, limit) : posts
  }
}

export const blogService = new BlogService()
