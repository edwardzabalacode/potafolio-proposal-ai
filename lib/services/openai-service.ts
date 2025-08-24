import OpenAI from 'openai'
import type {
  ProposalRequest,
  ProposalResponse,
  ProposalTemplate,
  OpenAIConfig,
  RateLimitConfig,
  CacheConfig,
} from '@/lib/types/openai'

// Default configuration
const DEFAULT_CONFIG: OpenAIConfig = {
  model: 'gpt-4o-mini',
  maxTokens: 2048,
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequestsPerMinute: 10,
  maxTokensPerMinute: 50000,
  enabled: true,
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttlMinutes: 60,
  maxEntries: 100,
}

// Simple in-memory rate limiter
class RateLimiter {
  private requests: number[] = []
  private tokens: number[] = []

  constructor(private config: RateLimitConfig) {}

  async checkRate(tokensToUse: number = 0): Promise<boolean> {
    if (!this.config.enabled) return true

    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Clean old entries
    this.requests = this.requests.filter(time => time > oneMinuteAgo)
    this.tokens = this.tokens.filter(time => time > oneMinuteAgo)

    // Check limits
    if (this.requests.length >= this.config.maxRequestsPerMinute) {
      return false
    }

    const totalTokens = this.tokens.length + tokensToUse
    if (totalTokens > this.config.maxTokensPerMinute) {
      return false
    }

    // Record this request
    this.requests.push(now)
    for (let i = 0; i < tokensToUse; i++) {
      this.tokens.push(now)
    }

    return true
  }
}

// Simple in-memory cache
class ResponseCache {
  private cache = new Map<string, { data: ProposalResponse; expires: number }>()

  constructor(private config: CacheConfig) {}

  get(key: string): ProposalResponse | null {
    if (!this.config.enabled) return null

    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set(key: string, data: ProposalResponse): void {
    if (!this.config.enabled) return

    // Clean up old entries if we're at capacity
    if (this.cache.size >= this.config.maxEntries) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    const expires = Date.now() + this.config.ttlMinutes * 60000
    this.cache.set(key, { data, expires })
  }

  private generateKey(
    request: ProposalRequest,
    template: ProposalTemplate
  ): string {
    return btoa(JSON.stringify({ request, template: template.id }))
  }

  getCachedProposal(
    request: ProposalRequest,
    template: ProposalTemplate
  ): ProposalResponse | null {
    const key = this.generateKey(request, template)
    return this.get(key)
  }

  setCachedProposal(
    request: ProposalRequest,
    template: ProposalTemplate,
    response: ProposalResponse
  ): void {
    const key = this.generateKey(request, template)
    this.set(key, response)
  }
}

export class OpenAIService {
  private client: OpenAI | null = null
  private config: OpenAIConfig = DEFAULT_CONFIG
  private rateLimiter: RateLimiter
  private cache: ResponseCache

  constructor() {
    this.rateLimiter = new RateLimiter(DEFAULT_RATE_LIMIT)
    this.cache = new ResponseCache(DEFAULT_CACHE_CONFIG)
    this.initializeClient()
  }

  private initializeClient(): void {
    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      // eslint-disable-next-line no-console
      console.warn(
        'OpenAI API key not configured. Proposal generation will not work.'
      )
      return
    }

    try {
      this.client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: false, // Only allow server-side usage
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize OpenAI client:', error)
    }
  }

  isConfigured(): boolean {
    return this.client !== null
  }

  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  async generateProposal(
    request: ProposalRequest,
    template: ProposalTemplate
  ): Promise<ProposalResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        'OpenAI service is not configured. Please check your API key.'
      )
    }

    // Check cache first
    const cached = this.cache.getCachedProposal(request, template)
    if (cached) {
      return cached
    }

    // Check rate limits
    const estimatedTokens = this.estimateTokens(request, template)
    const canProceed = await this.rateLimiter.checkRate(estimatedTokens)
    if (!canProceed) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    const startTime = Date.now()

    try {
      // Build the prompt
      const systemPrompt = this.buildSystemPrompt(template, request)
      const userPrompt = this.buildUserPrompt(template, request)

      const response = await this.client!.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      const proposalResponse: ProposalResponse = {
        id: `proposal_${Date.now()}`,
        content,
        title: request.jobTitle,
        keyPoints: this.extractKeyPoints(content),
        estimatedBudget: this.extractBudget(content),
        estimatedTimeline: this.extractTimeline(content),
        createdAt: new Date(),
        metadata: {
          model: this.config.model,
          tokensUsed: response.usage?.total_tokens || 0,
          processingTime: Date.now() - startTime,
        },
      }

      // Cache the response
      this.cache.setCachedProposal(request, template, proposalResponse)

      return proposalResponse
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating proposal:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to generate proposal: ${error.message}`)
      }
      throw new Error('Failed to generate proposal: Unknown error')
    }
  }

  private buildSystemPrompt(
    template: ProposalTemplate,
    request: ProposalRequest
  ): string {
    let prompt = template.systemPrompt

    // Replace template variables
    prompt = prompt.replace(/\{projectType\}/g, request.projectType)
    prompt = prompt.replace(/\{jobTitle\}/g, request.jobTitle)

    return prompt
  }

  private buildUserPrompt(
    template: ProposalTemplate,
    request: ProposalRequest
  ): string {
    let prompt = template.userPromptTemplate

    // Replace all template variables
    prompt = prompt.replace(/\{jobTitle\}/g, request.jobTitle)
    prompt = prompt.replace(/\{jobDescription\}/g, request.jobDescription)
    prompt = prompt.replace(
      /\{clientBudget\}/g,
      request.clientBudget || 'Not specified'
    )
    prompt = prompt.replace(
      /\{timeline\}/g,
      request.timeline || 'Not specified'
    )
    prompt = prompt.replace(
      /\{requirements\}/g,
      request.requirements?.join(', ') || 'None specified'
    )
    prompt = prompt.replace(
      /\{additionalContext\}/g,
      request.additionalContext || ''
    )

    return prompt
  }

  private estimateTokens(
    request: ProposalRequest,
    template: ProposalTemplate
  ): number {
    // Rough estimation: 1 token ≈ 4 characters
    const systemPrompt = this.buildSystemPrompt(template, request)
    const userPrompt = this.buildUserPrompt(template, request)
    const totalChars = systemPrompt.length + userPrompt.length
    return Math.ceil(totalChars / 4) + this.config.maxTokens // Input + estimated output
  }

  private extractKeyPoints(content: string): string[] {
    // Simple extraction - look for bullet points or numbered lists
    const lines = content.split('\n')
    const keyPoints: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/)) {
        keyPoints.push(
          trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '')
        )
      }
    }

    return keyPoints.slice(0, 5) // Limit to 5 key points
  }

  private extractBudget(content: string): string | undefined {
    // Look for budget mentions
    const budgetRegex = /\$[\d,]+/g
    const matches = content.match(budgetRegex)
    return matches?.[0]
  }

  private extractTimeline(content: string): string | undefined {
    // Look for timeline mentions
    const timelineRegex = /\b\d+\s+(weeks?|months?|days?)\b/gi
    const matches = content.match(timelineRegex)
    return matches?.[0]
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false
    }

    try {
      const response = await this.client!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      })

      return response.choices.length > 0
    } catch {
      return false
    }
  }
}

export const openAIService = new OpenAIService()

// Simplified function for the proposal generator interface
export async function generateProposal(formData: {
  projectType: string
  clientName: string
  projectTitle: string
  requirements: string
  timeline: string
  budget: string
  additionalNotes: string
}) {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      'OpenAI API key not configured. Please check your environment variables.'
    )
  }

  try {
    const client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: false,
    })

    // Build a comprehensive prompt
    const systemPrompt = `You are an expert freelance developer who creates professional project proposals. 
Your task is to generate a detailed, persuasive proposal for a ${formData.projectType} project.

The proposal should include:
1. Professional introduction and understanding of the project
2. Technical approach and solution overview
3. Key features and deliverables
4. Timeline and project phases
5. Estimated hours and costs
6. Why you're the right developer for this project

Keep the tone professional but approachable. Focus on value and results for the client.`

    const userPrompt = `Create a detailed project proposal for:

Project Title: ${formData.projectTitle}
Client Name: ${formData.clientName || 'the client'}
Project Type: ${formData.projectType}

Project Requirements:
${formData.requirements}

${formData.timeline ? `Expected Timeline: ${formData.timeline}` : ''}
${formData.budget ? `Budget Range: ${formData.budget}` : ''}
${formData.additionalNotes ? `Additional Notes: ${formData.additionalNotes}` : ''}

Please provide a comprehensive proposal that includes estimated hours, costs, and a detailed timeline.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    // Extract estimated values from the content
    const estimatedHours = extractEstimatedHours(content) || 'TBD'
    const estimatedCost =
      extractEstimatedCost(content) || formData.budget || 'TBD'
    const timeline = extractTimeline(content) || formData.timeline || 'TBD'

    return {
      title: formData.projectTitle,
      content,
      estimatedHours,
      estimatedCost,
      timeline,
      projectType: formData.projectType,
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating proposal:', error)
    throw error
  }
}

function extractEstimatedHours(content: string): string | null {
  const patterns = [
    /estimated\s+hours?:\s*(\d+(?:-\d+)?)/i,
    /total\s+hours?:\s*(\d+(?:-\d+)?)/i,
    /(\d+(?:-\d+)?)\s*hours?\s*total/i,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return match[1] + ' hours'
  }
  return null
}

function extractEstimatedCost(content: string): string | null {
  const patterns = [
    /\$[\d,]+(?:-\$[\d,]+)?/g,
    /estimated\s+cost:\s*\$?([\d,]+)/i,
    /total\s+cost:\s*\$?([\d,]+)/i,
  ]

  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches) return matches[0].includes('$') ? matches[0] : '$' + matches[0]
  }
  return null
}

function extractTimeline(content: string): string | null {
  const patterns = [
    /timeline:\s*(\d+\s*(?:weeks?|months?|days?))/i,
    /duration:\s*(\d+\s*(?:weeks?|months?|days?))/i,
    /(\d+\s*(?:weeks?|months?|days?))\s*to\s*complete/i,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return match[1]
  }
  return null
}
