"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Type, Minus, Plus } from "lucide-react"

const fontSizes = [
  { value: "small", label: "Small", class: "text-sm" },
  { value: "medium", label: "Medium", class: "text-base" },
  { value: "large", label: "Large", class: "text-lg" },
  { value: "xl", label: "Extra Large", class: "text-xl" },
]

export function FontSizeSelector() {
  const [fontSize, setFontSize] = useState("medium")

  useEffect(() => {
    // Load saved font size from localStorage
    const savedFontSize = localStorage.getItem("sahayak-font-size")
    if (savedFontSize) {
      setFontSize(savedFontSize)
      applyFontSize(savedFontSize)
    }
  }, [])

  const applyFontSize = (size: string) => {
    const fontClass = fontSizes.find((f) => f.value === size)?.class || "text-base"
    document.documentElement.className = document.documentElement.className.replace(/text-(sm|base|lg|xl)/g, "")
    document.documentElement.classList.add(fontClass)
  }

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize)
    localStorage.setItem("sahayak-font-size", newSize)
    applyFontSize(newSize)
  }

  const increaseFontSize = () => {
    const currentIndex = fontSizes.findIndex((f) => f.value === fontSize)
    if (currentIndex < fontSizes.length - 1) {
      handleFontSizeChange(fontSizes[currentIndex + 1].value)
    }
  }

  const decreaseFontSize = () => {
    const currentIndex = fontSizes.findIndex((f) => f.value === fontSize)
    if (currentIndex > 0) {
      handleFontSizeChange(fontSizes[currentIndex - 1].value)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Type className="h-4 w-4 text-gray-600" />
      <Button
        variant="outline"
        size="sm"
        onClick={decreaseFontSize}
        disabled={fontSize === "small"}
        className="h-8 w-8 p-0 bg-transparent"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Select value={fontSize} onValueChange={handleFontSizeChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={increaseFontSize}
        disabled={fontSize === "xl"}
        className="h-8 w-8 p-0 bg-transparent"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
