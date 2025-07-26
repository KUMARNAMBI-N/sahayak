"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Copy, Heart, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { lessonPlannerAPI } from "@/lib/api";
import { Navigation } from "@/components/navigation";
import { auth } from "@/lib/firebase";
import { generateLessonPlan } from "@/lib/gemini";

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
];

const subjects = [
  { value: "science", label: "Science" },
  { value: "mathematics", label: "Mathematics" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "social-studies", label: "Social Studies" },
  { value: "environmental-science", label: "Environmental Science" },
  { value: "computer-science", label: "Computer Science" },
  { value: "physical-education", label: "Physical Education" },
];

const durations = [
  { value: "1 day", label: "1 Day" },
  { value: "2 days", label: "2 Days" },
  { value: "3 days", label: "3 Days" },
  { value: "5 days", label: "5 Days" },
  { value: "1 week", label: "1 Week" },
  { value: "2 weeks", label: "2 Weeks" },
];

export default function LessonPlannerPage() {
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState("3");
  const [selectedSubject, setSelectedSubject] = useState("science");
  const [selectedDuration, setSelectedDuration] = useState("5 days");
  const [topic, setTopic] = useState("");
  const [lessonPlan, setLessonPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Check if API key is available
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  async function handleGenerate() {
    if (!topic.trim()) {
      toast({
        title: "Topic is required",
        description: "Please enter a topic before generating a plan.",
        variant: "destructive",
      });
      return;
    }

    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key to enable AI generation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const generatedPlan = await generateLessonPlan(
        topic,
        selectedGrade,
        selectedSubject,
        selectedDuration
      );
      
      setLessonPlan(JSON.stringify(generatedPlan, null, 2));
      
      toast({
        title: "Lesson plan generated successfully!",
        description: `Your ${selectedSubject} lesson plan for Grade ${selectedGrade} has been created.`,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate lesson plan. Please check your API key and try again.");
      toast({
        title: "Generation failed",
        description: "Failed to generate lesson plan. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  }

  async function handleSave() {
    if (!lessonPlan) return;
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your lesson plan.",
          variant: "destructive",
        });
        return;
      }

      const token = await user.getIdToken();
      await lessonPlannerAPI.create({
        title: topic || "Untitled Lesson Plan",
        plan: {
          subject: selectedSubject,
          grade: selectedGrade,
          topic,
          duration: selectedDuration,
          lesson: lessonPlan,
        },
        userId: user.uid,
      });
      toast({ title: "Saved successfully!" });
    } catch (err) {
      console.error('Error saving lesson plan:', err);
      toast({ title: "Save failed", variant: "destructive" });
    }
    setIsSaving(false);
  }

  function handleCopy() {
    if (!lessonPlan) return;
    navigator.clipboard.writeText(lessonPlan);
    toast({ title: "Lesson plan copied!" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100">
      <Navigation user={auth.currentUser ? {
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        avatar: auth.currentUser.photoURL || undefined
      } : undefined} />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* -------- Input Section -------- */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold dark:text-white">
              AI‑Powered Lesson Planner
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Select grade & subject, enter a topic and duration, then generate
              a ready‑to‑use lesson plan with AI assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top row: grade, subject, duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Select Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Subject</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-2">
              <Label>Enter Topic</Label>
              <Textarea
                rows={4}
                placeholder="e.g. Water Cycle, Fractions, Photosynthesis, Indian Independence Movement..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Generate Button */}
            <div className="flex justify-start">
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !hasApiKey}
                className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
              >
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Generate Lesson Plan
              </Button>
            </div>

            {/* API Key Warning */}
            {!hasApiKey && (
              <div className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 p-4 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <strong>AI Ready:</strong> Gemini API is configured and ready to generate lesson plans!
              </div>
            )}
          </CardContent>
        </Card>

        {/* -------- Output Section -------- */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold dark:text-white">
              Generated Lesson Plan
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Copy or save your generated plan for future use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 p-4 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  Generating your lesson plan with AI...
                </p>
              </div>
            ) : lessonPlan ? (
              <>
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg max-h-96 overflow-y-auto border dark:border-gray-600 shadow-sm">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-mono">
                    {lessonPlan}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCopy}
                    className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  >
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
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium mb-2">
                  Your lesson plan will appear here
                </p>
                <p className="text-sm">
                  Enter topic, choose grade & subject, then click generate.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 