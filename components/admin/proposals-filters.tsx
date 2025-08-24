'use client'

import { useState, useEffect, useCallback } from 'react'
import { proposalsService } from '@/lib/services/proposals-service'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import type { ProposalFilter } from '@/lib/types/proposal'
import { X, Calendar, Filter } from 'lucide-react'

interface ProposalsFiltersProps {
  filter: ProposalFilter
  onFilterChange: (filter: ProposalFilter) => void
  userUID?: string
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
]

const PROJECT_TYPE_OPTIONS = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'design', label: 'UI/UX Design' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
]

export function ProposalsFilters({
  filter,
  onFilterChange,
  userUID,
}: ProposalsFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({
    from: filter.dateRange?.from?.toISOString().split('T')[0] || '',
    to: filter.dateRange?.to?.toISOString().split('T')[0] || '',
  })

  const loadFilterOptions = useCallback(async () => {
    if (!userUID) return

    try {
      const [tags, categories] = await Promise.all([
        proposalsService.getAllTags(userUID),
        proposalsService.getAllCategories(userUID),
      ])
      setAvailableTags(tags)
      setAvailableCategories(categories)
    } catch (error) {
      // Error loading filter options
    }
  }, [userUID])

  useEffect(() => {
    if (userUID) {
      loadFilterOptions()
    }
  }, [userUID, loadFilterOptions])

  const updateFilter = (updates: Partial<ProposalFilter>) => {
    onFilterChange({ ...filter, ...updates })
  }

  const toggleStatus = (status: string) => {
    const currentStatus = filter.status || []
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status]

    updateFilter({ status: newStatus.length > 0 ? newStatus : undefined })
  }

  const toggleProjectType = (type: string) => {
    const currentTypes = filter.projectType || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]

    updateFilter({ projectType: newTypes.length > 0 ? newTypes : undefined })
  }

  const toggleTag = (tag: string) => {
    const currentTags = filter.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]

    updateFilter({ tags: newTags.length > 0 ? newTags : undefined })
  }

  const handleDateRangeChange = () => {
    if (dateRange.from && dateRange.to) {
      updateFilter({
        dateRange: {
          from: new Date(dateRange.from),
          to: new Date(dateRange.to),
        },
      })
    } else {
      updateFilter({ dateRange: undefined })
    }
  }

  const clearAllFilters = () => {
    onFilterChange({})
    setDateRange({ from: '', to: '' })
  }

  const activeFilterCount = [
    filter.status?.length || 0,
    filter.projectType?.length || 0,
    filter.category ? 1 : 0,
    filter.tags?.length || 0,
    filter.dateRange ? 1 : 0,
    filter.responseReceived !== undefined ? 1 : 0,
    filter.hired !== undefined ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <BrutalistButton
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded bg-accent-green px-2 py-1 font-mono text-xs text-black">
              {activeFilterCount}
            </span>
          )}
        </BrutalistButton>

        {activeFilterCount > 0 && (
          <BrutalistButton
            onClick={clearAllFilters}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <X size={14} />
            Clear All
          </BrutalistButton>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-6 border border-gray-700 bg-gray-900/50 p-4">
          {/* Status Filter */}
          <div>
            <h4 className="mb-2 font-mono text-sm text-gray-300">Status</h4>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(option => (
                <BrutalistButton
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  variant={
                    filter.status?.includes(option.value)
                      ? 'default'
                      : 'secondary'
                  }
                  size="sm"
                  className="text-xs"
                >
                  {option.label}
                </BrutalistButton>
              ))}
            </div>
          </div>

          {/* Project Type Filter */}
          <div>
            <h4 className="mb-2 font-mono text-sm text-gray-300">
              Project Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPE_OPTIONS.map(option => (
                <BrutalistButton
                  key={option.value}
                  onClick={() => toggleProjectType(option.value)}
                  variant={
                    filter.projectType?.includes(option.value)
                      ? 'default'
                      : 'secondary'
                  }
                  size="sm"
                  className="text-xs"
                >
                  {option.label}
                </BrutalistButton>
              ))}
            </div>
          </div>

          {/* Response & Hire Filters */}
          <div>
            <h4 className="mb-2 font-mono text-sm text-gray-300">
              Response & Hire Status
            </h4>
            <div className="flex flex-wrap gap-2">
              <BrutalistButton
                onClick={() =>
                  updateFilter({
                    responseReceived:
                      filter.responseReceived === true ? undefined : true,
                  })
                }
                variant={
                  filter.responseReceived === true ? 'default' : 'secondary'
                }
                size="sm"
                className="text-xs"
              >
                Response Received
              </BrutalistButton>
              <BrutalistButton
                onClick={() =>
                  updateFilter({
                    responseReceived:
                      filter.responseReceived === false ? undefined : false,
                  })
                }
                variant={
                  filter.responseReceived === false ? 'default' : 'secondary'
                }
                size="sm"
                className="text-xs"
              >
                No Response
              </BrutalistButton>
              <BrutalistButton
                onClick={() =>
                  updateFilter({
                    hired: filter.hired === true ? undefined : true,
                  })
                }
                variant={filter.hired === true ? 'default' : 'secondary'}
                size="sm"
                className="text-xs"
              >
                Hired
              </BrutalistButton>
            </div>
          </div>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div>
              <h4 className="mb-2 font-mono text-sm text-gray-300">Category</h4>
              <select
                value={filter.category || ''}
                onChange={e =>
                  updateFilter({ category: e.target.value || undefined })
                }
                className="border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <h4 className="mb-2 font-mono text-sm text-gray-300">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <BrutalistButton
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    variant={
                      filter.tags?.includes(tag) ? 'default' : 'secondary'
                    }
                    size="sm"
                    className="text-xs"
                  >
                    #{tag}
                  </BrutalistButton>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 font-mono text-sm text-gray-300">
              <Calendar size={14} />
              Date Range
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={dateRange.from}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, from: e.target.value }))
                }
                className="border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, to: e.target.value }))
                }
                className="border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
              />
              <BrutalistButton
                onClick={handleDateRangeChange}
                variant="secondary"
                size="sm"
                disabled={!dateRange.from || !dateRange.to}
              >
                Apply
              </BrutalistButton>
            </div>
          </div>

          {/* Client Name Filter */}
          <div>
            <h4 className="mb-2 font-mono text-sm text-gray-300">
              Client Name
            </h4>
            <input
              type="text"
              placeholder="Filter by client name..."
              value={filter.clientName || ''}
              onChange={e =>
                updateFilter({ clientName: e.target.value || undefined })
              }
              className="w-full border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white focus:border-accent-green focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}
