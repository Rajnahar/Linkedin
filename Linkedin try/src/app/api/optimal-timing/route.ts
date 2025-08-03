import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const niche = searchParams.get('niche')

    if (!niche) {
      return NextResponse.json(
        { error: 'Missing niche parameter' },
        { status: 400 }
      )
    }

    // Get optimal timing from database
    const optimalTiming = await db.optimalTiming.findFirst({
      where: { niche },
      orderBy: { avgEngagement: 'desc' }
    })

    if (optimalTiming) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return NextResponse.json({
        day: days[optimalTiming.dayOfWeek],
        hour: optimalTiming.hour,
        engagement: optimalTiming.avgEngagement
      })
    }

    // Return default optimal timing if no data found
    return NextResponse.json({
      day: 'Tuesday',
      hour: 10,
      engagement: 2.5
    })
  } catch (error) {
    console.error('Error fetching optimal timing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch optimal timing' },
      { status: 500 }
    )
  }
}