import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type {
  SavedProposal,
  ProposalFilter,
  ProposalStats,
  ProposalHistory,
} from '@/lib/types/proposal'

export class ProposalsService {
  private getProposalsCollection(userUID: string) {
    return collection(db, 'stores', userUID, 'proposals')
  }

  private getHistoryCollection(userUID: string) {
    return collection(db, 'stores', userUID, 'proposal_history')
  }

  // Convert Firestore data to SavedProposal
  private convertToProposal(
    doc: QueryDocumentSnapshot<DocumentData>
  ): SavedProposal {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      sentAt: data.sentAt?.toDate(),
      responseDate: data.responseDate?.toDate(),
      hireDate: data.hireDate?.toDate(),
    } as SavedProposal
  }

  // Convert SavedProposal to Firestore data
  private convertToFirestore(proposal: Partial<SavedProposal>) {
    const { id: _id, ...data } = proposal
    return {
      ...data,
      createdAt: data.createdAt
        ? Timestamp.fromDate(data.createdAt)
        : Timestamp.now(),
      updatedAt: Timestamp.now(),
      sentAt: data.sentAt ? Timestamp.fromDate(data.sentAt) : null,
      responseDate: data.responseDate
        ? Timestamp.fromDate(data.responseDate)
        : null,
      hireDate: data.hireDate ? Timestamp.fromDate(data.hireDate) : null,
    }
  }

  // Create a new proposal
  async createProposal(
    userUID: string,
    proposalData: Omit<
      SavedProposal,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >
  ): Promise<SavedProposal> {
    const collectionRef = this.getProposalsCollection(userUID)

    const newProposal = {
      ...proposalData,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const firestoreData = this.convertToFirestore(newProposal)
    const docRef = await addDoc(collectionRef, firestoreData)

    // Create history entry
    await this.addHistoryEntry(userUID, docRef.id, {
      action: 'created',
      description: 'Proposal created',
      newValues: { ...newProposal },
      version: 1,
    })

    return {
      ...newProposal,
      id: docRef.id,
    }
  }

  // Get all proposals with optional filtering
  async getProposals(
    userUID: string,
    filter?: ProposalFilter
  ): Promise<SavedProposal[]> {
    const collectionRef = this.getProposalsCollection(userUID)
    let q = query(collectionRef, orderBy('updatedAt', 'desc'))

    // Apply filters
    if (filter?.status && filter.status.length > 0) {
      q = query(q, where('status', 'in', filter.status))
    }

    if (filter?.projectType && filter.projectType.length > 0) {
      q = query(q, where('projectType', 'in', filter.projectType))
    }

    if (filter?.responseReceived !== undefined) {
      q = query(q, where('responseReceived', '==', filter.responseReceived))
    }

    if (filter?.hired !== undefined) {
      q = query(q, where('hired', '==', filter.hired))
    }

    const snapshot = await getDocs(q)
    let proposals = snapshot.docs.map(doc => this.convertToProposal(doc))

    // Apply client-side filters for complex queries
    if (filter?.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase()
      proposals = proposals.filter(
        proposal =>
          proposal.title.toLowerCase().includes(searchTerm) ||
          proposal.jobTitle.toLowerCase().includes(searchTerm) ||
          proposal.clientName?.toLowerCase().includes(searchTerm) ||
          proposal.clientCompany?.toLowerCase().includes(searchTerm)
      )
    }

    if (filter?.category) {
      proposals = proposals.filter(
        proposal => proposal.category === filter.category
      )
    }

    if (filter?.tags && filter.tags.length > 0) {
      proposals = proposals.filter(proposal =>
        filter.tags!.some(tag => proposal.tags.includes(tag))
      )
    }

    if (filter?.dateRange) {
      proposals = proposals.filter(proposal => {
        const proposalDate = proposal.createdAt
        return (
          proposalDate >= filter.dateRange!.from &&
          proposalDate <= filter.dateRange!.to
        )
      })
    }

    return proposals
  }

  // Get a single proposal by ID
  async getProposal(
    userUID: string,
    proposalId: string
  ): Promise<SavedProposal | null> {
    const docRef = doc(this.getProposalsCollection(userUID), proposalId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return this.convertToProposal(docSnap)
    }

    return null
  }

  // Update an existing proposal
  async updateProposal(
    userUID: string,
    proposalId: string,
    updates: Partial<SavedProposal>
  ): Promise<SavedProposal> {
    const docRef = doc(this.getProposalsCollection(userUID), proposalId)

    // Get current proposal for history
    const currentProposal = await this.getProposal(userUID, proposalId)
    if (!currentProposal) {
      throw new Error('Proposal not found')
    }

    const updatedData = {
      ...updates,
      version: currentProposal.version + 1,
      updatedAt: new Date(),
    }

    const firestoreData = this.convertToFirestore(updatedData)
    await updateDoc(docRef, firestoreData)

    // Create history entry
    await this.addHistoryEntry(userUID, proposalId, {
      action: 'edited',
      description: 'Proposal updated',
      oldValues: { ...currentProposal },
      newValues: { ...updatedData },
      version: updatedData.version,
    })

    return {
      ...currentProposal,
      ...updatedData,
    }
  }

  // Delete a proposal
  async deleteProposal(userUID: string, proposalId: string): Promise<void> {
    const docRef = doc(this.getProposalsCollection(userUID), proposalId)

    // Get current proposal for history
    const currentProposal = await this.getProposal(userUID, proposalId)
    if (currentProposal) {
      await this.addHistoryEntry(userUID, proposalId, {
        action: 'archived',
        description: 'Proposal deleted',
        oldValues: { ...currentProposal },
        version: currentProposal.version,
      })
    }

    await deleteDoc(docRef)
  }

  // Duplicate a proposal
  async duplicateProposal(
    userUID: string,
    proposalId: string,
    updates?: Partial<SavedProposal>
  ): Promise<SavedProposal> {
    const originalProposal = await this.getProposal(userUID, proposalId)
    if (!originalProposal) {
      throw new Error('Original proposal not found')
    }

    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      version: _version,
      ...proposalData
    } = originalProposal

    const duplicatedProposal = {
      ...proposalData,
      ...updates,
      title: updates?.title || `${originalProposal.title} (Copy)`,
      status: 'draft' as const,
      originalId: proposalId,
      sentAt: undefined,
      responseReceived: false,
      responseDate: undefined,
      hired: false,
      hireDate: undefined,
    }

    return this.createProposal(userUID, duplicatedProposal)
  }

  // Mark proposal as sent
  async markAsSent(
    userUID: string,
    proposalId: string
  ): Promise<SavedProposal> {
    return this.updateProposal(userUID, proposalId, {
      status: 'sent',
      sentAt: new Date(),
    })
  }

  // Update proposal status and tracking
  async updateProposalStatus(
    userUID: string,
    proposalId: string,
    status: SavedProposal['status'],
    additionalData?: {
      responseDate?: Date
      hired?: boolean
      hireDate?: Date
      projectValue?: string
      notes?: string
    }
  ): Promise<SavedProposal> {
    const updates: Partial<SavedProposal> = {
      status,
      ...additionalData,
    }

    if (status === 'accepted' || status === 'rejected') {
      updates.responseReceived = true
      updates.responseDate = additionalData?.responseDate || new Date()
    }

    return this.updateProposal(userUID, proposalId, updates)
  }

  // Get proposal statistics
  async getProposalStats(userUID: string): Promise<ProposalStats> {
    const proposals = await this.getProposals(userUID)

    const stats: ProposalStats = {
      total: proposals.length,
      byStatus: {},
      byProjectType: {},
      responseRate: 0,
      hireRate: 0,
      averageProjectValue: 0,
      totalValue: 0,
      recentActivity: {
        sent: 0,
        responses: 0,
        hired: 0,
      },
    }

    if (proposals.length === 0) return stats

    // Calculate statistics
    let sentCount = 0
    let responseCount = 0
    let hiredCount = 0
    let totalValue = 0
    let valueCount = 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    proposals.forEach(proposal => {
      // Status distribution
      stats.byStatus[proposal.status] =
        (stats.byStatus[proposal.status] || 0) + 1

      // Project type distribution
      stats.byProjectType[proposal.projectType] =
        (stats.byProjectType[proposal.projectType] || 0) + 1

      // Counting for rates
      if (proposal.status !== 'draft') sentCount++
      if (proposal.responseReceived) responseCount++
      if (proposal.hired) hiredCount++

      // Project value calculation
      if (proposal.projectValue) {
        const value = parseFloat(proposal.projectValue.replace(/[^0-9.]/g, ''))
        if (!isNaN(value)) {
          totalValue += value
          valueCount++
        }
      }

      // Recent activity (last 30 days)
      if (proposal.sentAt && proposal.sentAt >= thirtyDaysAgo) {
        stats.recentActivity.sent++
      }
      if (proposal.responseDate && proposal.responseDate >= thirtyDaysAgo) {
        stats.recentActivity.responses++
      }
      if (proposal.hireDate && proposal.hireDate >= thirtyDaysAgo) {
        stats.recentActivity.hired++
      }
    })

    stats.responseRate = sentCount > 0 ? (responseCount / sentCount) * 100 : 0
    stats.hireRate = sentCount > 0 ? (hiredCount / sentCount) * 100 : 0
    stats.averageProjectValue = valueCount > 0 ? totalValue / valueCount : 0
    stats.totalValue = totalValue

    return stats
  }

  // Get proposal history
  async getProposalHistory(
    userUID: string,
    proposalId: string
  ): Promise<ProposalHistory[]> {
    const collectionRef = this.getHistoryCollection(userUID)
    const q = query(
      collectionRef,
      where('proposalId', '==', proposalId),
      orderBy('timestamp', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as ProposalHistory[]
  }

  // Add history entry
  private async addHistoryEntry(
    userUID: string,
    proposalId: string,
    historyData: Omit<ProposalHistory, 'id' | 'proposalId' | 'timestamp'>
  ): Promise<void> {
    const collectionRef = this.getHistoryCollection(userUID)

    await addDoc(collectionRef, {
      proposalId,
      ...historyData,
      timestamp: Timestamp.now(),
    })
  }

  // Get unique tags from all proposals
  async getAllTags(userUID: string): Promise<string[]> {
    const proposals = await this.getProposals(userUID)
    const tagsSet = new Set<string>()

    proposals.forEach(proposal => {
      proposal.tags.forEach(tag => tagsSet.add(tag))
    })

    return Array.from(tagsSet).sort()
  }

  // Get unique categories from all proposals
  async getAllCategories(userUID: string): Promise<string[]> {
    const proposals = await this.getProposals(userUID)
    const categoriesSet = new Set<string>()

    proposals.forEach(proposal => {
      if (proposal.category) {
        categoriesSet.add(proposal.category)
      }
    })

    return Array.from(categoriesSet).sort()
  }

  // Export proposals data
  async exportProposals(
    userUID: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const proposals = await this.getProposals(userUID)

    if (format === 'json') {
      return JSON.stringify(proposals, null, 2)
    }

    // CSV export
    if (proposals.length === 0) return ''

    const headers = [
      'Title',
      'Job Title',
      'Client Name',
      'Company',
      'Project Type',
      'Status',
      'Budget',
      'Timeline',
      'Response Received',
      'Hired',
      'Project Value',
      'Created At',
      'Sent At',
      'Response Date',
      'Hire Date',
    ]

    const csvRows = [
      headers.join(','),
      ...proposals.map(proposal =>
        [
          `"${proposal.title}"`,
          `"${proposal.jobTitle}"`,
          `"${proposal.clientName || ''}"`,
          `"${proposal.clientCompany || ''}"`,
          proposal.projectType,
          proposal.status,
          `"${proposal.estimatedBudget || ''}"`,
          `"${proposal.estimatedTimeline || ''}"`,
          proposal.responseReceived ? 'Yes' : 'No',
          proposal.hired ? 'Yes' : 'No',
          `"${proposal.projectValue || ''}"`,
          proposal.createdAt.toISOString().split('T')[0],
          proposal.sentAt ? proposal.sentAt.toISOString().split('T')[0] : '',
          proposal.responseDate
            ? proposal.responseDate.toISOString().split('T')[0]
            : '',
          proposal.hireDate
            ? proposal.hireDate.toISOString().split('T')[0]
            : '',
        ].join(',')
      ),
    ]

    return csvRows.join('\n')
  }
}

export const proposalsService = new ProposalsService()
