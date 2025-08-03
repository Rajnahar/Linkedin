import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export class ContentGenerator {
  private zai: ZAI | null = null

  async initialize() {
    this.zai = await ZAI.create()
  }

  async generateContent(niche: string, postType: string, tone: string, context?: string) {
    if (!this.zai) await this.initialize()

    const template = await this.getBestTemplate(niche, postType, tone)
    const trendingHashtags = await this.getTrendingHashtags(niche)
    
    const hook = await this.generateHook(template, context)
    const story = await this.generateStory(template, context)
    const insight = await this.generateInsight(template, context)
    const cta = await this.generateCTA(template, context)
    
    const fullContent = this.assembleContent(hook, story, insight, cta, trendingHashtags)
    const predictedEngagement = await this.predictEngagement(fullContent, niche, postType)
    
    return {
      hook, story, insight, cta, fullContent, predictedEngagement, hashtags: trendingHashtags
    }
  }

  async generateABVariants(baseContent: any, niche: string, postType: string, tone: string) {
    const variants = []
    
    // Variant 1: Different hook
    const variant1 = { ...baseContent }
    variant1.hook = await this.generateAlternativeHook(baseContent.hook, tone)
    variant1.fullContent = this.assembleContent(
      variant1.hook, variant1.story, variant1.insight, variant1.cta, variant1.hashtags
    )
    
    // Variant 2: Different CTA
    const variant2 = { ...baseContent }
    variant2.cta = await this.generateAlternativeCTA(baseContent.cta, tone)
    variant2.fullContent = this.assembleContent(
      variant2.hook, variant2.story, variant2.insight, variant2.cta, variant2.hashtags
    )
    
    // Variant 3: Restructured insight
    const variant3 = { ...baseContent }
    variant3.insight = await this.generateAlternativeInsight(baseContent.insight, tone)
    variant3.fullContent = this.assembleContent(
      variant3.hook, variant3.story, variant3.insight, variant3.cta, variant3.hashtags
    )
    
    variants.push(variant1, variant2, variant3)
    
    // Score all variants
    for (const variant of variants) {
      variant.predictedEngagement = await this.predictEngagement(variant.fullContent, niche, postType)
    }
    
    // Sort by predicted engagement
    return variants.sort((a, b) => b.predictedEngagement - a.predictedEngagement)
  }

  private async getBestTemplate(niche: string, postType: string, tone: string) {
    const template = await db.contentTemplate.findFirst({
      where: { niche, postType, tone },
      orderBy: { performance: 'desc' }
    })

    if (template) return template
    return this.getDefaultTemplate(niche, postType, tone)
  }

  private async getTrendingHashtags(niche: string) {
    const hashtagAnalysis = await db.hashtagAnalysis.findMany({
      where: { nicheId: niche },
      orderBy: [{ avgLikes: 'desc' }, { connectivity: 'desc' }],
      take: 5
    })
    return hashtagAnalysis.map(ha => ha.hashtag)
  }

  private async generateHook(template: any, context?: string) {
    const hooks = JSON.parse(template.hooks || '[]')
    const hookTemplates = hooks.length > 0 ? hooks : [
      "What if I told you that {topic}?",
      "Here's something most people get wrong about {topic}:",
      "I've discovered a surprising truth about {topic}:"
    ]

    const selectedTemplate = hookTemplates[Math.floor(Math.random() * hookTemplates.length)]
    
    try {
      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert LinkedIn content writer. Generate a compelling hook for a ${template.postType} post with a ${template.tone} tone.`
          },
          {
            role: 'user',
            content: `Generate a hook based on this template: "${selectedTemplate}". ${context ? `Context: ${context}` : ''} Make it engaging and attention-grabbing.`
          }
        ],
        temperature: 0.8,
        max_tokens: 100
      })

      return completion.choices[0]?.message?.content?.trim() || selectedTemplate
    } catch (error) {
      return selectedTemplate
    }
  }

  private async generateStory(template: any, context?: string) {
    const storyPrompts = JSON.parse(template.storyPrompts || '[]')
    const prompts = storyPrompts.length > 0 ? storyPrompts : [
      "Share a personal experience related to {topic}",
      "Tell a story about a challenge you faced",
      "Describe a situation that taught you something valuable"
    ]

    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)]
    
    try {
      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert LinkedIn content writer. Generate a short, relatable story (2-3 sentences) for a ${template.postType} post with a ${template.tone} tone.`
          },
          {
            role: 'user',
            content: `Generate a story based on this prompt: "${selectedPrompt}". ${context ? `Context: ${context}` : ''} Make it authentic and engaging.`
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      })

      return completion.choices[0]?.message?.content?.trim() || "Share your experience and what you learned from it."
    } catch (error) {
      return "Share your experience and what you learned from it."
    }
  }

  private async generateInsight(template: any, context?: string) {
    const insightFormats = JSON.parse(template.insightFormats || '[]')
    const formats = insightFormats.length > 0 ? insightFormats : [
      "The key insight is: {insight}",
      "Here's what I learned: {insight}",
      "The most important takeaway: {insight}"
    ]

    const selectedFormat = formats[Math.floor(Math.random() * formats.length)]
    
    try {
      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert LinkedIn content writer. Generate a valuable insight for a ${template.postType} post with a ${template.tone} tone.`
          },
          {
            role: 'user',
            content: `Generate an insight based on this format: "${selectedFormat}". ${context ? `Context: ${context}` : ''} Make it actionable and valuable.`
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      })

      return completion.choices[0]?.message?.content?.trim() || "Share your key insights and learnings."
    } catch (error) {
      return "Share your key insights and learnings."
    }
  }

  private async generateCTA(template: any, context?: string) {
    const ctaTemplates = JSON.parse(template.ctaTemplates || '[]')
    const templates = ctaTemplates.length > 0 ? ctaTemplates : [
      "What are your thoughts on this?",
      "Share your experience in the comments below!",
      "Have you faced similar challenges? Let me know!"
    ]

    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)]
    
    try {
      const completion = await this.zai!.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert LinkedIn content writer. Generate an engaging call-to-action for a ${template.postType} post with a ${template.tone} tone.`
          },
          {
            role: 'user',
            content: `Generate a CTA based on this template: "${selectedTemplate}". ${context ? `Context: ${context}` : ''} Make it encourage engagement.`
          }
        ],
        temperature: 0.8,
        max_tokens: 100
      })

      return completion.choices[0]?.message?.content?.trim() || selectedTemplate
    } catch (error) {
      return selectedTemplate
    }
  }

  private assembleContent(hook: string, story: string, insight: string, cta: string, hashtags: string[]) {
    return `${hook}

${story}

${insight}

${cta}

${hashtags.map(tag => `#${tag}`).join(' ')}`.trim()
  }

  private async predictEngagement(content: string, niche: string, postType: string) {
    const features = {
      length: content.length,
      hasQuestion: content.includes('?'),
      hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu.test(content),
      hashtagCount: (content.match(/#\w+/g) || []).length,
      lineCount: content.split('\n').length
    }

    let score = 0.5
    
    if (features.length > 500 && features.length < 1500) score += 0.2
    else if (features.length > 300 && features.length < 2000) score += 0.1
    
    if (features.hasQuestion) score += 0.1
    if (features.hasEmojis) score += 0.05
    
    if (features.hashtagCount >= 3 && features.hashtagCount <= 5) score += 0.15
    else if (features.hashtagCount > 0 && features.hashtagCount <= 7) score += 0.1
    
    if (features.lineCount > 5 && features.lineCount < 15) score += 0.1
    
    return Math.min(score, 1.0)
  }

  private getDefaultTemplate(niche: string, postType: string, tone: string) {
    return {
      hooks: JSON.stringify([
        "What if I told you that {topic}?",
        "Here's something most people get wrong about {topic}:",
        "I've discovered a surprising truth about {topic}:"
      ]),
      storyPrompts: JSON.stringify([
        "Share a personal experience related to {topic}",
        "Tell a story about a challenge you faced",
        "Describe a situation that taught you something valuable"
      ]),
      insightFormats: JSON.stringify([
        "The key insight is: {insight}",
        "Here's what I learned: {insight}",
        "The most important takeaway: {insight}"
      ]),
      ctaTemplates: JSON.stringify([
        "What are your thoughts on this?",
        "Share your experience in the comments below!",
        "Have you faced similar challenges? Let me know!"
      ]),
      performance: 0.5
    }
  }
}

export const contentGenerator = new ContentGenerator()