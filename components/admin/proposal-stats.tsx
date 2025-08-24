'use client'

import { BrutalistCard } from '@/components/ui/brutalist-card'
import type { ProposalStats } from '@/lib/types/proposal'
import {
  FileText,
  Send,
  MessageCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react'

interface ProposalStatsProps {
  stats: ProposalStats
}

export function ProposalStats({ stats }: ProposalStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BrutalistCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-gray-700 p-2">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-white">
                {stats.total}
              </div>
              <div className="text-sm text-gray-400">Total Proposals</div>
            </div>
          </div>
        </BrutalistCard>

        <BrutalistCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-blue-600 p-2">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-white">
                {formatPercentage(stats.responseRate)}
              </div>
              <div className="text-sm text-gray-400">Response Rate</div>
            </div>
          </div>
        </BrutalistCard>

        <BrutalistCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-green-600 p-2">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-white">
                {formatPercentage(stats.hireRate)}
              </div>
              <div className="text-sm text-gray-400">Hire Rate</div>
            </div>
          </div>
        </BrutalistCard>

        <BrutalistCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-accent-green p-2">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-white">
                {formatCurrency(stats.totalValue)}
              </div>
              <div className="text-sm text-gray-400">Total Value</div>
            </div>
          </div>
        </BrutalistCard>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BrutalistCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-purple-600 p-2">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <div className="font-mono text-xl font-bold text-white">
                {formatCurrency(stats.averageProjectValue)}
              </div>
              <div className="text-sm text-gray-400">Avg Project Value</div>
            </div>
          </div>
        </BrutalistCard>

        <BrutalistCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-orange-600 p-2">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <div className="font-mono text-xl font-bold text-white">
                {stats.recentActivity.hired}
              </div>
              <div className="text-sm text-gray-400">Hired (30 days)</div>
            </div>
          </div>
        </BrutalistCard>

        <BrutalistCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-indigo-600 p-2">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <div className="font-mono text-xl font-bold text-white">
                {stats.recentActivity.sent}
              </div>
              <div className="text-sm text-gray-400">Sent (30 days)</div>
            </div>
          </div>
        </BrutalistCard>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <BrutalistCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold text-white">
            <Send size={18} />
            Status Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded ${getStatusColor(status)}`}
                  />
                  <span className="font-mono text-sm capitalize text-gray-300">
                    {status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white">{count}</span>
                  <span className="min-w-[40px] text-right text-sm text-gray-400">
                    {stats.total > 0
                      ? Math.round((count / stats.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </BrutalistCard>

        {/* Project Type Breakdown */}
        <BrutalistCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold text-white">
            <FileText size={18} />
            Project Type Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byProjectType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded ${getProjectTypeColor(type)}`}
                  />
                  <span className="font-mono text-sm text-gray-300">
                    {formatProjectType(type)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white">{count}</span>
                  <span className="min-w-[40px] text-right text-sm text-gray-400">
                    {stats.total > 0
                      ? Math.round((count / stats.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </BrutalistCard>
      </div>

      {/* Performance Summary */}
      {stats.total > 0 && (
        <BrutalistCard className="p-6">
          <h3 className="mb-4 font-mono text-lg font-bold text-white">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-1 text-gray-400">Total Sent</div>
              <div className="font-mono text-lg text-white">
                {Object.entries(stats.byStatus).reduce(
                  (sent, [status, count]) =>
                    status !== 'draft' ? sent + count : sent,
                  0
                )}
              </div>
            </div>
            <div>
              <div className="mb-1 text-gray-400">Responses Received</div>
              <div className="font-mono text-lg text-white">
                {(stats.byStatus.accepted || 0) +
                  (stats.byStatus.rejected || 0)}
              </div>
            </div>
            <div>
              <div className="mb-1 text-gray-400">Success Rate</div>
              <div className="font-mono text-lg text-white">
                {formatPercentage(stats.hireRate)}
              </div>
            </div>
            <div>
              <div className="mb-1 text-gray-400">Recent Activity</div>
              <div className="font-mono text-lg text-white">
                {stats.recentActivity.sent +
                  stats.recentActivity.responses +
                  stats.recentActivity.hired}
              </div>
            </div>
          </div>
        </BrutalistCard>
      )}
    </div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-500',
    sent: 'bg-blue-500',
    accepted: 'bg-green-500',
    rejected: 'bg-red-500',
    archived: 'bg-gray-400',
  }
  return colors[status] || 'bg-gray-500'
}

function getProjectTypeColor(type: string) {
  const colors: Record<string, string> = {
    'web-development': 'bg-blue-500',
    'mobile-app': 'bg-green-500',
    design: 'bg-purple-500',
    consulting: 'bg-orange-500',
    other: 'bg-gray-500',
  }
  return colors[type] || 'bg-gray-500'
}

function formatProjectType(type: string) {
  const formats: Record<string, string> = {
    'web-development': 'Web Development',
    'mobile-app': 'Mobile App',
    design: 'UI/UX Design',
    consulting: 'Consulting',
    other: 'Other',
  }
  return formats[type] || type
}
