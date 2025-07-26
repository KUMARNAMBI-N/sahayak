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
import { saveToLibrary } from "@/lib/firestore";
import { Navigation } from "@/components/navigation";
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
];

const subjects = [
  { value: "science", label: "Science" },
  { value: "mathematics", label: "Mathematics" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
];

export default function LessonPlannerPage() {
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState("3");
  const [selectedSubject, setSelectedSubject] = useState("science");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("5 days");
  const [lessonPlan, setLessonPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) {
      toast({
        title: "Topic is required",
        description: "Please enter a topic before generating a plan.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lessonPlanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          grades: [selectedGrade],
          topic,
          duration,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setLessonPlan(JSON.stringify(data.lessonPlan ?? data, null, 2));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate lesson plan. Please try again.");
    }

    setIsLoading(false);
  }

  async function handleSave() {
    if (!lessonPlan) return;
    setIsSaving(true);
    try {
      await saveToLibrary({
        type: "worksheet",
        title: topic || "Untitled Lesson Plan",
        content: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          topic,
          lesson: lessonPlan,
        }),
        metadata: {},
        userId: "",
      });
      toast({ title: "Saved successfully!" });
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen" style={{ backgroundColor: '#008080' }}>
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
              a ready‑to‑use lesson plan.
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
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 5 days"
                  className="border rounded-md p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-2">
              <Label>Enter Topic</Label>
              <Textarea
                rows={4}
                placeholder="e.g. Water Cycle, Fractions, Photosynthesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Generate Button */}
            <div className="flex justify-start">
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Generate Lesson Plan
              </Button>
            </div>
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
              <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-4 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400">
                Generating lesson plan...
              </p>
            ) : lessonPlan ? (
              <>
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg max-h-96 overflow-y-auto border dark:border-gray-600 shadow-sm">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-mono">
                    {lessonPlan}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSaving}
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