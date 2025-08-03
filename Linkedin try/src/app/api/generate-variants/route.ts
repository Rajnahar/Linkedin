import { NextRequest, NextResponse } from 'next/server'
import { contentGenerator } from '@/lib/content-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, niche, postType, tone } = body

    if (!content || !niche || !postType || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const variants = await contentGenerator.generateABVariants(
      { fullContent: content },
      niche,
      postType,
      tone
    )
    
    return NextResponse.json(variants)
  } catch (error) {
    console.error('Error generating variants:', error)
    return NextResponse.json(
      { error: 'Failed to generate variants' },
      { status: 500 }
    )
  }
}