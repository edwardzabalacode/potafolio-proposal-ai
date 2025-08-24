import { NextRequest, NextResponse } from 'next/server'
import { generateProposal } from '@/lib/services/openai-service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate required fields
    if (!formData.projectTitle || !formData.requirements) {
      return NextResponse.json(
        { error: 'Project title and requirements are required' },
        { status: 400 }
      )
    }

    // Generate proposal using OpenAI
    const proposal = await generateProposal(formData)

    return NextResponse.json({ proposal })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating proposal:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate proposal'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
