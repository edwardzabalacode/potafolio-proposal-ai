'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { proposalsService } from '@/lib/services/proposals-service'
import { BrutalistCard } from '@/components/ui/brutalist-card'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import { ProposalsFilters } from './proposals-filters'
import { ProposalsList } from './proposals-list'
import { ProposalEditor } from './proposal-editor'
import { ProposalStats } from './proposal-stats'
import type {
  SavedProposal,
  ProposalFilter,
  ProposalStats as Stats,
} from '@/lib/types/proposal'
import { Plus, BarChart3, FileDown, Search } from 'lucide-react'

interface ProposalsLibraryProps {
  onCreateNew?: () => void
}

export function ProposalsLibrary({ onCreateNew }: ProposalsLibraryProps) {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<SavedProposal[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ProposalFilter>({})
  const [selectedProposal, setSelectedProposal] =
    useState<SavedProposal | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showStats, setShowStats] = useState(false)

  const loadProposals = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const proposalsData = await proposalsService.getProposals(user.uid, {
        ...filter,
        searchTerm: searchTerm || undefined,
      })
      setProposals(proposalsData)
    } catch (error) {
      // Error loading proposals
    } finally {
      setLoading(false)
    }
  }, [user, filter, searchTerm])

  const loadStats = useCallback(async () => {
    if (!user) return

    try {
      const statsData = await proposalsService.getProposalStats(user.uid)
      setStats(statsData)
    } catch (error) {
      // Error loading stats
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadProposals()
      loadStats()
    }
  }, [user, filter, loadProposals, loadStats])

  const handleSearch = () => {
    setFilter(prev => ({ ...prev, searchTerm }))
  }

  const handleFilterChange = (newFilter: ProposalFilter) => {
    setFilter(newFilter)
  }

  const handleEditProposal = (proposal: SavedProposal) => {
    setSelectedProposal(proposal)
    setIsEditing(true)
  }

  const handleDuplicateProposal = async (proposalId: string) => {
    if (!user) return

    try {
      const duplicated = await proposalsService.duplicateProposal(
        user.uid,
        proposalId
      )
      setProposals(prev => [duplicated, ...prev])

      // Edit the duplicated proposal immediately
      setSelectedProposal(duplicated)
      setIsEditing(true)
    } catch (error) {
      // Error duplicating proposal
    }
  }

  const handleDeleteProposal = async (proposalId: string) => {
    if (!user) return

    try {
      await proposalsService.deleteProposal(user.uid, proposalId)
      setProposals(prev => prev.filter(p => p.id !== proposalId))
      loadStats() // Reload stats after deletion
    } catch (error) {
      // Error deleting proposal
    }
  }

  const handleUpdateProposal = async (
    proposalId: string,
    updates: Partial<SavedProposal>
  ) => {
    if (!user) return

    try {
      const updated = await proposalsService.updateProposal(
        user.uid,
        proposalId,
        updates
      )
      setProposals(prev => prev.map(p => (p.id === proposalId ? updated : p)))
      loadStats() // Reload stats after update
    } catch (error) {
      // Error updating proposal
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    if (!user) return

    try {
      const exportData = await proposalsService.exportProposals(
        user.uid,
        format
      )

      // Create download link
      const blob = new Blob([exportData], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `proposals-${new Date().toISOString().split('T')[0]}.${format}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      // Error exporting proposals
    }
  }

  const handleProposalSaved = (_saved: SavedProposal) => {
    setIsEditing(false)
    setSelectedProposal(null)
    loadProposals()
    loadStats()
  }

  if (loading && proposals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading proposals...</div>
      </div>
    )
  }

  if (isEditing && selectedProposal) {
    return (
      <ProposalEditor
        proposal={selectedProposal}
        onSave={handleProposalSaved}
        onCancel={() => {
          setIsEditing(false)
          setSelectedProposal(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-white">
              Proposals Library
            </h1>
            <p className="mt-2 text-gray-400">
              Manage and track all your generated proposals
            </p>
          </div>

          <div className="flex gap-3">
            <BrutalistButton
              onClick={() => setShowStats(!showStats)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <BarChart3 size={16} />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </BrutalistButton>

            <div className="flex items-center border border-gray-700 bg-gray-900">
              <BrutalistButton
                onClick={() => handleExport('json')}
                variant="secondary"
                size="sm"
                className="border-0 border-r border-gray-700"
              >
                <FileDown size={14} />
                JSON
              </BrutalistButton>
              <BrutalistButton
                onClick={() => handleExport('csv')}
                variant="secondary"
                size="sm"
                className="border-0"
              >
                <FileDown size={14} />
                CSV
              </BrutalistButton>
            </div>

            {onCreateNew && (
              <BrutalistButton
                onClick={onCreateNew}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                New Proposal
              </BrutalistButton>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {showStats && stats && <ProposalStats stats={stats} />}

      {/* Search and Filters */}
      <BrutalistCard className="p-6">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-1">
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
              />
              <BrutalistButton
                onClick={handleSearch}
                className="rounded-none border-l-0 px-4"
              >
                <Search size={16} />
              </BrutalistButton>
            </div>
          </div>

          <ProposalsFilters
            filter={filter}
            onFilterChange={handleFilterChange}
            userUID={user?.uid}
          />
        </div>
      </BrutalistCard>

      {/* Proposals List */}
      <ProposalsList
        proposals={proposals}
        loading={loading}
        onEdit={handleEditProposal}
        onDuplicate={handleDuplicateProposal}
        onDelete={handleDeleteProposal}
        onUpdateStatus={handleUpdateProposal}
      />
    </div>
  )
}
