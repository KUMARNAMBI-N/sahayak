"use client"

import { Loader2, Sparkles, BookOpen, FileText, ImageIcon, Mic } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSpinnerProps {
  message?: string
  submessage?: string
}

export function LoadingSpinner({ message = "Loading...", submessage }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
        <p className="text-gray-600 font-medium">{message}</p>
        {submessage && <p className="text-sm text-gray-500 mt-2">{submessage}</p>}
      </div>
    </div>
  )
}

export function StoryGenerationLoader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="h-5 w-5 text-green-600 animate-pulse" />
        <span className="text-green-600 font-medium">Creating your story...</span>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="text-center mt-6">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>AI is crafting your educational story...</span>
        </div>
      </div>
    </div>
  )
}

export function WorksheetGenerationLoader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600 animate-pulse" />
        <span className="text-blue-600 font-medium">Generating worksheet...</span>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="text-center mt-6">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Creating grade-appropriate questions...</span>
        </div>
      </div>
    </div>
  )
}

export function VisualAidGenerationLoader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <ImageIcon className="h-5 w-5 text-purple-600 animate-pulse" />
        <span className="text-purple-600 font-medium">Generating visual aid...</span>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="text-center mt-6">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Creating educational diagram...</span>
        </div>
      </div>
    </div>
  )
}

export function ReadingAnalysisLoader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Mic className="h-5 w-5 text-orange-600 animate-pulse" />
        <span className="text-orange-600 font-medium">Analyzing reading...</span>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      <div className="text-center mt-6">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Processing speech and analyzing performance...</span>
        </div>
      </div>
    </div>
  )
}
