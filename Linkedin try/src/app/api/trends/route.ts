import { NextRequest, NextResponse } from 'next/server'
import { analyticsEngine } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nicheId = searchParams.get('nicheId') || 'technology' // Default to technology

    const trends = await analyticsEngine.detectTrends(nicheId)
    
    return NextResponse.json(trends)
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    )
  }
}