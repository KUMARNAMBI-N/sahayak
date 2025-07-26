"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, BookOpen, FileText, ImageIcon, Mic, Menu, User, LogOut, Settings, History, Bot } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Sayahak from "@/public/sahayak_logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useTranslation, type Language } from "@/lib/localization"

const languages = [
  { value: "marathi", label: "मराठी (Marathi)" },
  { value: "hindi", label: "हिंदी (Hindi)" },
  { value: "tamil", label: "தமிழ் (Tamil)" },
  { value: "telugu", label: "తెలుగు (Telugu)" },
  { value: "gujarati", label: "ગુજરાતી (Gujarati)" },
  { value: "bengali", label: "বাংলা (Bengali)" },
  { value: "kannada", label: "ಕನ್ನಡ (Kannada)" },
  { value: "malayalam", label: "മലയാളം (Malayalam)" },
  { value: "english", label: "English" },
]

interface NavigationProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("english")
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const t = useTranslation(selectedLanguage)

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("sahayak-language") as Language
    if (savedLanguage && languages.find((lang) => lang.value === savedLanguage)) {
      setSelectedLanguage(savedLanguage)
    }
  }, [])

  const navigationItems = [
    {
      name: t("dashboard"),
      href: "/dashboard",
      icon: Sparkles,
    },
    {
      name: t("aiAssistant"),
      href: "/ai-assistant",
      icon: Bot,
    },
    {
      name: t("generateStory"),
      href: "/generate-story",
      icon: BookOpen,
    },
    {
      name: t("multigradeWorksheet"),
      href: "/multigrade-worksheet",
      icon: FileText,
    },
    {
      name: t("visualAid"),
      href: "/visual-aid",
      icon: ImageIcon,
    },
    {
      name: t("readingAssessment"),
      href: "/reading-assessment",
      icon: Mic,
    },
  ]

  const isActive = (href: string) => pathname === href

  const handleLanguageChange = (language: string) => {
    const newLanguage = language as Language
    setSelectedLanguage(newLanguage)
    localStorage.setItem("sahayak-language", newLanguage)

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("languageChange", { detail: newLanguage }))

    toast({
      title: "Language changed",
      description: `Interface language changed to ${languages.find((l) => l.value === language)?.label}`,
    })

    // Force a page refresh to apply translations immediately
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    })
    router.push("/")
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-1 h-16">
  <img
    src={Sayahak.src}
    alt="Sahayak Logo"
    className="h-10 w-10 object-contain"
    style={{ minWidth: 40 }}
  />
  <span className="text-lg font-bold">SAHAYAK</span>
</Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-2 dark:text-white dark:hover:bg-gray-700"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            {user && (
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 hidden md:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} className="dark:text-white dark:focus:bg-gray-600">
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="dark:bg-gray-600 dark:text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 dark:bg-gray-700 dark:border-gray-600" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium dark:text-white">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground dark:text-gray-300">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="dark:bg-gray-600" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center cursor-pointer dark:text-white dark:hover:bg-gray-600"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/history"
                      className="flex items-center cursor-pointer dark:text-white dark:hover:bg-gray-600"
                    >
                      <History className="mr-2 h-4 w-4" />
                      {t("history")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex items-center cursor-pointer dark:text-white dark:hover:bg-gray-600"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-gray-600" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-gray-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="dark:text-white dark:hover:bg-gray-700">
                    Login
                  </Button>
                </Link>
                <Link href="/get-started">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            {user && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden dark:text-white">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex flex-col space-y-4 mt-8">
                    {/* Mobile Language Selector */}
                    <div className="px-3">
                      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue />
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

                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive(item.href)
                              ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
