"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bell, Globe, Shield, Trash2, Download, Save, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FontSizeSelector } from "@/components/font-size-selector"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      weekly: true,
      updates: true,
    },
    privacy: {
      analytics: true,
      sharing: false,
      public: false,
    },
    preferences: {
      language: "hindi",
      theme: "light",
      autoSave: true,
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("sahayak-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    }
  }, [])

  // Apply theme changes immediately
  useEffect(() => {
    const theme = settings.preferences.theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [settings.preferences.theme])

  const updateSettings = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save to localStorage
      localStorage.setItem("sahayak-settings", JSON.stringify(settings))

      setHasUnsavedChanges(false)
      toast({
        title: "Settings saved successfully!",
        description: "Your preferences have been updated and applied.",
      })
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = () => {
    const dataToExport = {
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sahayak-data-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export started",
      description: "Your data export has been downloaded.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion request",
      description: "Please contact support at support@sahayak.com to delete your account.",
      variant: "destructive",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Font Size Selector */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-lg text-gray-600">Manage your account preferences and privacy settings</p>
          </div>
          <FontSizeSelector />
        </div>

        <div className="space-y-6">
          {/* Unsaved Changes Alert */}
          {hasUnsavedChanges && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-800 font-medium">You have unsaved changes</span>
                  </div>
                  <Button onClick={handleSave} size="sm" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateSettings("notifications", "email", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive browser notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => updateSettings("notifications", "push", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-gray-500">Get a summary of your activity</p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={settings.notifications.weekly}
                  onCheckedChange={(checked) => updateSettings("notifications", "weekly", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="feature-updates">Feature Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about new features</p>
                </div>
                <Switch
                  id="feature-updates"
                  checked={settings.notifications.updates}
                  onCheckedChange={(checked) => updateSettings("notifications", "updates", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Language & Region</span>
              </CardTitle>
              <CardDescription>Set your preferred language and regional settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-language">Content Language</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => updateSettings("preferences", "language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                      <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="telugu">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="gujarati">ગુજરાતી (Gujarati)</SelectItem>
                      <SelectItem value="bengali">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="kannada">ಕನ್ನಡ (Kannada)</SelectItem>
                      <SelectItem value="malayalam">മലയാളം (Malayalam)</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => updateSettings("preferences", "theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics">Usage Analytics</Label>
                  <p className="text-sm text-gray-500">Help improve SAHAYAK by sharing usage data</p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => updateSettings("privacy", "analytics", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save Content</Label>
                  <p className="text-sm text-gray-500">Automatically save your work</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.preferences.autoSave}
                  onCheckedChange={(checked) => updateSettings("preferences", "autoSave", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-sharing">Data Sharing</Label>
                  <p className="text-sm text-gray-500">Share anonymized data for research</p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={settings.privacy.sharing}
                  onCheckedChange={(checked) => updateSettings("privacy", "sharing", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your account data and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleExportData} variant="outline" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} size="lg" className="min-w-32">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  All Saved
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
