'use client'

import { BrutalistCard } from '@/components/ui/brutalist-card'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import type { ProposalHistory } from '@/lib/types/proposal'
import {
  Clock,
  Edit,
  Mail,
  CheckCircle,
  XCircle,
  Archive,
  Plus,
  X,
} from 'lucide-react'

interface ProposalHistoryProps {
  history: ProposalHistory[]
  onClose: () => void
}

export function ProposalHistory({ history, onClose }: ProposalHistoryProps) {
  const getActionIcon = (action: ProposalHistory['action']) => {
    const icons = {
      created: <Plus size={14} className="text-green-400" />,
      edited: <Edit size={14} className="text-blue-400" />,
      sent: <Mail size={14} className="text-purple-400" />,
      response_received: <CheckCircle size={14} className="text-green-400" />,
      hired: <CheckCircle size={14} className="text-accent-green" />,
      rejected: <XCircle size={14} className="text-red-400" />,
      archived: <Archive size={14} className="text-gray-400" />,
    }
    return icons[action] || <Clock size={14} className="text-gray-400" />
  }

  const getActionColor = (action: ProposalHistory['action']) => {
    const colors = {
      created: 'border-l-green-400',
      edited: 'border-l-blue-400',
      sent: 'border-l-purple-400',
      response_received: 'border-l-green-400',
      hired: 'border-l-accent-green',
      rejected: 'border-l-red-400',
      archived: 'border-l-gray-400',
    }
    return colors[action] || 'border-l-gray-400'
  }

  const formatActionDescription = (action: ProposalHistory['action']) => {
    const descriptions = {
      created: 'Proposal created',
      edited: 'Proposal updated',
      sent: 'Proposal sent to client',
      response_received: 'Client response received',
      hired: 'Proposal accepted - hired!',
      rejected: 'Proposal rejected',
      archived: 'Proposal archived',
    }
    return descriptions[action] || action.replace('_', ' ')
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) {
      return `${minutes} minutes ago`
    } else if (hours < 24) {
      return `${hours} hours ago`
    } else if (days < 30) {
      return `${days} days ago`
    } else {
      return timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const hasChanges = (historyItem: ProposalHistory) => {
    return historyItem.oldValues || historyItem.newValues
  }

  const getChangedFields = (historyItem: ProposalHistory) => {
    if (!historyItem.oldValues || !historyItem.newValues) return []

    const oldValues = historyItem.oldValues
    const newValues = historyItem.newValues
    const changedFields: {
      field: string
      oldValue: unknown
      newValue: unknown
    }[] = []

    Object.keys(newValues).forEach(key => {
      if (
        oldValues[key] !== newValues[key] &&
        key !== 'updatedAt' &&
        key !== 'version'
      ) {
        changedFields.push({
          field: key,
          oldValue: oldValues[key],
          newValue: newValues[key],
        })
      }
    })

    return changedFields
  }

  if (history.length === 0) {
    return (
      <BrutalistCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-mono text-lg font-bold text-white">
            <Clock size={18} />
            History
          </h2>
          <BrutalistButton onClick={onClose} variant="secondary" size="sm">
            <X size={16} />
          </BrutalistButton>
        </div>
        <div className="py-8 text-center text-gray-400">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <div>No history available for this proposal</div>
        </div>
      </BrutalistCard>
    )
  }

  return (
    <BrutalistCard className="max-h-[600px] overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <Clock size={18} />
          History ({history.length} entries)
        </h2>
        <BrutalistButton onClick={onClose} variant="secondary" size="sm">
          <X size={16} />
        </BrutalistButton>
      </div>

      <div className="space-y-4">
        {history.map((item, index) => (
          <div
            key={item.id}
            className={`relative border-l-4 ${getActionColor(item.action)} pb-6 pl-6 ${
              index === history.length - 1 ? '' : 'border-b border-gray-800'
            }`}
          >
            {/* Timeline dot */}
            <div className="absolute -left-2 top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-700 bg-gray-900">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActionIcon(item.action)}
                  <span className="font-mono text-sm font-medium text-white">
                    {formatActionDescription(item.action)}
                  </span>
                  <span className="rounded bg-gray-700 px-2 py-1 font-mono text-xs text-gray-300">
                    v{item.version}
                  </span>
                </div>

                <span className="font-mono text-xs text-gray-400">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              {/* Description */}
              {item.description && (
                <div className="text-sm text-gray-300">{item.description}</div>
              )}

              {/* Changes */}
              {hasChanges(item) && (
                <div className="mt-3">
                  <div className="mb-2 font-mono text-xs text-gray-400">
                    Changes:
                  </div>
                  <div className="space-y-2 rounded border border-gray-700 bg-gray-900 p-3">
                    {getChangedFields(item)
                      .slice(0, 5)
                      .map((change, changeIndex) => (
                        <div key={changeIndex} className="text-xs">
                          <div className="mb-1 font-mono capitalize text-gray-400">
                            {change.field.replace(/([A-Z])/g, ' $1').trim()}:
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {change.oldValue !== undefined && (
                              <div className="flex items-start gap-2">
                                <span className="shrink-0 font-mono text-xs text-red-400">
                                  -
                                </span>
                                <span className="break-all text-xs text-red-400">
                                  {typeof change.oldValue === 'string' &&
                                  change.oldValue.length > 100
                                    ? `${change.oldValue.substring(0, 100)}...`
                                    : String(change.oldValue || 'empty')}
                                </span>
                              </div>
                            )}
                            {change.newValue !== undefined && (
                              <div className="flex items-start gap-2">
                                <span className="shrink-0 font-mono text-xs text-green-400">
                                  +
                                </span>
                                <span className="break-all text-xs text-green-400">
                                  {typeof change.newValue === 'string' &&
                                  change.newValue.length > 100
                                    ? `${change.newValue.substring(0, 100)}...`
                                    : String(change.newValue || 'empty')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {getChangedFields(item).length > 5 && (
                      <div className="font-mono text-xs text-gray-400">
                        ... and {getChangedFields(item).length - 5} more changes
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 rounded border border-gray-700 bg-gray-900/50 p-4">
        <div className="mb-2 font-mono text-xs text-gray-400">Summary</div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400">Total Edits:</span>
            <span className="ml-2 text-white">
              {history.filter(h => h.action === 'edited').length}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Current Version:</span>
            <span className="ml-2 text-white">
              v{Math.max(...history.map(h => h.version))}
            </span>
          </div>
          <div>
            <span className="text-gray-400">First Created:</span>
            <span className="ml-2 text-white">
              {formatTimestamp(
                history[history.length - 1]?.timestamp || new Date()
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Last Updated:</span>
            <span className="ml-2 text-white">
              {formatTimestamp(history[0]?.timestamp || new Date())}
            </span>
          </div>
        </div>
      </div>
    </BrutalistCard>
  )
}
