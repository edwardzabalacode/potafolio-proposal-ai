'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { proposalsService } from '@/lib/services/proposals-service'
import type {
  SavedProposal,
  ProposalFilter,
  ProposalStats,
  ProposalHistory,
} from '@/lib/types/proposal'

export function useProposals(filter?: ProposalFilter) {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<SavedProposal[]>([])
  const [stats, setStats] = useState<ProposalStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProposals = useCallback(
    async (customFilter?: ProposalFilter) => {
      if (!user) {
        setProposals([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await proposalsService.getProposals(
          user.uid,
          customFilter || filter
        )
        setProposals(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load proposals'
        )
        // Error loading proposals
      } finally {
        setLoading(false)
      }
    },
    [user, filter]
  )

  const loadStats = useCallback(async () => {
    if (!user) {
      setStats(null)
      return
    }

    try {
      const statsData = await proposalsService.getProposalStats(user.uid)
      setStats(statsData)
    } catch (err) {
      // Error loading proposal stats
    }
  }, [user])

  const createProposal = async (
    proposalData: Omit<
      SavedProposal,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >
  ) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setError(null)
      const newProposal = await proposalsService.createProposal(
        user.uid,
        proposalData
      )
      setProposals(prev => [newProposal, ...prev])
      loadStats() // Reload stats
      return newProposal
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create proposal'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateProposal = async (
    proposalId: string,
    updates: Partial<SavedProposal>
  ) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setError(null)
      const updated = await proposalsService.updateProposal(
        user.uid,
        proposalId,
        updates
      )
      setProposals(prev => prev.map(p => (p.id === proposalId ? updated : p)))
      loadStats() // Reload stats
      return updated
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update proposal'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteProposal = async (proposalId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setError(null)
      await proposalsService.deleteProposal(user.uid, proposalId)
      setProposals(prev => prev.filter(p => p.id !== proposalId))
      loadStats() // Reload stats
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete proposal'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const duplicateProposal = async (
    proposalId: string,
    updates?: Partial<SavedProposal>
  ) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setError(null)
      const duplicated = await proposalsService.duplicateProposal(
        user.uid,
        proposalId,
        updates
      )
      setProposals(prev => [duplicated, ...prev])
      loadStats() // Reload stats
      return duplicated
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to duplicate proposal'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const markAsSent = async (proposalId: string) => {
    return updateProposal(proposalId, { status: 'sent', sentAt: new Date() })
  }

  const updateStatus = async (
    proposalId: string,
    status: SavedProposal['status'],
    additionalData?: {
      responseDate?: Date
      hired?: boolean
      hireDate?: Date
      projectValue?: string
      notes?: string
    }
  ) => {
    if (!user) throw new Error('User not authenticated')

    try {
      setError(null)
      const updated = await proposalsService.updateProposalStatus(
        user.uid,
        proposalId,
        status,
        additionalData
      )
      setProposals(prev => prev.map(p => (p.id === proposalId ? updated : p)))
      loadStats() // Reload stats
      return updated
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update proposal status'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const exportProposals = async (format: 'json' | 'csv' = 'json') => {
    if (!user) throw new Error('User not authenticated')

    try {
      setError(null)
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to export proposals'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    loadProposals()
    loadStats()
  }, [user, filter, loadProposals, loadStats])

  return {
    proposals,
    stats,
    loading,
    error,
    actions: {
      loadProposals,
      loadStats,
      createProposal,
      updateProposal,
      deleteProposal,
      duplicateProposal,
      markAsSent,
      updateStatus,
      exportProposals,
    },
  }
}

// Hook for individual proposal
export function useProposal(proposalId: string) {
  const { user } = useAuth()
  const [proposal, setProposal] = useState<SavedProposal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProposal = useCallback(async () => {
    if (!user || !proposalId) {
      setProposal(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await proposalsService.getProposal(user.uid, proposalId)
      setProposal(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposal')
      // Error loading proposal
    } finally {
      setLoading(false)
    }
  }, [user, proposalId])

  useEffect(() => {
    loadProposal()
  }, [user, proposalId, loadProposal])

  return {
    proposal,
    loading,
    error,
    reload: loadProposal,
  }
}

// Hook for proposal history
export function useProposalHistory(proposalId: string) {
  const { user } = useAuth()
  const [history, setHistory] = useState<ProposalHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    if (!user || !proposalId) {
      setHistory([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await proposalsService.getProposalHistory(
        user.uid,
        proposalId
      )
      setHistory(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load proposal history'
      )
      // Error loading proposal history
    } finally {
      setLoading(false)
    }
  }, [user, proposalId])

  useEffect(() => {
    loadHistory()
  }, [user, proposalId, loadHistory])

  return {
    history,
    loading,
    error,
    reload: loadHistory,
  }
}
