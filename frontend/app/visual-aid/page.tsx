"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Download, Loader2, ImageIcon, AlertCircle, Heart, Sparkles, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"

import { generateImagePrompt } from "@/lib/gemini"
import { visualAidAPI } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VisualAidGenerationLoader } from "@/components/loading-states"
import { auth } from "@/lib/firebase";


export default function VisualAidPage() {
  const [topic, setTopic] = useState("")
  const [generatedImageUrl, setGeneratedImageUrl] = useState("")
  const [generatedDescription, setGeneratedDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Check if API key is available
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const generateImage = async (prompt: string): Promise<string> => {
    // Mock image generation - in production, integrate with actual image generation API
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return a placeholder image URL with the prompt encoded using 'query' parameter
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 100))
    return `/placeholder.svg?height=400&width=600&query=${encodedPrompt}`
  }

  const handleGenerateVisualAid = async () => {
    if (!topic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Enter a topic to generate a visual aid.",
        variant: "destructive",
      })
      return
    }

    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key to use AI generation.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError("")
    setGeneratedImageUrl("")
    setGeneratedDescription("")

    try {
      // Generate image prompt using Gemini
      const imagePrompt = await generateImagePrompt(topic);
      setGeneratedDescription(imagePrompt);

      // Generate actual image (mock implementation)
      const imageUrl = await generateImage(imagePrompt);
      setGeneratedImageUrl(imageUrl);

      toast({
        title: "Visual aid generated successfully!",
        description: "Your educational diagram has been created.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate visual aid"
      setError(errorMessage)
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(generatedDescription)
    toast({
      title: "Copied to clipboard",
      description: "The description has been copied to your clipboard.",
    })
  }

  const handleSaveVisualAid = async () => {
    if (!generatedImageUrl || !generatedDescription) return

    setIsSaving(true)
    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : "";
      await visualAidAPI.create({
        title: `Visual Aid: ${topic}`,
        aidData: {
          description: generatedDescription,
          topic: topic,
          imageUrl: generatedImageUrl,
          visualType: "diagram",
        },
        userId,
      })

      toast({
        title: "Visual aid saved!",
        description: "The visual aid has been saved to your library.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save visual aid. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadImage = () => {
    if (!generatedImageUrl) return

    const link = document.createElement("a")
    link.href = generatedImageUrl
    link.download = `visual-aid-${topic.replace(/\s+/g, "-").toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "The image is being downloaded.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Navigation user={auth.currentUser ? {
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        avatar: auth.currentUser.photoURL || undefined
      } : undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Key Status */}
        {hasApiKey ? (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>AI Ready:</strong> Gemini API is configured and ready to generate visual aids!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>API Key Missing:</strong> Please add your Gemini API key to the .env.local file to enable AI
              generation.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                Create Visual Aid
              </CardTitle>
              <CardDescription>Generate educational diagrams, charts, and visual aids for any topic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Enter Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Solar system, Water cycle, Human digestive system"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-base"
                />
              </div>

              <Button onClick={handleGenerateVisualAid} disabled={isLoading || !hasApiKey} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Visual Aid...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Visual Aid
                  </>
                )}
              </Button>

              {/* Generated Description */}
              {generatedDescription && !isLoading && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">AI-Generated Description</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{generatedDescription}</p>
                    <Button onClick={handleCopyDescription} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Description
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Generated Visual Aid</CardTitle>
              <CardDescription>Your AI-generated visual aid will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <VisualAidGenerationLoader />
              ) : generatedImageUrl ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <img
                      src={generatedImageUrl || "/placeholder.svg"}
                      alt={`Visual aid for ${topic}`}
                      className="w-full h-auto rounded-lg border"
                      onError={(e) => {
                        console.error("Image failed to load:", generatedImageUrl)
                        e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleDownloadImage} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </Button>
                    <Button onClick={handleSaveVisualAid} variant="outline" size="sm" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          Save to My Library
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Your generated visual aid will appear here</p>
                  <p className="text-sm">Enter a topic above and click "Generate Visual Aid" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Topics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Example Topics</CardTitle>
            <CardDescription>Click on any example to use it as your topic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors border border-purple-200 hover:border-purple-300"
                onClick={() => setTopic("Solar system with planets and their orbits")}
              >
                <p className="text-sm font-medium text-purple-800 mb-1">Solar System</p>
                <p className="text-xs text-purple-600">Planets and their orbits</p>
              </div>
              <div
                className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 hover:border-blue-300"
                onClick={() => setTopic("Water cycle with evaporation, condensation, and precipitation")}
              >
                <p className="text-sm font-medium text-blue-800 mb-1">Water Cycle</p>
                <p className="text-xs text-blue-600">Complete water cycle process</p>
              </div>
              <div
                className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors border border-green-200 hover:border-green-300"
                onClick={() => setTopic("Human digestive system with labeled organs")}
              >
                <p className="text-sm font-medium text-green-800 mb-1">Digestive System</p>
                <p className="text-xs text-green-600">Human digestive organs</p>
              </div>
              <div
                className="p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors border border-orange-200 hover:border-orange-300"
                onClick={() => setTopic("Plant cell structure with organelles")}
              >
                <p className="text-sm font-medium text-orange-800 mb-1">Plant Cell</p>
                <p className="text-xs text-orange-600">Cell structure and organelles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
