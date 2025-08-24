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
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Project, ProjectFormData, ProjectFilter } from '@/lib/types/project'

export class ProjectsService {
  private getUserProjectsCollection(userUID: string) {
    return collection(db, 'stores', userUID, 'projects')
  }

  private getUserProjectRef(
    userUID: string,
    projectId: string
  ): DocumentReference {
    return doc(db, 'stores', userUID, 'projects', projectId)
  }

  async getProjects(
    userUID: string,
    filter?: ProjectFilter
  ): Promise<Project[]> {
    try {
      const projectsCollection = this.getUserProjectsCollection(userUID)
      let projectsQuery: Query = query(
        projectsCollection,
        orderBy('order', 'asc')
      )

      // Apply filters
      if (filter?.status) {
        projectsQuery = query(
          projectsQuery,
          where('status', '==', filter.status)
        )
      }

      if (filter?.category) {
        projectsQuery = query(
          projectsQuery,
          where('category', '==', filter.category)
        )
      }

      if (filter?.featured !== undefined) {
        projectsQuery = query(
          projectsQuery,
          where('featured', '==', filter.featured)
        )
      }

      const snapshot = await getDocs(projectsQuery)
      let projects = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          // Ensure backward compatibility for images
          images: data.images || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        }
      }) as Project[]

      // Apply search filter (client-side for now)
      if (filter?.search) {
        const searchTerm = filter.search.toLowerCase()
        projects = projects.filter(
          project =>
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.technologies.some(tech =>
              tech.toLowerCase().includes(searchTerm)
            )
        )
      }

      return projects
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching projects:', error)
      throw new Error('Failed to fetch projects')
    }
  }

  async getProject(
    userUID: string,
    projectId: string
  ): Promise<Project | null> {
    try {
      const projectRef = this.getUserProjectRef(userUID, projectId)
      const projectSnap = await getDoc(projectRef)

      if (projectSnap.exists()) {
        const data = projectSnap.data()
        return {
          id: projectSnap.id,
          ...data,
          // Ensure backward compatibility for images
          images: data.images || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Project
      }

      return null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching project:', error)
      throw new Error('Failed to fetch project')
    }
  }

  async createProject(
    userUID: string,
    projectData: ProjectFormData
  ): Promise<string> {
    try {
      const projectsCollection = this.getUserProjectsCollection(userUID)
      const newProjectRef = doc(projectsCollection)

      // Get the highest order number and increment
      const existingProjects = await this.getProjects(userUID)
      const maxOrder = Math.max(...existingProjects.map(p => p.order || 0), 0)

      const projectToSave = {
        ...projectData,
        order: maxOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(newProjectRef, projectToSave)
      return newProjectRef.id
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating project:', error)
      throw new Error('Failed to create project')
    }
  }

  async updateProject(
    userUID: string,
    projectId: string,
    projectData: Partial<ProjectFormData>
  ): Promise<void> {
    try {
      const projectRef = this.getUserProjectRef(userUID, projectId)

      await updateDoc(projectRef, {
        ...projectData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating project:', error)
      throw new Error('Failed to update project')
    }
  }

  async deleteProject(userUID: string, projectId: string): Promise<void> {
    try {
      const projectRef = this.getUserProjectRef(userUID, projectId)
      await deleteDoc(projectRef)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting project:', error)
      throw new Error('Failed to delete project')
    }
  }

  async reorderProjects(userUID: string, projectIds: string[]): Promise<void> {
    try {
      const batch = []

      for (let i = 0; i < projectIds.length; i++) {
        const projectRef = this.getUserProjectRef(userUID, projectIds[i])
        batch.push(
          updateDoc(projectRef, {
            order: i + 1,
            updatedAt: serverTimestamp(),
          })
        )
      }

      await Promise.all(batch)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error reordering projects:', error)
      throw new Error('Failed to reorder projects')
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
      const projects = await this.getProjects(userUID)
      return projects.some(
        project => project.slug === slug && project.id !== excludeId
      )
    } catch (error) {
      return false
    }
  }
}

export const projectsService = new ProjectsService()
