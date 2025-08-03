import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export class AnalyticsEngine {
  private zai: ZAI | null = null

  async initialize() {
    this.zai = await ZAI.create()
  }

  async analyzeNicheContent(nicheId: string) {
    const posts = await db.linkedInPost.findMany({
      where: { nicheId },
      include: { engagement: true },
      orderBy: { postedAt: 'desc' },
      take: 1000
    })

    if (posts.length === 0) {
      return this.getDefaultAnalytics()
    }

    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0)
    const totalShares = posts.reduce((sum, post) => sum + post.shares, 0)
    const totalFollowers = posts.reduce((sum, post) => sum + post.authorFollowers, 0)

    return {
      avgLikes: totalLikes / posts.length,
      avgComments: totalComments / posts.length,
      avgShares: totalShares / posts.length,
      avgEngagementRate: ((totalLikes + totalComments + totalShares) / totalFollowers) * 100,
      totalPosts: posts.length
    }
  }

  async detectTrends(nicheId: string) {
    if (!this.zai) await this.initialize()

    const niche = await db.niche.findUnique({
      where: { id: nicheId },
      select: { keywords: true, name: true }
    })

    if (!niche) return []

    try {
      const keywords = JSON.parse(niche.keywords || '[]') as string[]
      const keywordString = keywords.join(', ')

      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a trend detection expert for LinkedIn content.`
          },
          {
            role: 'user',
            content: `What are the current trending topics in ${niche.name}? Focus on: ${keywordString}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })

      const trendText = completion.choices[0]?.message?.content || ''
      return trendText.split('\n').filter(line => line.trim()).slice(0, 5)
    } catch (error) {
      console.error('Error detecting trends:', error)
      return []
    }
  }

  private getDefaultAnalytics() {
    return {
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      avgEngagementRate: 0,
      totalPosts: 0
    }
  }
}

export const analyticsEngine = new AnalyticsEngine()