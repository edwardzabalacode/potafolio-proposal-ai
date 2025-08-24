'use client'

import { BlogFilter, blogCategories, blogStatuses } from '@/lib/types/blog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface BlogFiltersProps {
  filter: BlogFilter
  onFilterChange: (filter: BlogFilter) => void
}

export function BlogFilters({ filter, onFilterChange }: BlogFiltersProps) {
  const updateFilter = (
    key: keyof BlogFilter,
    value: string | boolean | undefined
  ) => {
    onFilterChange({ ...filter, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({})
  }

  const hasActiveFilters = Object.keys(filter).some(
    key =>
      filter[key as keyof BlogFilter] !== undefined &&
      filter[key as keyof BlogFilter] !== ''
  )

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-primary text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-bg-primary"
            >
              <X size={16} />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-primary block text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={filter.search || ''}
                onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search posts..."
                className="border-accent-green/20 text-primary w-full rounded-lg border-2 bg-bg-secondary py-2 pl-10 pr-4 placeholder-text-muted transition-colors focus:border-accent-green focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-primary block text-sm font-medium">
              Category
            </label>
            <select
              value={filter.category || ''}
              onChange={e =>
                updateFilter('category', e.target.value || undefined)
              }
              className="border-accent-green/20 text-primary w-full rounded-lg border-2 bg-bg-secondary px-4 py-2 transition-colors focus:border-accent-green focus:outline-none focus:ring-0"
            >
              <option value="">All Categories</option>
              {blogCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-primary block text-sm font-medium">
              Status
            </label>
            <select
              value={filter.status || ''}
              onChange={e =>
                updateFilter('status', e.target.value || undefined)
              }
              className="border-accent-green/20 text-primary w-full rounded-lg border-2 bg-bg-secondary px-4 py-2 transition-colors focus:border-accent-green focus:outline-none focus:ring-0"
            >
              <option value="">All Statuses</option>
              {blogStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Featured */}
          <div className="space-y-2">
            <label className="text-primary block text-sm font-medium">
              Featured
            </label>
            <select
              value={
                filter.featured === undefined ? '' : filter.featured.toString()
              }
              onChange={e => {
                const value = e.target.value
                updateFilter(
                  'featured',
                  value === '' ? undefined : value === 'true'
                )
              }}
              className="border-accent-green/20 text-primary w-full rounded-lg border-2 bg-bg-secondary px-4 py-2 transition-colors focus:border-accent-green focus:outline-none focus:ring-0"
            >
              <option value="">All Posts</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  )
}
