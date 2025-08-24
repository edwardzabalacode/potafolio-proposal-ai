export interface SavedProposal {
  id?: string
  title: string
  content: string
  jobTitle: string
  jobDescription: string
  clientBudget?: string
  projectType:
    | 'web-development'
    | 'mobile-app'
    | 'design'
    | 'consulting'
    | 'other'
  requirements?: string[]
  timeline?: string
  additionalContext?: string

  // Generated content details
  estimatedBudget?: string
  estimatedTimeline?: string

  // Management fields
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'archived'
  category?: string
  tags: string[]
  clientName?: string
  clientCompany?: string

  // Success tracking
  responseReceived?: boolean
  responseDate?: Date
  hired?: boolean
  hireDate?: Date
  projectValue?: string
  notes?: string

  // Version history
  version: number
  originalId?: string // Reference to original proposal if this is a copy/edit

  // Metadata
  templateId: string
  generationMetadata: {
    model: string
    tokensUsed: number
    processingTime: number
  }

  createdAt: Date
  updatedAt: Date
  sentAt?: Date
}

export interface ProposalFilter {
  status?: string[]
  projectType?: string[]
  category?: string
  clientName?: string
  dateRange?: {
    from: Date
    to: Date
  }
  searchTerm?: string
  tags?: string[]
  responseReceived?: boolean
  hired?: boolean
}

export interface ProposalStats {
  total: number
  byStatus: Record<string, number>
  byProjectType: Record<string, number>
  responseRate: number
  hireRate: number
  averageProjectValue: number
  totalValue: number
  recentActivity: {
    sent: number
    responses: number
    hired: number
  }
}

export interface ProposalHistory {
  id: string
  proposalId: string
  action:
    | 'created'
    | 'edited'
    | 'sent'
    | 'response_received'
    | 'hired'
    | 'rejected'
    | 'archived'
  description: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  timestamp: Date
  version: number
}
