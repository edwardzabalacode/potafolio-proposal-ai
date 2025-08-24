'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { proposalsService } from '@/lib/services/proposals-service'
import { BrutalistCard } from '@/components/ui/brutalist-card'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import { ProposalHistory } from './proposal-history'
import type {
  SavedProposal,
  ProposalHistory as HistoryEntry,
} from '@/lib/types/proposal'
import {
  Save,
  X,
  Eye,
  EyeOff,
  User,
  Tag,
  DollarSign,
  FileText,
  History,
} from 'lucide-react'

interface ProposalEditorProps {
  proposal: SavedProposal
  onSave: (proposal: SavedProposal) => void
  onCancel: () => void
}

export function ProposalEditor({
  proposal,
  onSave,
  onCancel,
}: ProposalEditorProps) {
  const { user } = useAuth()
  const [editedProposal, setEditedProposal] = useState<SavedProposal>(proposal)
  const [showPreview, setShowPreview] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [newTags, setNewTags] = useState('')

  const loadHistory = useCallback(async () => {
    if (!user || !proposal.id) return

    try {
      const historyData = await proposalsService.getProposalHistory(
        user.uid,
        proposal.id
      )
      setHistory(historyData)
    } catch (error) {
      // Error loading proposal history
    }
  }, [user, proposal.id])

  useEffect(() => {
    if (user && proposal.id) {
      loadHistory()
    }
  }, [user, proposal.id, loadHistory])

  const handleInputChange = (
    field: keyof SavedProposal,
    value:
      | string
      | boolean
      | Date
      | string[]
      | SavedProposal['status']
      | SavedProposal['projectType']
      | undefined
  ) => {
    setEditedProposal(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArrayChange = (field: keyof SavedProposal, value: string[]) => {
    setEditedProposal(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddTag = () => {
    if (!newTags.trim()) return

    const tagsToAdd = newTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag && !editedProposal.tags.includes(tag))

    if (tagsToAdd.length > 0) {
      handleArrayChange('tags', [...editedProposal.tags, ...tagsToAdd])
      setNewTags('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleArrayChange(
      'tags',
      editedProposal.tags.filter(tag => tag !== tagToRemove)
    )
  }

  const handleSave = async () => {
    if (!user || !proposal.id) return

    try {
      setSaving(true)
      const updated = await proposalsService.updateProposal(
        user.uid,
        proposal.id,
        {
          ...editedProposal,
          updatedAt: new Date(),
        }
      )
      onSave(updated)
    } catch (error) {
      // Error saving proposal
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    return JSON.stringify(proposal) !== JSON.stringify(editedProposal)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-white">
              Edit Proposal
            </h1>
            <p className="mt-2 text-gray-400">
              Version {editedProposal.version} • Created{' '}
              {new Date(proposal.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-3">
            <BrutalistButton
              onClick={() => setShowHistory(!showHistory)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <History size={16} />
              {showHistory ? 'Hide History' : 'Show History'}
            </BrutalistButton>

            <BrutalistButton
              onClick={() => setShowPreview(!showPreview)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </BrutalistButton>

            <BrutalistButton
              onClick={onCancel}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </BrutalistButton>

            <BrutalistButton
              onClick={handleSave}
              disabled={!hasChanges() || saving}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </BrutalistButton>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <ProposalHistory
          history={history}
          onClose={() => setShowHistory(false)}
        />
      )}

      <div
        className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {/* Editor */}
        <div className="space-y-6">
          {/* Basic Information */}
          <BrutalistCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold text-white">
              <FileText size={18} />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={editedProposal.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                  placeholder="Enter proposal title..."
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300">
                  Job Title
                </label>
                <input
                  type="text"
                  value={editedProposal.jobTitle}
                  onChange={e => handleInputChange('jobTitle', e.target.value)}
                  className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                  placeholder="Original job title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block font-mono text-sm text-gray-300">
                    Project Type
                  </label>
                  <select
                    value={editedProposal.projectType}
                    onChange={e =>
                      handleInputChange('projectType', e.target.value)
                    }
                    className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                  >
                    <option value="web-development">Web Development</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="design">UI/UX Design</option>
                    <option value="consulting">Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-mono text-sm text-gray-300">
                    Status
                  </label>
                  <select
                    value={editedProposal.status}
                    onChange={e => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={editedProposal.category || ''}
                  onChange={e =>
                    handleInputChange('category', e.target.value || undefined)
                  }
                  className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                  placeholder="e.g., E-commerce, SaaS, Corporate..."
                />
              </div>
            </div>
          </BrutalistCard>

          {/* Client Information */}
          <BrutalistCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold text-white">
              <User size={18} />
              Client Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editedProposal.clientName || ''}
                  onChange={e =>
                    handleInputChange('clientName', e.target.value || undefined)
                  }
                  className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                  placeholder="Client's name..."
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300">
                  Company
                </label>
                <input
                  type="text"
                  value={editedProposal.clientCompany || ''}
                  onChange={e =>
                    handleInputChange(
                      'clientCompany',
                      e.target.value || undefined
                    )
                  }
                  className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                  placeholder="Company name..."
                />
              </div>
            </div>
          </BrutalistCard>

          {/* Project Details */}
          <BrutalistCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold text-white">
              <DollarSign size={18} />
              Project Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block font-mono text-sm text-gray-300">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    value={editedProposal.estimatedBudget || ''}
                    onChange={e =>
                      handleInputChange(
                        'estimatedBudget',
                        e.target.value || undefined
                      )
                    }
                    className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                    placeholder="e.g., $5,000 - $10,000"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-sm text-gray-300">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={editedProposal.estimatedTimeline || ''}
                    onChange={e =>
                      handleInputChange(
                        'estimatedTimeline',
                        e.target.value || undefined
                      )
                    }
                    className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                    placeholder="e.g., 4-6 weeks"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300">
                  Project Value (if hired)
                </label>
                <input
                  type="text"
                  value={editedProposal.projectValue || ''}
                  onChange={e =>
                    handleInputChange(
                      'projectValue',
                      e.target.value || undefined
                    )
                  }
                  className="w-full border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                  placeholder="Actual project value if hired..."
                />
              </div>
            </div>
          </BrutalistCard>

          {/* Tags */}
          <BrutalistCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold text-white">
              <Tag size={18} />
              Tags
            </h2>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {editedProposal.tags.map(tag => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 rounded bg-gray-700 px-3 py-1 font-mono text-sm text-gray-300"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tags (comma-separated)..."
                  className="flex-1 border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
                />
                <BrutalistButton onClick={handleAddTag} size="sm">
                  Add
                </BrutalistButton>
              </div>
            </div>
          </BrutalistCard>

          {/* Proposal Content */}
          <BrutalistCard className="p-6">
            <h2 className="mb-4 font-mono text-lg font-bold text-white">
              Proposal Content
            </h2>

            <textarea
              value={editedProposal.content}
              onChange={e => handleInputChange('content', e.target.value)}
              className="h-96 w-full resize-none border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
              placeholder="Write your proposal content here..."
            />
          </BrutalistCard>

          {/* Notes */}
          <BrutalistCard className="p-6">
            <h2 className="mb-4 font-mono text-lg font-bold text-white">
              Notes & Comments
            </h2>

            <textarea
              value={editedProposal.notes || ''}
              onChange={e =>
                handleInputChange('notes', e.target.value || undefined)
              }
              className="h-24 w-full resize-none border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
              placeholder="Internal notes and comments..."
            />
          </BrutalistCard>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="space-y-6">
            <BrutalistCard className="p-6">
              <h2 className="mb-4 font-mono text-lg font-bold text-white">
                Live Preview
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-mono text-lg font-bold text-white">
                    {editedProposal.title}
                  </h3>
                  <div className="mb-4 font-mono text-sm text-gray-400">
                    {editedProposal.jobTitle}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
                    {editedProposal.content}
                  </div>
                </div>

                {editedProposal.estimatedBudget && (
                  <div className="mt-6 border border-gray-700 bg-gray-900 p-4">
                    <div className="mb-2 text-sm text-gray-400">
                      Estimated Budget
                    </div>
                    <div className="font-mono text-white">
                      {editedProposal.estimatedBudget}
                    </div>
                  </div>
                )}

                {editedProposal.estimatedTimeline && (
                  <div className="mt-2 border border-gray-700 bg-gray-900 p-4">
                    <div className="mb-2 text-sm text-gray-400">Timeline</div>
                    <div className="font-mono text-white">
                      {editedProposal.estimatedTimeline}
                    </div>
                  </div>
                )}
              </div>
            </BrutalistCard>
          </div>
        )}
      </div>
    </div>
  )
}
