'use client'

import { useState } from 'react'
import { BrutalistButton } from '@/components/ui/brutalist-button'

interface ProposalFormData {
  projectType: string
  clientName: string
  projectTitle: string
  requirements: string
  timeline: string
  budget: string
  additionalNotes: string
}

interface GeneratedProposal {
  title: string
  content: string
  estimatedHours: string
  estimatedCost: string
  timeline: string
  projectType: string
  // Form data needed for saving
  clientName?: string
  requirements?: string
  budget?: string
  additionalNotes?: string
}

interface ProposalFormProps {
  onProposalGenerated: (proposal: GeneratedProposal) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

export function ProposalForm({
  onProposalGenerated,
  isGenerating,
  setIsGenerating,
}: ProposalFormProps) {
  const [formData, setFormData] = useState<ProposalFormData>({
    projectType: 'web-development',
    clientName: '',
    projectTitle: '',
    requirements: '',
    timeline: '',
    budget: '',
    additionalNotes: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.projectTitle.trim() || !formData.requirements.trim()) {
      alert('Please fill in at least the project title and requirements')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate proposal')
      }

      const { proposal } = await response.json()

      // Add form data to the proposal for saving purposes
      const enhancedProposal = {
        ...proposal,
        clientName: formData.clientName,
        requirements: formData.requirements,
        budget: formData.budget,
        additionalNotes: formData.additionalNotes,
      }

      onProposalGenerated(enhancedProposal)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating proposal:', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Error generating proposal. Please try again.'
      alert(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block font-mono text-sm text-gray-300">
          Project Type
        </label>
        <select
          name="projectType"
          value={formData.projectType}
          onChange={handleInputChange}
          className="w-full border-2 border-gray-700 bg-gray-800 px-3 py-2 font-mono text-white outline-none focus:border-accent-green"
        >
          <option value="web-development">Web Development</option>
          <option value="mobile-app">Mobile App</option>
          <option value="ecommerce">E-commerce</option>
          <option value="cms">Content Management System</option>
          <option value="api">API Development</option>
          <option value="ui-ux">UI/UX Design</option>
          <option value="consulting">Technical Consulting</option>
          <option value="maintenance">Maintenance & Support</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-mono text-sm text-gray-300">
          Client Name
        </label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleInputChange}
          className="w-full border-2 border-gray-700 bg-gray-800 px-3 py-2 font-mono text-white outline-none focus:border-accent-green"
          placeholder="Enter client name"
        />
      </div>

      <div>
        <label className="mb-2 block font-mono text-sm text-gray-300">
          Project Title *
        </label>
        <input
          type="text"
          name="projectTitle"
          value={formData.projectTitle}
          onChange={handleInputChange}
          required
          className="w-full border-2 border-gray-700 bg-gray-800 px-3 py-2 font-mono text-white outline-none focus:border-accent-green"
          placeholder="Enter project title"
        />
      </div>

      <div>
        <label className="mb-2 block font-mono text-sm text-gray-300">
          Project Requirements *
        </label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleInputChange}
          required
          rows={6}
          className="w-full resize-none border-2 border-gray-700 bg-gray-800 px-3 py-2 font-mono text-white outline-none focus:border-accent-green"
          placeholder="Describe the project requirements, features, and functionality needed..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-sm text-gray-300">
            Expected Timeline
          </label>
          <input
            type="text"
            name="timeline"
            value={formData.timeline}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-700 bg-gray-800 px-3 py-2 font-mono text-white outline-none focus:border-accent-green"
            placeholder="e.g., 4-6 weeks"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-sm text-gray-300">
            Budget Range
          </label>
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            className="w-full border-2 border-gray-700 bg-gray-800 px-3 py-2 font-mono text-white outline-none focus:border-accent-green"
            placeholder="e.g., $5,000 - $10,000"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-mono text-sm text-gray-300">
          Additional Notes
        </label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleInputChange}
          rows={3}
          className="w-full resize-none border-2 border-gray-700 bg-gray-800 px-3 py-2 font-mono text-white outline-none focus:border-accent-green"
          placeholder="Any additional context, constraints, or preferences..."
        />
      </div>

      <BrutalistButton type="submit" disabled={isGenerating} className="w-full">
        {isGenerating ? 'Generating Proposal...' : 'Generate Proposal'}
      </BrutalistButton>
    </form>
  )
}
