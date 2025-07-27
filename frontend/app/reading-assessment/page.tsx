"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  Loader2,
  AlertCircle,
  Heart,
  CheckCircle,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Square,
  Play,
  Download,
  MicOff,
  Info,
  Target,
  TrendingUp,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FontSizeSelector } from "@/components/font-size-selector"

import { analyzeReadingWithLanguage } from "@/lib/gemini"
import { readingAssessmentAPI } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ReadingAnalysisLoader } from "@/components/loading-states"
import { useTranslation, type Language } from "@/lib/localization"
import { auth } from "@/lib/firebase";

const languages = [
  { value: "hindi", label: "हिंदी (Hindi)", nativeName: "हिंदी" },
  { value: "marathi", label: "मराठी (Marathi)", nativeName: "मराठी" },
  { value: "tamil", label: "தமிழ் (Tamil)", nativeName: "தமிழ்" },
  { value: "telugu", label: "తెలుగు (Telugu)", nativeName: "తెలుగు" },
  { value: "gujarati", label: "ગુજરાતી (Gujarati)", nativeName: "ગુજરાતી" },
  { value: "bengali", label: "বাংলা (Bengali)", nativeName: "বাংলা" },
  { value: "kannada", label: "ಕನ್ನಡ (Kannada)", nativeName: "ಕನ್ನಡ" },
  { value: "malayalam", label: "മലയാളം (Malayalam)", nativeName: "മലയാളം" },
  { value: "english", label: "English", nativeName: "English" },
]

const sampleTexts = {
  hindi:
    "सूर्य पूर्व दिशा में उगता है और पश्चिम दिशा में अस्त होता है। यह हमारे सौर मंडल का केंद्र है और सभी ग्रह इसके चारों ओर घूमते हैं। सूर्य की रोशनी से ही पृथ्वी पर जीवन संभव है। यह हमें गर्मी और प्रकाश देता है।",
  marathi:
    "सूर्य पूर्वेकडून उगवतो आणि पश्चिमेकडे मावळतो. तो आपल्या सौरमंडळाचा केंद्र आहे आणि सर्व ग्रह त्याच्याभोवती फिरतात. सूर्याच्या प्रकाशामुळेच पृथ्वीवर जीवन शक्य आहे. तो आपल्याला उष्णता आणि प्रकाश देतो.",
  tamil:
    "சூரியன் கிழக்கில் உதித்து மேற்கில் மறைகிறது. இது நமது சூரிய குடும்பத்தின் மையம் மற்றும் அனைத்து கிரகங்களும் இதைச் சுற்றி வருகின்றன. சூரிய ஒளியால் தான் பூமியில் வாழ்க்கை சாத்தியமாகிறது. இது நமக்கு வெப்பமும் ஒளியும் தருகிறது.",
  telugu:
    "సూర్యుడు తూర్పున ఉదయిస్తాడు మరియు పడమటిలో అస్తమిస్తాడు. ఇది మన సౌర వ్యవస్థ యొక్క కేంద్రం మరియు అన్ని గ్రహాలు దీని చుట్టూ తిరుగుతాయి. సూర్య కాంతి వల్లనే భూమిపై జీవం సాధ్యమవుతుంది. ఇది మనకు వేడిమి మరియు కాంతిని ఇస్తుంది.",
  gujarati:
    "સૂર્ય પૂર્વમાં ઉગે છે અને પશ્ચિમમાં આથમે છે. તે આપણા સૌરમંડળનું કેન્દ્ર છે અને બધા ગ્રહો તેની આસપાસ ફરે છે. સૂર્યના પ્રકાશથી જ પૃથ્વી પર જીવન શક્ય છે. તે આપણને ગરમી અને પ્રકાશ આપે છે.",
  bengali:
    "সূর্য পূর্ব দিকে ওঠে এবং পশ্চিম দিকে অস্ত যায়। এটি আমাদের সৌরজগতের কেন্দ্র এবং সব গ্রহ এর চারপাশে ঘোরে। সূর্যের আলোর কারণেই পৃথিবীতে জীবন সম্ভব। এটি আমাদের তাপ ও আলো দেয়।",
  kannada:
    "ಸೂರ್ಯ ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ ಮತ್ತು ಪಶ್ಚಿಮದಲ್ಲಿ ಅಸ್ತಮಿಸುತ್ತಾನೆ. ಇದು ನಮ್ಮ ಸೌರಮಂಡಲದ ಕೇಂದ್ರವಾಗಿದೆ ಮತ್ತು ಎಲ್ಲಾ ಗ್ರಹಗಳು ಇದರ ಸುತ್ತ ಸುತ್ತುತ್ತವೆ. ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದಲೇ ಭೂಮಿಯಲ್ಲಿ ಜೀವ ಸಾಧ್ಯವಾಗಿದೆ. ಇದು ನಮಗೆ ಶಾಖ ಮತ್ತು ಬೆಳಕನ್ನು ನೀಡುತ್ತದೆ.",
  malayalam:
    "സൂര്യൻ പൂർവ്വദിശയിൽ ഉദിക്കുകയും പശ്ചിമദിശയിൽ അസ്തമിക്കുകയും ചെയ്യുന്നു. ഇത് നമ്മുടെ സൗരയൂഥത്തിന്റെ കേന്ദ്രമാണ് കൂടാതെ എല്ലാ ഗ്രഹങ്ങളും ഇതിനെ ചുറ്റി സഞ്ചരിക്കുന്നു. സൂര്യപ്രകാശം കൊണ്ടാണ് ഭൂമിയിൽ ജീവൻ സാധ്യമാകുന്നത്. ഇത് നമുക്ക് ചൂടും വെളിച്ചമും നൽകുന്നു.",
  english:
    "The sun rises in the east and sets in the west. It is the center of our solar system and all planets revolve around it. Life on Earth is possible because of sunlight. It provides us with heat and light that are essential for all living beings.",
}



interface AnalysisResult {
  overallScore: number
  fluency: number
  pronunciation: number
  pace: number
  accuracy: number
  wordsPerMinute: number
  languageSpecificFeedback: string[]
  generalFeedback: string[]
  suggestions: string[]
  strengths: string[]
  areasForImprovement: string[]
}

export default function ReadingAssessmentPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [currentLanguage, setCurrentLanguage] = useState<Language>("english")
  const [readingText, setReadingText] = useState(sampleTexts.english)
  const [transcript, setTranscript] = useState("")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()
  const t = useTranslation(currentLanguage)

  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 2

  // Check if API key is available
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)

    // Load saved language
    const savedLanguage = localStorage.getItem("sahayak-language") as Language
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange as EventListener)
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = selectedLanguage === "english" ? "en-US" : "hi-IN"

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + " " + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === "no-speech" && retryCount < MAX_RETRIES) {
          setRetryCount((c) => c + 1)
          recognitionRef.current!.stop()
          recognitionRef.current!.start()
          return
        }

        setIsListening(false)
        console.error("Speech recognition error:", event.error)
        toast({
          title: "Speech-to-text error",
          description:
            event.error === "no-speech"
              ? "I didn't catch anything. Please speak louder or move closer to the microphone."
              : "Could not process speech. Please try again.",
          variant: "destructive",
        })
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [selectedLanguage, toast, retryCount])

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    setReadingText(sampleTexts[language as keyof typeof sampleTexts])
    resetAssessment()

    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "english" ? "en-US" : "hi-IN"
    }
  }

  const resetAssessment = () => {
    setTranscript("")
    setAnalysisResult(null)
    setError("")
    setAudioBlob(null)
    setAudioUrl(null)
    if (isListening) {
      stopSpeechToText()
    }
  }

  const startSpeechToText = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone permission to use speech-to-text.",
        variant: "destructive",
      })
      return
    }

    setRetryCount(0)

    if (!recognitionRef.current) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      return
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
      toast({
        title: "Speech-to-text started",
        description: "Start speaking. Your words will appear in the transcript.",
      })
    } catch (error) {
      toast({
        title: "Could not start speech recognition",
        description: "Please check microphone permissions.",
        variant: "destructive",
      })
    }
  }

  const stopSpeechToText = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      toast({
        title: "Speech-to-text stopped",
        description: "Transcript has been captured.",
      })
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      toast({
        title: "Recording started",
        description: "Start reading the text aloud.",
      })
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      toast({
        title: "Recording stopped",
        description: "Audio has been saved.",
      })
    }
  }

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  const downloadAudio = () => {
    if (audioBlob && audioUrl) {
      const a = document.createElement("a")
      a.href = audioUrl
      a.download = `reading-${selectedLanguage}-${Date.now()}.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Download started",
        description: "Audio file is being downloaded.",
      })
    }
  }

  const analyzeReading = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No transcript available",
        description: "Please record your reading or enter transcript manually.",
        variant: "destructive",
      })
      return
    }

    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key to use AI analysis.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const result = await analyzeReadingWithLanguage(transcript, selectedLanguage, readingText);
      setAnalysisResult(result);

      toast({
        title: "Analysis complete!",
        description: "Reading performance has been analyzed successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze reading"
      setError(errorMessage)
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveAssessment = async () => {
    if (!analysisResult) return

    setIsSaving(true)
    try {
      const languageLabel = languages.find((lang) => lang.value === selectedLanguage)?.label
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your assessment.",
          variant: "destructive",
        });
        return;
      }

      const token = await user.getIdToken();
      await readingAssessmentAPI.create({
        title: `Reading Assessment - ${languageLabel}`,
        assessmentData: {
          originalText: readingText,
          transcript: transcript,
          analysis: analysisResult,
          hasAudio: !!audioBlob,
        },
        userId: user.uid,
      })

      toast({
        title: "Assessment saved!",
        description: "The reading assessment has been saved to your library.",
      })
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Save failed",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetry = () => {
    resetAssessment()
    toast({
      title: "Assessment reset",
      description: "You can now start a new reading assessment.",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80)
      return { label: "Excellent", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" }
    if (score >= 60)
      return { label: "Good", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" }
    return { label: "Needs Practice", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation user={auth.currentUser ? {
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        avatar: auth.currentUser.photoURL || undefined
      } : undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Font Size Selector */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("readingAssessment")}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              AI-powered reading performance analysis with detailed feedback
            </p>
          </div>
          <FontSizeSelector />
        </div>

        {/* Instructions Card */}
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            <strong>How it works:</strong> Select a language, read the text aloud using speech-to-text or record audio,
            then get AI-powered analysis of reading fluency, pronunciation, and pace.
          </AlertDescription>
        </Alert>

        {/* API Key Status */}
        {hasApiKey ? (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              <strong>AI Ready:</strong> Gemini API is configured and ready to analyze reading!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <strong>API Key Missing:</strong> Please add your Gemini API key to the .env.local file to enable AI
              analysis.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Reading Setup
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Choose language and prepare for reading assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className="dark:text-white">
                    {t("selectLanguage")}
                  </Label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Choose language" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      {languages.map((lang) => (
                        <SelectItem
                          key={lang.value}
                          value={lang.value}
                          className="dark:text-white dark:focus:bg-gray-600"
                        >
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-white flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {t("originalText")}
                  </Label>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 border-2 border-orange-200 dark:border-gray-500 rounded-lg p-6">
                    <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                      {readingText}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Read this text aloud clearly and at a comfortable pace
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Mic className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Recording & Speech-to-Text
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Choose your preferred method to capture your reading
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={isListening ? stopSpeechToText : startSpeechToText}
                    variant={isListening ? "destructive" : "default"}
                    className={`h-12 ${
                      !isListening 
                        ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600" 
                        : ""
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Speech-to-Text
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Speech-to-Text
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    className={`h-12 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 ${
                      !isRecording 
                        ? "border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20" 
                        : ""
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Record Audio
                      </>
                    )}
                  </Button>
                </div>

                {/* Status Indicators */}
                {isListening && (
                  <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
                    <div className="w-3 h-3 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">🎤 Listening for speech... Speak clearly!</span>
                  </div>
                )}

                {isRecording && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <div className="w-3 h-3 bg-red-600 dark:bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">🔴 Recording audio... Read the text above!</span>
                  </div>
                )}

                {/* Audio Controls */}
                {audioUrl && (
                  <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Button
                      onClick={playAudio}
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 bg-transparent border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Recording
                    </Button>
                    <Button
                      onClick={downloadAudio}
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 bg-transparent border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="transcript" className="dark:text-white">
                    {t("transcript")} (Auto-generated or Manual Entry)
                  </Label>
                  <Textarea
                    id="transcript"
                    placeholder="Your spoken words will appear here automatically, or you can type them manually..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={4}
                    className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transcript.trim().split(" ").length} words captured
                  </p>
                </div>

                <Button onClick={analyzeReading} disabled={isAnalyzing || !hasApiKey} className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white border-teal-600" size="lg">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Reading Performance...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {t("analyzeReading")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">📊 Analysis Results</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Comprehensive AI-powered reading assessment and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {isAnalyzing ? (
                <ReadingAnalysisLoader />
              ) : analysisResult ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className={`text-5xl font-bold mb-2 ${getScoreColor(analysisResult.overallScore)}`}>
                      {analysisResult.overallScore}/100
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{t("overallScore")}</p>
                    <Badge className={getScoreBadge(analysisResult.overallScore).color}>
                      {getScoreBadge(analysisResult.overallScore).label}
                    </Badge>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium dark:text-gray-300">{t("fluency")}</span>
                        <span className={`text-sm font-bold ${getScoreColor(analysisResult.fluency)}`}>
                          {analysisResult.fluency}/100
                        </span>
                      </div>
                      <Progress value={analysisResult.fluency} className="h-3" />
                    </div>
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium dark:text-gray-300">{t("pronunciation")}</span>
                        <span className={`text-sm font-bold ${getScoreColor(analysisResult.pronunciation)}`}>
                          {analysisResult.pronunciation}/100
                        </span>
                      </div>
                      <Progress value={analysisResult.pronunciation} className="h-3" />
                    </div>
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium dark:text-gray-300">{t("pace")}</span>
                        <span className={`text-sm font-bold ${getScoreColor(analysisResult.pace)}`}>
                          {analysisResult.pace}/100
                        </span>
                      </div>
                      <Progress value={analysisResult.pace} className="h-3" />
                    </div>
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium dark:text-gray-300">{t("accuracy")}</span>
                        <span className={`text-sm font-bold ${getScoreColor(analysisResult.accuracy)}`}>
                          {analysisResult.accuracy}/100
                        </span>
                      </div>
                      <Progress value={analysisResult.accuracy} className="h-3" />
                    </div>
                  </div>

                  <Separator className="dark:bg-gray-600" />

                  {/* Reading Speed */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-800 dark:text-blue-300">Reading Speed</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {analysisResult.wordsPerMinute} WPM
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Words per minute</p>
                  </div>

                  {/* Language-Specific Feedback */}
                  {analysisResult.languageSpecificFeedback && analysisResult.languageSpecificFeedback.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Language-Specific Feedback
                      </Label>
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          {analysisResult.languageSpecificFeedback.map((feedback, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-purple-500 dark:text-purple-400 mt-1 font-bold">•</span>
                              <span>{feedback}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* General Feedback */}
                  {analysisResult.generalFeedback && analysisResult.generalFeedback.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-blue-700 dark:text-blue-300 font-semibold">General Feedback</Label>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          {analysisResult.generalFeedback.map((feedback, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-blue-500 dark:text-blue-400 mt-1 font-bold">•</span>
                              <span>{feedback}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 dark:text-white font-semibold">
                        <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />💡 Improvement Suggestions
                      </Label>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                          {analysisResult.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-1 text-lg">💡</span>
                              <span className="leading-relaxed">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-green-700 dark:text-green-300 font-semibold">✅ Strengths</Label>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          {analysisResult.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-green-500 dark:text-green-400 mt-1 font-bold">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {analysisResult.areasForImprovement && analysisResult.areasForImprovement.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-red-700 dark:text-red-300 font-semibold">🎯 Areas for Improvement</Label>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          {analysisResult.areasForImprovement.map((area, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-red-500 dark:text-red-400 mt-1 font-bold">→</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveAssessment} className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white border-teal-600" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          Save to Library
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="flex-1 h-12 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 bg-transparent border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      New Assessment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <div className="bg-teal-100 dark:bg-teal-900/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Mic className="h-12 w-12 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 dark:text-white">Ready for Reading Assessment</h3>
                  <p className="text-sm max-w-md mx-auto leading-relaxed">
                    Select a language, read the text aloud using speech-to-text or record audio, then get detailed
                    AI-powered feedback on your reading performance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How to Use */}
        <Card className="mt-8 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl dark:text-white">📚 How to Use Reading Assessment</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Follow these simple steps to get comprehensive reading feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-teal-100 dark:bg-teal-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">1</span>
                </div>
                <h3 className="font-semibold mb-2 dark:text-white">Select Language</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose your preferred language and review the reading text
                </p>
              </div>
              <div className="text-center">
                <div className="bg-teal-100 dark:bg-teal-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">2</span>
                </div>
                <h3 className="font-semibold mb-2 dark:text-white">Record or Speak</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Use speech-to-text for real-time capture or record audio for later analysis
                </p>
              </div>
              <div className="text-center">
                <div className="bg-teal-100 dark:bg-teal-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">3</span>
                </div>
                <h3 className="font-semibold mb-2 dark:text-white">Get AI Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Receive detailed feedback on fluency, pronunciation, pace, and accuracy
                </p>
              </div>
              <div className="text-center">
                <div className="bg-teal-100 dark:bg-teal-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">4</span>
                </div>
                <h3 className="font-semibold mb-2 dark:text-white">Track Progress</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Save your assessments and monitor your reading improvement over time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
