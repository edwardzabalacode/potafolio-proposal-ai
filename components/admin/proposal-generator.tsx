'use client'

import { useState } from 'react'
import { ProposalForm } from './proposal-form'
import { ProposalPreview } from './proposal-preview'
import { BrutalistCard } from '@/components/ui/brutalist-card'

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

export function ProposalGenerator() {
  const [generatedProposal, setGeneratedProposal] =
    useState<GeneratedProposal | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <BrutalistCard className="p-6">
          <h2 className="mb-4 font-mono text-xl font-bold text-white">
            Project Requirements
          </h2>
          <ProposalForm
            onProposalGenerated={setGeneratedProposal}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </BrutalistCard>
      </div>

      <div className="space-y-6">
        <BrutalistCard className="p-6">
          <h2 className="mb-4 font-mono text-xl font-bold text-white">
            Generated Proposal
          </h2>
          <ProposalPreview
            proposal={generatedProposal}
            isGenerating={isGenerating}
          />
        </BrutalistCard>
      </div>
    </div>
  )
}
