"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FeedbackForm from "@/components/FeedbackForm"

import {
  Copy,
  Download,
  Loader2,
  FileText,
  AlertCircle,
  Heart,
  CheckCircle,
  Upload,
  ImageIcon,
  FileUp,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FontSizeSelector } from "@/components/font-size-selector"

import { extractTextFromImage, extractTextFromPDF } from "@/lib/ocr"
import { generateWorksheet } from "@/lib/gemini"
import { multigradeWorksheetAPI } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WorksheetGenerationLoader } from "@/components/loading-states"
import { auth } from "@/lib/firebase";

const grades = [
  { value: "1", label: "Grade 1" },
  { value: "2", label: "Grade 2" },
  { value: "3", label: "Grade 3" },
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "9", label: "Grade 9" },
  { value: "10", label: "Grade 10" },
  { value: "11", label: "Grade 11" },
  { value: "12", label: "Grade 12" },
]

const subjects = [
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "social-studies", label: "Social Studies" },
  { value: "environmental-science", label: "Environmental Science" },
  { value: "general", label: "General Knowledge" },
]


export default function MultigradeWorksheetPage() {
  const [content, setContent] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("4")
  const [selectedSubject, setSelectedSubject] = useState("mathematics")
  const [generatedWorksheet, setGeneratedWorksheet] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [extractedText, setExtractedText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Check if API key is available
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key to enable text extraction.",
        variant: "destructive",
      })
      return
    }

    const validFiles = Array.from(files).filter((file) => {
      const isValidType = file.type.includes("image/") || file.type === "application/pdf"
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload only images (PNG, JPG) or PDF files.",
          variant: "destructive",
        })
        return false
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        })
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    setUploadedFiles((prev) => [...prev, ...validFiles])
    setIsExtracting(true)
    setExtractionProgress(0)

    try {
      let allExtractedText = ""

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        setExtractionProgress(((i + 1) / validFiles.length) * 100)

        toast({
          title: "Extracting text...",
          description: `Processing file ${i + 1} of ${validFiles.length}: ${file.name}`,
        })

        let fileText = ""
        if (file.type.includes("image/")) {
          fileText = await extractTextFromImage(file)
        } else if (file.type === "application/pdf") {
          fileText = await extractTextFromPDF(file)
        }

        allExtractedText += `\n\n--- Content from ${file.name} ---\n${fileText}`
      }

      setExtractedText(allExtractedText.trim())
      setContent(allExtractedText.trim())

      toast({
        title: "Text extraction completed!",
        description: `Successfully extracted content from ${validFiles.length} file(s).`,
      })
    } catch (error) {
      console.error("Extraction error:", error)
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Could not extract text from the uploaded files.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
      setExtractionProgress(0)
    }
  }

  const removeFile = (index: number) => {
    const removedFile = uploadedFiles[index]
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))

    // If this was the only file, clear the extracted text
    if (uploadedFiles.length === 1) {
      setExtractedText("")
      setContent("")
    }

    toast({
      title: "File removed",
      description: `${removedFile.name} has been removed.`,
    })
  }

  const handleGenerateWorksheet = async () => {
    const finalContent = content || extractedText

    if (!finalContent.trim()) {
      toast({
        title: "Please provide content",
        description: "Enter content manually or upload files to extract text.",
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
    setGeneratedWorksheet("")

    try {
      const worksheet = await generateWorksheet(finalContent, selectedGrade, selectedSubject);
      setGeneratedWorksheet(worksheet);
      toast({
        title: "Worksheet generated successfully!",
        description: `Grade ${selectedGrade} ${selectedSubject} worksheet has been created.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate worksheet"
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

  const handleCopyWorksheet = () => {
    navigator.clipboard.writeText(generatedWorksheet)
    toast({
      title: "Copied to clipboard",
      description: "The worksheet has been copied to your clipboard.",
    })
  }

  const handleSaveWorksheet = async () => {
    if (!generatedWorksheet) return

    setIsSaving(true)
    try {
      const gradeLabel = grades.find((grade) => grade.value === selectedGrade)?.label
      const subjectLabel = subjects.find((subject) => subject.value === selectedSubject)?.label
      const user = auth.currentUser;
      const userId = user ? user.uid : "";

      await multigradeWorksheetAPI.create({
        title: `${gradeLabel} ${subjectLabel} Worksheet`,
        worksheetData: {
          content: generatedWorksheet,
          grade: selectedGrade,
          gradeLabel,
          subject: selectedSubject,
          subjectLabel,
          topic: content.slice(0, 100),
          hasUploadedFiles: uploadedFiles.length > 0,
          extractedFromFiles: uploadedFiles.map((f) => f.name),
        },
        userId,
      })

      toast({
        title: "Worksheet saved!",
        description: "The worksheet has been saved to your library.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save worksheet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadWorksheet = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedWorksheet], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `Grade_${selectedGrade}_${selectedSubject}_Worksheet.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Download started",
      description: "The worksheet is being downloaded.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation user={auth.currentUser ? {
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        avatar: auth.currentUser.photoURL || undefined
      } : undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Font Size Selector */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Multigrade Worksheet</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Generate grade-appropriate worksheets from text or uploaded content
            </p>
          </div>
          <FontSizeSelector />
        </div>

        {/* API Key Status */}
        {hasApiKey ? (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              <strong>AI Ready:</strong> Gemini API is configured and ready to generate worksheets!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <strong>API Key Missing:</strong> Please add your Gemini API key to the .env.local file to enable AI
              generation.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="h-fit dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Create Worksheet
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Generate grade-appropriate worksheets for any subject and topic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="dark:text-white">
                    Select Grade
                  </Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Choose grade" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      {grades.map((grade) => (
                        <SelectItem
                          key={grade.value}
                          value={grade.value}
                          className="dark:text-white dark:focus:bg-gray-600"
                        >
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="dark:text-white">
                    Select Subject
                  </Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      {subjects.map((subject) => (
                        <SelectItem
                          key={subject.value}
                          value={subject.value}
                          className="dark:text-white dark:focus:bg-gray-600"
                        >
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
                  <TabsTrigger value="manual" className="dark:text-white dark:data-[state=active]:bg-gray-600">
                    Manual Input
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="dark:text-white dark:data-[state=active]:bg-gray-600">
                    Upload Files
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content" className="dark:text-white">
                      Enter Topic or Content
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="e.g., Addition and subtraction of fractions, or paste lesson content here"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                            <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Upload Textbook Pages
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Upload images or PDF files of textbook pages. We'll extract the text using AI and create
                            worksheets.
                          </p>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isExtracting}
                            className="mb-2"
                          >
                            {isExtracting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Extracting Text... {Math.round(extractionProgress)}%
                              </>
                            ) : (
                              <>
                                <FileUp className="h-4 w-4 mr-2" />
                                Choose Files
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Supports: PNG, JPG, PDF • Max size: 10MB per file
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Extraction Progress */}
                    {isExtracting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="dark:text-white">Extracting text from files...</span>
                          <span className="dark:text-white">{Math.round(extractionProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${extractionProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="dark:text-white">Uploaded Files</Label>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                                  {file.type.includes("image/") ? (
                                    <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extracted Text Preview */}
                    {extractedText && (
                      <div className="space-y-2">
                        <Label className="dark:text-white">Extracted Text Preview</Label>
                        <div className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto">
                          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans">
                            {extractedText.slice(0, 1000)}
                            {extractedText.length > 1000 && "..."}
                          </pre>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Showing first 1000 characters. Full text will be used for worksheet generation.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={handleGenerateWorksheet} disabled={isLoading || !hasApiKey} className="w-full bg-teal-600 hover:bg-teal-700 text-white border-teal-600" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Worksheet...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Worksheet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="h-fit dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Generated Worksheet</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Your AI-generated worksheet will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <WorksheetGenerationLoader />
              ) : generatedWorksheet ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-700 p-6 rounded-lg max-h-96 overflow-y-auto border dark:border-gray-600 shadow-sm">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-mono">
                      {generatedWorksheet}
                    </pre>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleCopyWorksheet}
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 bg-transparent"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleDownloadWorksheet}
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 bg-transparent"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleSaveWorksheet}
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 bg-transparent"
                    >
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
                                    {/* Feedback form for worksheet */}
                  <FeedbackForm
                    userId={auth.currentUser ? auth.currentUser.uid : ""}
                    feature="worksheet"
                    inputPrompt={content}
                    outputContent={generatedWorksheet}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg font-medium mb-2">Your generated worksheet will appear here</p>
                  <p className="text-sm">Select grade, subject, and provide content to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Topics */}
        <Card className="mt-8 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Example Topics</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Click on any example to use it as your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                onClick={() => setContent("Addition and subtraction of fractions with different denominators")}
              >
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Fractions</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Addition and subtraction of fractions</p>
              </div>
              <div
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                onClick={() => setContent("Photosynthesis process in plants and its importance")}
              >
                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Photosynthesis</p>
                <p className="text-xs text-green-600 dark:text-green-400">Process in plants and importance</p>
              </div>
              <div
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
                onClick={() => setContent("Indian freedom struggle and important leaders")}
              >
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">Freedom Struggle</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Indian independence movement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
