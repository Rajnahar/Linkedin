import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface GeneratePostRequest {
  niche: string
  postType: string
  tone: string
  context?: string
}

const nichePrompts = {
  technology: "technology, software development, AI, programming, tech trends",
  marketing: "digital marketing, social media, content marketing, SEO, growth strategies",
  finance: "finance, investing, personal finance, wealth management, market analysis",
  entrepreneurship: "entrepreneurship, startups, business growth, innovation, venture capital",
  leadership: "leadership, management, team building, executive strategies, organizational culture",
  sales: "sales, business development, revenue growth, client relationships, sales strategies",
  hr: "human resources, talent acquisition, company culture, employee engagement, HR strategies",
  design: "design, UX/UI, creative work, visual communication, design thinking",
  healthcare: "healthcare, medical technology, patient care, health innovation, medical industry",
  education: "education, e-learning, teaching, educational technology, learning strategies"
}

const postTypePrompts = {
  story: "personal story, experience, journey, narrative format",
  tips: "tips, strategies, advice, how-to guide, actionable insights",
  question: "engaging question, thought-provoking, discussion starter, audience interaction",
  achievement: "achievement celebration, success story, milestone, accomplishment",
  trend: "industry trend analysis, market insights, future predictions, trend commentary",
  mistake: "lessons from mistakes, failure story, learning experience, growth mindset",
  controversial: "thought-provoking opinion, controversial take, debate starter, unique perspective"
}

const tonePrompts = {
  professional: "professional tone, formal language, business-appropriate, polished",
  inspirational: "inspirational tone, motivational, uplifting, encouraging",
  conversational: "conversational tone, friendly, approachable, casual but professional",
  authoritative: "authoritative tone, expert voice, confident, knowledgeable",
  vulnerable: "vulnerable and authentic tone, honest, transparent, relatable"
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePostRequest = await request.json()
    const { niche, postType, tone, context } = body

    if (!niche || !postType || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields: niche, postType, tone' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const systemPrompt = `You are an expert LinkedIn content creator specializing in viral posts for personal branding. Your task is to create engaging, professional LinkedIn content that drives engagement and builds authority.

Follow these guidelines:
1. Create content that is authentic, valuable, and engaging
2. Use short paragraphs (2-3 sentences maximum)
3. Include strategic line breaks for readability
4. Add relevant emojis for visual appeal (use sparingly, 2-4 max)
5. Include 3-5 relevant hashtags at the end
6. Keep the post under 300 words for optimal engagement
7. Start with a strong hook in the first 1-2 lines
8. End with a call-to-action or question to encourage engagement

Target audience: Professionals in ${nichePrompts[niche as keyof typeof nichePrompts]}
Content type: ${postTypePrompts[postType as keyof typeof postTypePrompts]}
Tone: ${tonePrompts[tone as keyof typeof tonePrompts]}

${context ? `Additional context to include: ${context}` : ''}

Format the response as a ready-to-post LinkedIn content. Do not include any explanations or meta-commentary in your response.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate a viral LinkedIn post for a professional in the ${niche} industry. The post should be a ${postType} with a ${tone} tone. Make it engaging and shareable.`
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    })

    const generatedPost = completion.choices[0]?.message?.content

    if (!generatedPost) {
      throw new Error('Failed to generate post content')
    }

    return NextResponse.json({ post: generatedPost.trim() })

  } catch (error) {
    console.error('Error generating LinkedIn post:', error)
    return NextResponse.json(
      { error: 'Failed to generate LinkedIn post' },
      { status: 500 }
    )
  }
}