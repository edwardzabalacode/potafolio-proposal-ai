'use client'

import { useState } from 'react'
import { ProposalGenerator } from '@/components/admin/proposal-generator'
import { ProposalsLibrary } from '@/components/admin/proposals-library'
import { BrutalistButton } from '@/components/ui/brutalist-button'
import { Library, Zap } from 'lucide-react'

export default function ProposalsPage() {
  const [currentView, setCurrentView] = useState<'generator' | 'library'>(
    'library'
  )

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-white">
              Proposals Management
            </h1>
            <p className="mt-2 text-gray-400">
              Generate AI-powered proposals and manage your proposal library
            </p>
          </div>

          <div className="flex items-center border border-gray-700 bg-gray-900">
            <BrutalistButton
              onClick={() => setCurrentView('library')}
              variant={currentView === 'library' ? 'default' : 'secondary'}
              className="flex items-center gap-2 rounded-none border-0 border-r border-gray-700"
            >
              <Library size={16} />
              Library
            </BrutalistButton>
            <BrutalistButton
              onClick={() => setCurrentView('generator')}
              variant={currentView === 'generator' ? 'default' : 'secondary'}
              className="flex items-center gap-2 rounded-none border-0"
            >
              <Zap size={16} />
              Generator
            </BrutalistButton>
          </div>
        </div>
      </div>

      {currentView === 'library' && (
        <ProposalsLibrary onCreateNew={() => setCurrentView('generator')} />
      )}

      {currentView === 'generator' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BrutalistButton
              onClick={() => setCurrentView('library')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Library size={16} />
              Back to Library
            </BrutalistButton>
          </div>
          <ProposalGenerator />
        </div>
      )}
    </div>
  )
}
