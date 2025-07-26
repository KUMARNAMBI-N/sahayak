"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Download,
  Trash2,
  BookOpen,
  FileText,
  ImageIcon,
  Mic,
  Calendar,
  Filter,
  Eye,
  Heart,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { historyAPI, generateStoryAPI, multigradeWorksheetAPI, lessonPlannerAPI, visualAidAPI, readingAssessmentAPI } from "@/lib/api"
import { LoadingSpinner } from "@/components/loading-states"
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

interface LibraryItem {
  id: string
  type: "story" | "worksheet" | "lesson-plan" | "visual-aid" | "reading-assessment"
  title: string
  content: string
  metadata: Record<string, any>
  createdAt: Date
  userId: string
}

const typeIcons = {
  story: BookOpen,
  worksheet: FileText,
  "lesson-plan": Calendar,
  "visual-aid": ImageIcon,
  "reading-assessment": Mic,
}

const typeColors = {
  story: "bg-green-100 text-green-800 border-green-200",
  worksheet: "bg-blue-100 text-blue-800 border-blue-200",
  "lesson-plan": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "visual-aid": "bg-purple-100 text-purple-800 border-purple-200",
  "reading-assessment": "bg-orange-100 text-orange-800 border-orange-200",
}

const typeLabels = {
  story: "Story",
  worksheet: "Worksheet",
  "lesson-plan": "Lesson Plan",
  "visual-aid": "Visual Aid",
  "reading-assessment": "Reading Assessment",
}

function HistoryContent({ uid }: { uid: string }) {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchQuery, typeFilter])

  const loadItems = async () => {
    try {
      const allItems = await historyAPI.getAllItems();
      setItems(allItems);
    } catch (error) {
      toast({
        title: "Failed to load items",
        description: "Could not load your saved items.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter)
    }

    setFilteredItems(filtered)
  }

  const handleDeleteItem = async (id: string, type: string) => {
    try {
      // Delete based on item type
      switch (type) {
        case 'story':
          await generateStoryAPI.delete(id);
          break;
        case 'worksheet':
          await multigradeWorksheetAPI.delete(id);
          break;
        case 'lesson-plan':
          await lessonPlannerAPI.delete(id);
          break;
        case 'visual-aid':
          await visualAidAPI.delete(id);
          break;
        case 'reading-assessment':
          await readingAssessmentAPI.delete(id);
          break;
        default:
          throw new Error('Unknown item type');
      }
      
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast({
        title: "Item deleted",
        description: "The item has been removed from your library.",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the item.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadItem = (item: LibraryItem) => {
    const element = document.createElement("a")
    const file = new Blob([item.content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Download started",
      description: "The item is being downloaded.",
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation user={auth.currentUser ? {
          name: auth.currentUser.displayName || '',
          email: auth.currentUser.email || '',
          avatar: auth.currentUser.photoURL || undefined
        } : undefined} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner message="Loading your library..." />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation user={auth.currentUser ? {
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        avatar: auth.currentUser.photoURL || undefined
      } : undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">Manage your saved stories, worksheets, visual aids, and assessments.</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search your library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="story">Stories</SelectItem>
                    <SelectItem value="worksheet">Worksheets</SelectItem>
                    <SelectItem value="lesson-plan">Lesson Plans</SelectItem>
                    <SelectItem value="visual-aid">Visual Aids</SelectItem>
                    <SelectItem value="reading-assessment">Reading Assessments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {items.length === 0 ? "No saved items yet" : "No items match your search"}
                  </h3>
                  <p className="text-gray-500">
                    {items.length === 0
                      ? "Start creating content to build your library!"
                      : "Try adjusting your search or filter criteria."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const IconComponent = typeIcons[item.type]
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              <h3 className="text-lg font-medium text-gray-900 truncate">{item.title}</h3>
                              <Badge className={typeColors[item.type]}>{typeLabels[item.type]}</Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.content.slice(0, 150)}...</p>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.createdAt)}
                              </div>
                              {item.metadata.language && (
                                <span>Language: {item.metadata.languageLabel || item.metadata.language}</span>
                              )}
                              {item.metadata.grade && (
                                <span>Grade: {item.metadata.gradeLabel || item.metadata.grade}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDownloadItem(item)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id, item.type)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {selectedItem ? "Viewing selected item" : "Select an item to preview"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{selectedItem.title}</h4>
                      <Badge className={typeColors[selectedItem.type]}>{typeLabels[selectedItem.type]}</Badge>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{selectedItem.content}</pre>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Created: {formatDate(selectedItem.createdAt)}</p>
                      {selectedItem.metadata.language && (
                        <p>Language: {selectedItem.metadata.languageLabel || selectedItem.metadata.language}</p>
                      )}
                      {selectedItem.metadata.grade && (
                        <p>Grade: {selectedItem.metadata.gradeLabel || selectedItem.metadata.grade}</p>
                      )}
                      {selectedItem.metadata.subject && (
                        <p>Subject: {selectedItem.metadata.subjectLabel || selectedItem.metadata.subject}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadItem(selectedItem)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(selectedItem.id, selectedItem.type)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                    <p>Select an item from the list to preview it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HistoryPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setUid(user.uid);
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (checkingAuth || !uid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  // Only render history content after authentication
  return <HistoryContent uid={uid} />;
}
