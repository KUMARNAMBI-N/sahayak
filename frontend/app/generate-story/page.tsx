"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Copy, Loader2, BookOpen, AlertCircle, Heart, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FontSizeSelector } from "@/components/font-size-selector"

import { generateStory } from "@/lib/gemini"
import { generateStoryAPI } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StoryGenerationLoader } from "@/components/loading-states"
import { auth } from "@/lib/firebase";
import FeedbackForm from "@/components/FeedbackForm"

const languages = [
  { value: "marathi", label: "मराठी (Marathi)", nativeName: "मराठी" },
  { value: "hindi", label: "हिंदी (Hindi)", nativeName: "हिंदी" },
  { value: "tamil", label: "தமிழ் (Tamil)", nativeName: "தமிழ்" },
  { value: "telugu", label: "తెలుగు (Telugu)", nativeName: "తెలుగు" },
  { value: "gujarati", label: "ગુજરાતી (Gujarati)", nativeName: "ગુજરાતી" },
  { value: "bengali", label: "বাংলা (Bengali)", nativeName: "বাংলা" },
  { value: "kannada", label: "ಕನ್ನಡ (Kannada)", nativeName: "ಕನ್ನಡ" },
  { value: "malayalam", label: "മലയാളം (Malayalam)", nativeName: "മലയാളം" },
  { value: "english", label: "English", nativeName: "English" },
  { value: "assam", label: "Assamese (অসমীয়া)", nativeName: "অসমীয়া" },
]

const sampleTexts = {
  marathi: "एक छोटे से गांव में राम नाम का एक किसान रहता था। वह बहुत मेहनती था और अपने खेत में अच्छी फसल उगाता था।",
  hindi: "एक छोटे से गांव में राम नाम का एक किसान रहता था। वह बहुत मेहनती था और अपने खेत में अच्छी फसल उगाता था।",
  tamil: "ஒரு சிறிய கிராமத்தில் ராம் என்ற விவசாயி வாழ்ந்து வந்தான். அவன் மிகவும் உழைப்பாளி மற்றும் தன் வயலில் நல்ல பயிர்களை வளர்த்தான்.",
  telugu: "ఒక చిన్న గ్రామంలో రాము అనే రైతు నివసించేవాడు. అతను చాలా కష్టపడి పని చేసేవాడు మరియు తన పొలంలో మంచి పంటలు పండించేవాడు.",
  gujarati: "એક નાના ગામમાં રામ નામનો એક ખેડૂત રહેતો હતો. તે ખૂબ મહેનતુ હતો અને તેના ખેતરમાં સારો પાક ઉગાડતો હતો.",
  bengali: "একটি ছোট গ্রামে রাম নামে এক কৃষক বাস করত। সে খুব পরিশ্রমী ছিল এবং তার জমিতে ভাল ফসল ফলাত।",
  kannada: "ಒಂದು ಸಣ್ಣ ಹಳ್ಳಿಯಲ್ಲಿ ರಾಮ ಎಂಬ ರೈತ ವಾಸಿಸುತ್ತಿದ್ದ. ಅವನು ತುಂಬಾ ಶ್ರಮಿಷ್ಠ ಮತ್ತು ತನ್ನ ಹೊಲದಲ್ಲಿ ಒಳ್ಳೆಯ ಬೆಳೆ ಬೆಳೆಸುತ್ತಿದ್ದ.",
  malayalam:
    "ഒരു ചെറിയ ഗ്രാമത്തിൽ രാം എന്ന കർഷകൻ താമസിച്ചിരുന്നു. അവൻ വളരെ കഠിനാധ്വാനി ആയിരുന്നു കൂടാതെ തന്റെ വയലിൽ നല്ല വിളകൾ വളർത്തിയിരുന്നു.",
  english:
    "In a small village, there lived a farmer named Ram. He was very hardworking and grew good crops in his field.",
  assam: "এটা সৰু গাঁৱত ৰাম নামৰ এজন কৃষক বাস কৰিছিল। তেওঁ অতি পৰিশ্ৰমী আছিল আৰু নিজৰ পথাৰত ভাল শস্য উৎপাদন কৰিছিল।",
}



export default function GenerateStoryPage() {
  const [prompt, setPrompt] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("hindi")
  const [generatedStory, setGeneratedStory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [currentSampleText, setCurrentSampleText] = useState(sampleTexts.hindi)
  const { toast } = useToast()

  // Check if API key is available
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY

  // Update sample text when language changes
  useEffect(() => {
    setCurrentSampleText(sampleTexts[selectedLanguage as keyof typeof sampleTexts])
  }, [selectedLanguage])

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    // Clear previous story when language changes
    setGeneratedStory("")
    setError("")
  }

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Enter a topic or question to generate a story.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedStory("");

    try {
      const selectedLang = languages.find((lang) => lang.value === selectedLanguage);
      const story = await generateStory(prompt, selectedLang?.nativeName || "Hindi");

      setGeneratedStory(story);
      toast({
        title: "Story generated successfully!",
        description: `Your story has been created in ${selectedLang?.label}.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate story";
      setError(errorMessage);
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyStory = () => {
    navigator.clipboard.writeText(generatedStory)
    toast({
      title: "Copied to clipboard",
      description: "The story has been copied to your clipboard.",
    })
  }

  const handleSaveStory = async () => {
    if (!generatedStory) return

    setIsSaving(true)
    try {
      const selectedLang = languages.find((lang) => lang.value === selectedLanguage)
      const user = auth.currentUser;
      const userId = user ? user.uid : "";
      await generateStoryAPI.create({
        title: `Story: ${prompt.slice(0, 50)}${prompt.length > 50 ? "..." : ""}`,
        content: generatedStory,
        userId,
      })

      toast({
        title: "Story saved!",
        description: "The story has been saved to your library.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save story. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedLangLabel = languages.find((lang) => lang.value === selectedLanguage)?.label || "Hindi"

  // Get userId from current user
  const userId = auth.currentUser ? auth.currentUser.uid : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation user={auth.currentUser ? {
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        avatar: auth.currentUser.photoURL || undefined
      } : undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Font Size Selector */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Local Story</h1>
            <p className="text-gray-600">Create culturally relevant stories in regional languages</p>
          </div>
          <FontSizeSelector />
        </div>

        {/* API Key Status */}
        {hasApiKey ? (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>AI Ready:</strong> Gemini API is configured and ready to generate stories!
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
                <BookOpen className="h-5 w-5 text-green-600" />
                Create Your Story
              </CardTitle>
              <CardDescription>
                Enter a topic or question and we'll generate a culturally relevant story in your selected language.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Select Language</Label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Selected: {selectedLangLabel}</p>

                {/* Sample text preview */}
                <div className="bg-gray-50 border rounded-lg p-3 mt-2">
                  <p className="text-xs text-gray-600 mb-1">Sample text in {selectedLangLabel}:</p>
                  <p className="text-sm text-gray-800 font-medium">{currentSampleText}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Enter your topic or question</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., Create a story about farmers to explain soil types"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button onClick={handleGenerateStory} disabled={isLoading || !hasApiKey} className="w-full bg-teal-600 hover:bg-teal-700 text-white border-teal-600" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Generate Story
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Generated Story</CardTitle>
              <CardDescription>Your AI-generated story will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <StoryGenerationLoader />
              ) : generatedStory ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto border">
                    <pre className="whitespace-pre-wrap text-sm font-medium text-gray-800 leading-relaxed font-sans">
                      {generatedStory}
                    </pre>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCopyStory} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={handleSaveStory} variant="outline" size="sm" disabled={isSaving}>
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
                  {/* Add FeedbackForm below the story and buttons */}
                  <FeedbackForm
                    userId={userId}
                    feature="story"
                    inputPrompt={prompt}
                    outputContent={generatedStory}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Your generated story will appear here</p>
                  <p className="text-sm">Enter a topic above and click "Generate Story" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Prompts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Example Prompts</CardTitle>
            <CardDescription>Click on any example to use it as your prompt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors border border-green-200 hover:border-green-300"
                onClick={() => setPrompt("Create a story about farmers to explain different types of soil")}
              >
                <p className="text-sm font-medium text-green-800 mb-1">Soil Types Story</p>
                <p className="text-xs text-green-600">
                  Create a story about farmers to explain different types of soil
                </p>
              </div>
              <div
                className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 hover:border-blue-300"
                onClick={() => setPrompt("Explain the water cycle through a story about a village")}
              >
                <p className="text-sm font-medium text-blue-800 mb-1">Water Cycle Story</p>
                <p className="text-xs text-blue-600">Explain the water cycle through a story about a village</p>
              </div>
              <div
                className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors border border-purple-200 hover:border-purple-300"
                onClick={() => setPrompt("Create a story about local festivals to teach about seasons")}
              >
                <p className="text-sm font-medium text-purple-800 mb-1">Seasons & Festivals</p>
                <p className="text-xs text-purple-600">Create a story about local festivals to teach about seasons</p>
              </div>
              <div
                className="p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors border border-orange-200 hover:border-orange-300"
                onClick={() => setPrompt("Tell a story about local animals to explain food chains")}
              >
                <p className="text-sm font-medium text-orange-800 mb-1">Food Chain Story</p>
                <p className="text-xs text-orange-600">Tell a story about local animals to explain food chains</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
