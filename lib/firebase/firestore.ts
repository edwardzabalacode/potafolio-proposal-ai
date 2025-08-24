import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from './config'

// TypeScript interfaces for the data structure
export interface PersonalInfo {
  name: string
  title: string
  description: string
  email: string
  phone?: string
  location?: string
  bio?: string
}

export interface ContactInfo {
  email: string
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
  upwork?: string
}

export interface HeroContent {
  mainHeading: string
  subHeading: string
  ctaText: string
  ctaLink?: string
  backgroundImage?: string
}

export interface Project {
  id: string
  title: string
  company?: string
  description: string
  longDescription?: string
  technologies: string[]
  images: string[]
  liveUrl?: string
  githubUrl?: string
  date: string
  category: string
  slug: string
  featured: boolean
  status: 'active' | 'completed' | 'archived'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  category: string
  tags: string[]
  featuredImage?: string
  published: boolean
  readTime: string
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
}

export interface ProposalTemplate {
  id: string
  name: string
  category: string
  content: string
  variables: string[]
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface GeneratedProposal {
  id: string
  jobTitle: string
  content: string
  templateId?: string
  clientInfo?: {
    name?: string
    company?: string
    budget?: string
  }
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface SiteConfig {
  siteName: string
  siteDescription: string
  siteUrl: string
  metaTags: {
    title: string
    description: string
    keywords: string[]
    ogImage?: string
  }
  socialMedia: ContactInfo
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
}

export interface UserStore {
  profile: {
    personalInfo: PersonalInfo
    contactInfo: ContactInfo
    heroContent: HeroContent
  }
  projects: { [projectId: string]: Project }
  blog: { [postId: string]: BlogPost }
  proposals: {
    templates: { [templateId: string]: ProposalTemplate }
    generated: { [proposalId: string]: GeneratedProposal }
  }
  settings: {
    siteConfig: SiteConfig
  }
}

// Database error interface
export interface FirestoreError {
  code: string
  message: string
}

// Firestore service class
export class FirestoreService {
  private userUID: string

  constructor(userUID: string) {
    this.userUID = userUID
  }

  // Helper method to get user store reference
  private getUserStoreRef() {
    return doc(db, 'stores', this.userUID)
  }

  // Helper method to get collection reference within user store
  private getCollectionRef(collectionName: string) {
    return collection(db, 'stores', this.userUID, collectionName)
  }

  // Profile operations
  async getPersonalInfo(): Promise<PersonalInfo | null> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'profile', 'personalInfo')
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as PersonalInfo) : null
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async updatePersonalInfo(data: Partial<PersonalInfo>): Promise<void> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'profile', 'personalInfo')
      await setDoc(
        docRef,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      )
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getContactInfo(): Promise<ContactInfo | null> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'profile', 'contactInfo')
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as ContactInfo) : null
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async updateContactInfo(data: Partial<ContactInfo>): Promise<void> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'profile', 'contactInfo')
      await setDoc(
        docRef,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      )
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getHeroContent(): Promise<HeroContent | null> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'profile', 'heroContent')
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as HeroContent) : null
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async updateHeroContent(data: Partial<HeroContent>): Promise<void> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'profile', 'heroContent')
      await setDoc(
        docRef,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      )
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Projects operations
  async getProjects(): Promise<Project[]> {
    try {
      const collectionRef = this.getCollectionRef('projects')
      const q = query(collectionRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Project
      )
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'projects', projectId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists()
        ? ({ id: docSnap.id, ...docSnap.data() } as Project)
        : null
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async createProject(
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const collectionRef = this.getCollectionRef('projects')
      const projectData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(collectionRef, projectData)
      return docRef.id
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async updateProject(
    projectId: string,
    data: Partial<Project>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'projects', projectId)
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'projects', projectId)
      await deleteDoc(docRef)
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Blog operations
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      const collectionRef = this.getCollectionRef('blog')
      const q = query(collectionRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as BlogPost
      )
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getBlogPost(postId: string): Promise<BlogPost | null> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'blog', postId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists()
        ? ({ id: docSnap.id, ...docSnap.data() } as BlogPost)
        : null
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async createBlogPost(
    data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const collectionRef = this.getCollectionRef('blog')
      const postData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: data.published ? serverTimestamp() : null,
      }
      const docRef = await addDoc(collectionRef, postData)
      return docRef.id
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async updateBlogPost(postId: string, data: Partial<BlogPost>): Promise<void> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'blog', postId)
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      }

      // Set publishedAt if post is being published for the first time
      if (data.published) {
        const existingDoc = await getDoc(docRef)
        if (existingDoc.exists() && !existingDoc.data().published) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(updateData as any).publishedAt = serverTimestamp()
        }
      }

      await updateDoc(docRef, updateData)
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async deleteBlogPost(postId: string): Promise<void> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'blog', postId)
      await deleteDoc(docRef)
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Site settings operations
  async getSiteConfig(): Promise<SiteConfig | null> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'settings', 'siteConfig')
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? (docSnap.data() as SiteConfig) : null
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
    try {
      const docRef = doc(db, 'stores', this.userUID, 'settings', 'siteConfig')
      await setDoc(
        docRef,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      )
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Proposals operations
  async getProposalTemplates(): Promise<ProposalTemplate[]> {
    try {
      const collectionRef = collection(
        db,
        'stores',
        this.userUID,
        'proposals',
        'templates'
      )
      const q = query(collectionRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as ProposalTemplate
      )
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async createProposalTemplate(
    data: Omit<ProposalTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const collectionRef = collection(
        db,
        'stores',
        this.userUID,
        'proposals',
        'templates'
      )
      const templateData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(collectionRef, templateData)
      return docRef.id
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  // Real-time subscriptions
  subscribeToProjects(callback: (projects: Project[]) => void): Unsubscribe {
    const collectionRef = this.getCollectionRef('projects')
    const q = query(collectionRef, orderBy('createdAt', 'desc'))

    return onSnapshot(q, snapshot => {
      const projects = snapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Project
      )
      callback(projects)
    })
  }

  subscribeToUserStore(
    callback: (store: Partial<UserStore>) => void
  ): Unsubscribe {
    const docRef = this.getUserStoreRef()

    return onSnapshot(docRef, doc => {
      if (doc.exists()) {
        callback(doc.data() as Partial<UserStore>)
      }
    })
  }

  // Error handling
  private handleError(error: unknown): FirestoreError {
    const firestoreError = error as { code?: string; message?: string }
    return {
      code: firestoreError.code || 'firestore/unknown-error',
      message: firestoreError.message || 'An unknown Firestore error occurred',
    }
  }
}

// Factory function to create Firestore service instance
export const createFirestoreService = (userUID: string): FirestoreService => {
  return new FirestoreService(userUID)
}

// Helper function to get user-friendly error messages
export const getFirestoreErrorMessage = (error: FirestoreError): string => {
  switch (error.code) {
    case 'permission-denied':
      return 'You do not have permission to access this data.'
    case 'not-found':
      return 'The requested document was not found.'
    case 'already-exists':
      return 'The document already exists.'
    case 'cancelled':
      return 'The operation was cancelled.'
    case 'invalid-argument':
      return 'Invalid data provided for the operation.'
    case 'deadline-exceeded':
      return 'The operation took too long to complete.'
    case 'unavailable':
      return 'The service is currently unavailable. Please try again later.'
    default:
      return error.message || 'An unexpected database error occurred.'
  }
}

// Export Firestore instance for direct use if needed
export { db }
