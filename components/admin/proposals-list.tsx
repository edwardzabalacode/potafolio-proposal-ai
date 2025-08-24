'use client'

import { useState } from 'react'
import { BrutalistCard } from '@/components/ui/brutalist-card'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import type { SavedProposal } from '@/lib/types/proposal'
import {
  Edit3,
  Copy,
  Trash2,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Building2,
  User,
  Tag,
  MoreHorizontal,
  Send,
  Archive,
} from 'lucide-react'

interface ProposalsListProps {
  proposals: SavedProposal[]
  loading: boolean
  onEdit: (proposal: SavedProposal) => void
  onDuplicate: (proposalId: string) => void
  onDelete: (proposalId: string) => void
  onUpdateStatus: (proposalId: string, updates: Partial<SavedProposal>) => void
}

export function ProposalsList({
  proposals,
  loading,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateStatus,
}: ProposalsListProps) {
  const [selectedProposal, setSelectedProposal] =
    useState<SavedProposal | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const getStatusColor = (status: SavedProposal['status']) => {
    const colors = {
      draft: 'bg-gray-600',
      sent: 'bg-blue-600',
      accepted: 'bg-green-600',
      rejected: 'bg-red-600',
      archived: 'bg-gray-500',
    }
    return colors[status] || 'bg-gray-600'
  }

  const getStatusIcon = (status: SavedProposal['status']) => {
    const icons = {
      draft: <Edit3 size={12} />,
      sent: <Mail size={12} />,
      accepted: <CheckCircle size={12} />,
      rejected: <XCircle size={12} />,
      archived: <Archive size={12} />,
    }
    return icons[status] || <Edit3 size={12} />
  }

  const handleStatusUpdate = (
    proposal: SavedProposal,
    newStatus: SavedProposal['status']
  ) => {
    const updates: Partial<SavedProposal> = { status: newStatus }

    if (newStatus === 'sent' && !proposal.sentAt) {
      updates.sentAt = new Date()
    }

    if (newStatus === 'accepted' || newStatus === 'rejected') {
      updates.responseReceived = true
      updates.responseDate = new Date()
    }

    onUpdateStatus(proposal.id!, updates)
  }

  const handleViewPreview = (proposal: SavedProposal) => {
    setSelectedProposal(proposal)
    setShowPreview(true)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const formatCurrency = (value: string) => {
    // If value already starts with $, return as is
    if (value.trim().startsWith('$')) {
      return value
    }

    const num = parseFloat(value.replace(/[^0-9.]/g, ''))
    return isNaN(num) ? value : `$${num.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="font-mono text-gray-400">Loading proposals...</div>
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <BrutalistCard className="p-12 text-center">
        <div className="space-y-4">
          <div className="font-mono text-lg text-gray-400">
            No proposals found
          </div>
          <div className="text-sm text-gray-500">
            Create your first proposal or adjust your filters to see more
            results.
          </div>
        </div>
      </BrutalistCard>
    )
  }

  return (
    <div className="space-y-4 overflow-visible">
      {proposals.map(proposal => (
        <BrutalistCard
          key={proposal.id}
          className="overflow-visible p-6 transition-colors hover:bg-gray-900/50"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="truncate font-mono text-lg font-bold text-white">
                    {proposal.title}
                  </h3>
                  <div
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs text-white ${getStatusColor(proposal.status)}`}
                  >
                    {getStatusIcon(proposal.status)}
                    <span className="capitalize">{proposal.status}</span>
                  </div>
                  {proposal.version > 1 && (
                    <div className="rounded bg-gray-700 px-2 py-1 font-mono text-xs text-gray-300">
                      v{proposal.version}
                    </div>
                  )}
                </div>

                <div className="font-mono text-sm text-gray-400">
                  {proposal.jobTitle}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="ml-4 flex items-center gap-2">
                <BrutalistButton
                  onClick={() => handleViewPreview(proposal)}
                  variant="secondary"
                  size="sm"
                  title="Preview"
                >
                  <Eye size={14} />
                </BrutalistButton>

                <BrutalistButton
                  onClick={() => onEdit(proposal)}
                  variant="secondary"
                  size="sm"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </BrutalistButton>

                <BrutalistButton
                  onClick={() => onDuplicate(proposal.id!)}
                  variant="secondary"
                  size="sm"
                  title="Duplicate"
                >
                  <Copy size={14} />
                </BrutalistButton>

                {/* Status Change Menu */}
                <div className="group relative overflow-visible">
                  <BrutalistButton
                    variant="secondary"
                    size="sm"
                    title="More Actions"
                  >
                    <MoreHorizontal size={14} />
                  </BrutalistButton>

                  <div className="invisible absolute right-0 top-full z-[9999] mt-1 min-w-[150px] rounded border border-gray-700 bg-gray-900 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
                    <div className="py-1">
                      <div className="border-b border-gray-700 px-3 py-1 font-mono text-xs text-gray-400">
                        Change Status
                      </div>
                      {[
                        'draft',
                        'sent',
                        'accepted',
                        'rejected',
                        'archived',
                      ].map(status => (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusUpdate(
                              proposal,
                              status as SavedProposal['status']
                            )
                          }
                          disabled={proposal.status === status}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500"
                        >
                          {getStatusIcon(status as SavedProposal['status'])}
                          <span className="capitalize">{status}</span>
                        </button>
                      ))}
                      <div className="mt-1 border-t border-gray-700 pt-1">
                        <button
                          onClick={() => onDelete(proposal.id!)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} />
                <span>Created: {formatDate(proposal.createdAt)}</span>
              </div>

              {proposal.sentAt && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Send size={14} />
                  <span>Sent: {formatDate(proposal.sentAt)}</span>
                </div>
              )}

              {proposal.estimatedBudget && (
                <div className="flex items-center gap-2 text-gray-400">
                  <span>{formatCurrency(proposal.estimatedBudget)}</span>
                </div>
              )}

              {proposal.estimatedTimeline && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={14} />
                  <span>{proposal.estimatedTimeline}</span>
                </div>
              )}
            </div>

            {/* Client Info */}
            {(proposal.clientName || proposal.clientCompany) && (
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {proposal.clientName && (
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{proposal.clientName}</span>
                  </div>
                )}
                {proposal.clientCompany && (
                  <div className="flex items-center gap-2">
                    <Building2 size={14} />
                    <span>{proposal.clientCompany}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {proposal.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {proposal.tags.map(tag => (
                    <span
                      key={tag}
                      className="rounded bg-gray-700 px-2 py-1 font-mono text-xs text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Response & Hire Status */}
            {(proposal.responseReceived || proposal.hired) && (
              <div className="flex items-center gap-4 text-sm">
                {proposal.responseReceived && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={14} />
                    <span>Response received</span>
                    {proposal.responseDate && (
                      <span className="text-gray-400">
                        on {formatDate(proposal.responseDate)}
                      </span>
                    )}
                  </div>
                )}
                {proposal.hired && (
                  <div className="flex items-center gap-2 text-accent-green">
                    <CheckCircle size={14} />
                    <span>Hired!</span>
                    {proposal.projectValue && (
                      <span className="text-gray-400">
                        ({formatCurrency(proposal.projectValue)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </BrutalistCard>
      ))}

      {/* Preview Modal */}
      {showPreview && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[80vh] w-full max-w-4xl overflow-auto border-2 border-gray-700 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-700 p-6">
              <h2 className="font-mono text-xl font-bold text-white">
                Proposal Preview
              </h2>
              <BrutalistButton
                onClick={() => setShowPreview(false)}
                variant="secondary"
                size="sm"
              >
                <XCircle size={16} />
              </BrutalistButton>
            </div>
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <h3 className="mb-4 font-mono text-lg font-bold text-white">
                  {selectedProposal.title}
                </h3>
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
                  {selectedProposal.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
