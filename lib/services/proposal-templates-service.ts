import type { ProposalTemplate } from '@/lib/types/openai'

// Default proposal templates for different project types
const DEFAULT_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'web-development-template',
    name: 'Web Development Template',
    projectType: 'web-development',
    systemPrompt: `You are an experienced freelance web developer writing a compelling proposal for a {projectType} project. 
You have expertise in modern web technologies including React, Next.js, TypeScript, Node.js, and various databases.
Write a professional, personalized proposal that demonstrates understanding of the client's needs and showcases relevant experience.
Focus on delivering value, being clear about timelines and budget, and building trust.`,
    userPromptTemplate: `Write a professional proposal for the following job:

Job Title: {jobTitle}
Job Description: {jobDescription}
Client Budget: {clientBudget}
Timeline: {timeline}
Requirements: {requirements}
Additional Context: {additionalContext}

Please structure the proposal with:
1. A personalized greeting that shows understanding of their specific needs
2. Brief introduction of relevant experience
3. Clear project approach and methodology
4. Technology stack recommendations
5. Timeline breakdown
6. Budget considerations (if budget was mentioned)
7. Portfolio examples or case studies
8. Why you're the right fit for this project
9. Next steps

Keep the tone professional but approachable. Make it clear, concise, and compelling.`,
    variables: [
      'jobTitle',
      'jobDescription',
      'clientBudget',
      'timeline',
      'requirements',
      'additionalContext',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mobile-app-template',
    name: 'Mobile App Development Template',
    projectType: 'mobile-app',
    systemPrompt: `You are an experienced mobile app developer writing a compelling proposal for a mobile application project.
You have expertise in both iOS and Android development, including React Native, Flutter, Swift, Kotlin, and backend services.
Write a professional proposal that demonstrates understanding of mobile development challenges and user experience considerations.`,
    userPromptTemplate: `Write a professional mobile app development proposal for:

Job Title: {jobTitle}
Job Description: {jobDescription}
Client Budget: {clientBudget}
Timeline: {timeline}
Requirements: {requirements}
Additional Context: {additionalContext}

Structure the proposal with:
1. Understanding of their mobile app vision
2. Your mobile development experience and expertise
3. Recommended technology stack (iOS, Android, or cross-platform)
4. User experience and design considerations
5. Development phases and milestones
6. App store submission process
7. Post-launch support and maintenance
8. Timeline and budget breakdown
9. Portfolio examples of similar apps
10. Why you're the ideal developer for this project

Focus on mobile-specific considerations like performance, user experience, and platform guidelines.`,
    variables: [
      'jobTitle',
      'jobDescription',
      'clientBudget',
      'timeline',
      'requirements',
      'additionalContext',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'design-template',
    name: 'UI/UX Design Template',
    projectType: 'design',
    systemPrompt: `You are an experienced UI/UX designer writing a compelling proposal for a design project.
You have expertise in user research, wireframing, prototyping, visual design, and design systems.
Write a professional proposal that demonstrates understanding of user-centered design principles and business goals.`,
    userPromptTemplate: `Write a professional UI/UX design proposal for:

Job Title: {jobTitle}
Job Description: {jobDescription}
Client Budget: {clientBudget}
Timeline: {timeline}
Requirements: {requirements}
Additional Context: {additionalContext}

Structure the proposal with:
1. Understanding of their design challenges and user needs
2. Your design experience and process
3. User research and discovery phase
4. Wireframing and information architecture
5. Visual design and branding considerations
6. Prototyping and user testing
7. Design system creation (if applicable)
8. Deliverables and file formats
9. Revision process and feedback cycles
10. Portfolio examples of relevant design work

Emphasize user experience, accessibility, and how design will drive business results.`,
    variables: [
      'jobTitle',
      'jobDescription',
      'clientBudget',
      'timeline',
      'requirements',
      'additionalContext',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'consulting-template',
    name: 'Technical Consulting Template',
    projectType: 'consulting',
    systemPrompt: `You are an experienced technical consultant writing a compelling proposal for a consulting project.
You have expertise in system architecture, code reviews, performance optimization, and technical strategy.
Write a professional proposal that demonstrates analytical thinking and strategic problem-solving abilities.`,
    userPromptTemplate: `Write a professional technical consulting proposal for:

Job Title: {jobTitle}
Job Description: {jobDescription}
Client Budget: {clientBudget}
Timeline: {timeline}
Requirements: {requirements}
Additional Context: {additionalContext}

Structure the proposal with:
1. Understanding of their technical challenges
2. Your consulting experience and methodology
3. Initial assessment and discovery approach
4. Analysis and recommendation process
5. Implementation strategy (if applicable)
6. Knowledge transfer and documentation
7. Ongoing support considerations
8. Expected outcomes and success metrics
9. Case studies of similar consulting work
10. Your unique value proposition as a consultant

Focus on demonstrating strategic thinking and measurable business impact.`,
    variables: [
      'jobTitle',
      'jobDescription',
      'clientBudget',
      'timeline',
      'requirements',
      'additionalContext',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'general-template',
    name: 'General Project Template',
    projectType: 'other',
    systemPrompt: `You are an experienced freelancer writing a compelling proposal for a project.
You have broad technical skills and experience working on various types of projects.
Write a professional proposal that demonstrates understanding of the client's needs and your ability to deliver results.`,
    userPromptTemplate: `Write a professional proposal for:

Job Title: {jobTitle}
Job Description: {jobDescription}
Client Budget: {clientBudget}
Timeline: {timeline}
Requirements: {requirements}
Additional Context: {additionalContext}

Structure the proposal with:
1. Clear understanding of the project requirements
2. Your relevant experience and skills
3. Proposed approach and methodology
4. Project phases and deliverables
5. Timeline and milestones
6. Communication and collaboration process
7. Quality assurance and testing
8. Budget considerations
9. Relevant portfolio examples
10. Why you're the right person for this project

Keep the proposal tailored to the specific project needs and demonstrate your expertise.`,
    variables: [
      'jobTitle',
      'jobDescription',
      'clientBudget',
      'timeline',
      'requirements',
      'additionalContext',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export class ProposalTemplatesService {
  private templates: Map<string, ProposalTemplate> = new Map()

  constructor() {
    // Initialize with default templates
    this.initializeDefaultTemplates()
  }

  private initializeDefaultTemplates(): void {
    DEFAULT_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  // Get all templates
  getAllTemplates(): ProposalTemplate[] {
    return Array.from(this.templates.values())
  }

  // Get template by ID
  getTemplate(id: string): ProposalTemplate | null {
    return this.templates.get(id) || null
  }

  // Get templates by project type
  getTemplatesByType(projectType: string): ProposalTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.projectType === projectType
    )
  }

  // Get best template for project type
  getBestTemplate(projectType: string): ProposalTemplate {
    const typeTemplates = this.getTemplatesByType(projectType)
    if (typeTemplates.length > 0) {
      return typeTemplates[0]
    }

    // Fallback to general template
    return this.getTemplate('general-template') || DEFAULT_TEMPLATES[4]
  }

  // Add or update template
  upsertTemplate(
    template: Omit<ProposalTemplate, 'createdAt' | 'updatedAt'>
  ): ProposalTemplate {
    const existingTemplate = this.templates.get(template.id)
    const now = new Date()

    const fullTemplate: ProposalTemplate = {
      ...template,
      createdAt: existingTemplate?.createdAt || now,
      updatedAt: now,
    }

    this.templates.set(template.id, fullTemplate)
    return fullTemplate
  }

  // Delete template
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id)
  }

  // Validate template
  validateTemplate(template: Partial<ProposalTemplate>): string[] {
    const errors: string[] = []

    if (!template.name?.trim()) {
      errors.push('Template name is required')
    }

    if (!template.projectType?.trim()) {
      errors.push('Project type is required')
    }

    if (!template.systemPrompt?.trim()) {
      errors.push('System prompt is required')
    }

    if (!template.userPromptTemplate?.trim()) {
      errors.push('User prompt template is required')
    }

    // Check for required variables in user prompt template
    const requiredVars = ['jobTitle', 'jobDescription']
    const userPrompt = template.userPromptTemplate || ''

    requiredVars.forEach(variable => {
      if (!userPrompt.includes(`{${variable}}`)) {
        errors.push(`User prompt template must include {${variable}}`)
      }
    })

    return errors
  }

  // Extract variables from template
  extractVariables(template: string): string[] {
    const variableRegex = /\{([^}]+)\}/g
    const variables = new Set<string>()
    let match

    while ((match = variableRegex.exec(template)) !== null) {
      variables.add(match[1])
    }

    return Array.from(variables)
  }

  // Get available project types
  getAvailableProjectTypes(): string[] {
    const types = new Set<string>()
    this.templates.forEach(template => {
      types.add(template.projectType)
    })
    return Array.from(types)
  }
}

export const proposalTemplatesService = new ProposalTemplatesService()
