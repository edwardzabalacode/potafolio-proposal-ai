'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { proposalsService } from '@/lib/services/proposals-service'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import { Copy, Download, Edit3, Save, Archive, Loader2 } from 'lucide-react'
import type { SavedProposal } from '@/lib/types/proposal'

interface ProposalPreviewProps {
  proposal: {
    title: string
    content: string
    estimatedHours: string
    estimatedCost: string
    timeline: string
    projectType: string
    // Form data for better mapping
    clientName?: string
    requirements?: string
    budget?: string
    additionalNotes?: string
    // Optional legacy fields
    jobTitle?: string
    jobDescription?: string
    clientBudget?: string
    additionalContext?: string
    templateId?: string
    generationMetadata?: {
      model: string
      tokensUsed: number
      processingTime: number
    }
  } | null
  isGenerating: boolean
  onProposalSaved?: (savedProposal: SavedProposal) => void
}

export function ProposalPreview({
  proposal,
  isGenerating,
  onProposalSaved,
}: ProposalPreviewProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editableContent, setEditableContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    if (proposal) {
      setEditableContent(proposal.content)
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    // Just save the edited content locally for now
    setIsEditing(false)
  }

  const handleSaveToLibrary = async () => {
    if (!proposal || !user) return

    try {
      setIsSaving(true)

      // Create SavedProposal object
      const savedProposal: Omit<
        SavedProposal,
        'id' | 'createdAt' | 'updatedAt' | 'version'
      > = {
        title: proposal.title,
        content: isEditing ? editableContent : proposal.content,
        jobTitle: proposal.jobTitle || proposal.title,
        jobDescription: proposal.jobDescription || proposal.requirements || '',
        clientBudget: proposal.clientBudget || proposal.budget,
        projectType: proposal.projectType as SavedProposal['projectType'],
        requirements: proposal.requirements
          ? [proposal.requirements]
          : undefined,
        timeline: proposal.timeline,
        additionalContext:
          proposal.additionalContext || proposal.additionalNotes,

        // Generated content details
        estimatedBudget: proposal.estimatedCost,
        estimatedTimeline: proposal.timeline,

        // Management fields
        status: 'draft',
        tags: [proposal.projectType, 'generated'],
        clientName: proposal.clientName,

        // Success tracking
        responseReceived: false,
        hired: false,

        // Metadata
        templateId: proposal.templateId || 'general-template',
        generationMetadata: proposal.generationMetadata || {
          model: 'unknown',
          tokensUsed: 0,
          processingTime: 0,
        },
      }

      const saved = await proposalsService.createProposal(
        user.uid,
        savedProposal
      )

      if (onProposalSaved) {
        onProposalSaved(saved)
      }

      alert('Proposal saved to library successfully!')
    } catch (error) {
      // Error saving proposal
      alert('Failed to save proposal to library')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = async () => {
    if (proposal) {
      try {
        const fullProposal = `# ${proposal.title}

${isEditing ? editableContent : proposal.content}

---

**Project Details:**
- Estimated Hours: ${proposal.estimatedHours}
- Estimated Cost: ${proposal.estimatedCost}
- Timeline: ${proposal.timeline}
- Project Type: ${proposal.projectType}
`
        await navigator.clipboard.writeText(fullProposal)
        alert('Proposal copied to clipboard!')
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to copy:', error)
        alert('Failed to copy proposal')
      }
    }
  }

  const handleDownload = () => {
    if (proposal) {
      const fullProposal = `# ${proposal.title}

${isEditing ? editableContent : proposal.content}

---

**Project Details:**
- Estimated Hours: ${proposal.estimatedHours}
- Estimated Cost: ${proposal.estimatedCost}
- Timeline: ${proposal.timeline}
- Project Type: ${proposal.projectType}
`
      const blob = new Blob([fullProposal], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `proposal-${proposal.title.toLowerCase().replace(/\s+/g, '-')}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (isGenerating) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-green border-t-transparent"></div>
        <p className="font-mono text-gray-400">Generating your proposal...</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">📄</div>
        <h3 className="mb-2 font-mono text-lg text-gray-400">
          No proposal generated yet
        </h3>
        <p className="text-sm text-gray-500">
          Fill out the form and click &quot;Generate Proposal&quot; to get
          started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <BrutalistButton
          onClick={handleSaveToLibrary}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Archive size={14} />
          )}
          {isSaving ? 'Saving...' : 'Save to Library'}
        </BrutalistButton>

        <BrutalistButton
          onClick={handleEdit}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <Edit3 size={14} />
          {isEditing ? 'Editing' : 'Edit'}
        </BrutalistButton>

        {isEditing && (
          <BrutalistButton
            onClick={handleSave}
            size="sm"
            className="flex items-center gap-2"
          >
            <Save size={14} />
            Save Changes
          </BrutalistButton>
        )}

        <BrutalistButton
          onClick={handleCopy}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <Copy size={14} />
          Copy
        </BrutalistButton>

        <BrutalistButton
          onClick={handleDownload}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download size={14} />
          Download
        </BrutalistButton>
      </div>

      {/* Proposal content */}
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-mono text-lg font-bold text-white">
            {proposal.title}
          </h3>
          <div className="font-mono text-xs text-gray-500">
            {proposal.projectType.toUpperCase()} PROJECT
          </div>
        </div>

        <div className="border-l-2 border-accent-green pl-4">
          {isEditing ? (
            <textarea
              value={editableContent}
              onChange={e => setEditableContent(e.target.value)}
              className="h-64 w-full resize-none border-2 border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-gray-300 outline-none focus:border-accent-green"
            />
          ) : (
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
              {proposal.content}
            </div>
          )}
        </div>

        {/* Project details */}
        <div className="grid grid-cols-1 gap-4 border-t border-gray-700 pt-4 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-1 font-mono text-xs text-gray-500">
              ESTIMATED HOURS
            </div>
            <div className="font-mono font-bold text-accent-green">
              {proposal.estimatedHours}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 font-mono text-xs text-gray-500">
              ESTIMATED COST
            </div>
            <div className="font-mono font-bold text-accent-green">
              {proposal.estimatedCost}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 font-mono text-xs text-gray-500">TIMELINE</div>
            <div className="font-mono font-bold text-accent-green">
              {proposal.timeline}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
