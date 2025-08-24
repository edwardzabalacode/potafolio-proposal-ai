export interface ProposalRequest {
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
}

export interface ProposalResponse {
  id: string
  content: string
  title: string
  estimatedBudget?: string
  estimatedTimeline?: string
  keyPoints: string[]
  createdAt: Date
  metadata: {
    model: string
    tokensUsed: number
    processingTime: number
  }
}

export interface ProposalTemplate {
  id: string
  name: string
  projectType: string
  systemPrompt: string
  userPromptTemplate: string
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

export interface OpenAIConfig {
  model: string
  maxTokens: number
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

export interface RateLimitConfig {
  maxRequestsPerMinute: number
  maxTokensPerMinute: number
  enabled: boolean
}

export interface CacheConfig {
  enabled: boolean
  ttlMinutes: number
  maxEntries: number
}
