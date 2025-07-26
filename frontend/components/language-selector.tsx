"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { type Language } from "@/lib/localization"

const languages = [
  { code: "english", name: "English", flag: "🇺🇸" },
  { code: "hindi", name: "हिंदी", flag: "🇮🇳" },
  { code: "marathi", name: "मराठी", flag: "🇮🇳" },
  { code: "malayalam", name: "മലയാളം", flag: "🇮🇳" },
  { code: "tamil", name: "தமிழ்", flag: "🇮🇳" },
  { code: "telugu", name: "తెలుగు", flag: "🇮🇳" },
  { code: "kannada", name: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "bengali", name: "বাংলা", flag: "🇮🇳" },
  { code: "assamese", name: "অসমীয়া", flag: "🇮🇳" },
  { code: "gujarati", name: "ગુજરાતી", flag: "🇮🇳" },
]

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void
  className?: string
}

export function LanguageSelector({ onLanguageChange, className }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("english")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("sahayak-language") as Language
    if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem("sahayak-language", language)
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent("languageChange", { detail: language }))
    
    if (onLanguageChange) {
      onLanguageChange(language)
    }
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Globe className="h-4 w-4 mr-2" />
          {currentLang.flag} {currentLang.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code as Language)}
            className={currentLanguage === language.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 