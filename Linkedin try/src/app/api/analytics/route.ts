import { NextRequest, NextResponse } from 'next/server'
import { analyticsEngine } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nicheId = searchParams.get('nicheId') || 'technology' // Default to technology

    const analytics = await analyticsEngine.analyzeNicheContent(nicheId)
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}