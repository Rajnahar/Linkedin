"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Sparkles, TrendingUp, BarChart3, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const niches = [
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "leadership", label: "Leadership" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "Human Resources" },
  { value: "design", label: "Design" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" }
];

const postTypes = [
  { value: "story", label: "Personal Story" },
  { value: "tips", label: "Tips & Strategies" },
  { value: "question", label: "Engaging Question" },
  { value: "achievement", label: "Achievement" },
  { value: "trend", label: "Industry Trend" },
  { value: "mistake", label: "Lesson from Mistake" },
  { value: "controversial", label: "Controversial Take" }
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "inspirational", label: "Inspirational" },
  { value: "conversational", label: "Conversational" },
  { value: "authoritative", label: "Authoritative" },
  { value: "vulnerable", label: "Vulnerable & Authentic" }
];

export default function LinkedInViralPostGenerator() {
  const [niche, setNiche] = useState("");
  const [postType, setPostType] = useState("");
  const [tone, setTone] = useState("");
  const [context, setContext] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePost = async () => {
    if (!niche || !postType || !tone) {
      toast.error("Please select niche, post type, and tone");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche,
          postType,
          tone,
          context: context || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate post");
      }

      const data = await response.json();
      setGeneratedPost(data.post);
      toast.success("Post generated successfully!");
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error("Failed to generate post. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LinkedIn Viral Post Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create engaging, viral-worthy LinkedIn content that builds your personal brand and drives engagement
          </p>
        </div>

        <Tabs defaultValue="generator" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Content Settings</CardTitle>
                  <CardDescription>
                    Configure your LinkedIn post parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Niche</label>
                    <Select value={niche} onValueChange={setNiche}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry niche" />
                      </SelectTrigger>
                      <SelectContent>
                        {niches.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Post Type</label>
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose post format" />
                      </SelectTrigger>
                      <SelectContent>
                        {postTypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tone</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Context (Optional)</label>
                    <Textarea
                      placeholder="Add any specific context, topics, or details you want included..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={generatePost} 
                    disabled={isGenerating || !niche || !postType || !tone}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate LinkedIn Post
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Post</CardTitle>
                  <CardDescription>
                    Your viral LinkedIn content ready to post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedPost ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border min-h-[200px] whitespace-pre-wrap">
                        {generatedPost}
                      </div>
                      <Button onClick={copyToClipboard} variant="outline" className="w-full">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                      <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                      <p>Generate your first LinkedIn post</p>
                      <p className="text-sm">Configure settings and click generate</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Track your content performance and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard coming soon</p>
                  <p className="text-sm">Track engagement rates, best posting times, and content performance</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Industry Trends</CardTitle>
                <CardDescription>
                  Stay updated with the latest trends in your niche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Trend analysis coming soon</p>
                  <p className="text-sm">Discover trending topics and hashtags in your industry</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Content Insights</CardTitle>
                <CardDescription>
                  AI-powered insights to improve your content strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Content insights coming soon</p>
                  <p className="text-sm">Get personalized recommendations for your LinkedIn strategy</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center text-gray-600">
          <p className="mb-4">
            <Badge variant="outline" className="mr-2">Powered by AI</Badge>
            <Badge variant="outline" className="mr-2">Next.js 15</Badge>
            <Badge variant="outline">TypeScript</Badge>
          </p>
          <p className="text-sm">
            Build your personal brand with viral LinkedIn content
          </p>
        </div>
      </div>
    </div>
  );
}