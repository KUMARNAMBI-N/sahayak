"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  FileText,
  ImageIcon,
  Mic,
  Users,
  Calendar,
  Award,
  Sparkles,
  Bot,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FontSizeSelector } from "@/components/font-size-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation, type Language } from "@/lib/localization"
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuthRedirect } from '@/hooks/use-auth-redirect';

type Activity = {
  id: string;
  type?: string;
  title?: string;
  subject?: string;
  grade?: string;
  createdAt?: { toMillis?: () => number };
};

// Custom hook to fetch user profile from API
function useUserProfile(uid: string) {
  const [user, setUser] = useState({ name: "", email: "", avatar: "", uid: "" });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    storiesCreated: 0,
    worksheetsGenerated: 0,
    visualAids: 0,
    studentsHelped: 0,
    chatUsageSeconds: 0,
  });

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        // Get auth token
        const { auth } = await import('../../lib/firebase');
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const token = await currentUser.getIdToken();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch profile
        const profileRes = await fetch(`/api/profile/${uid}`, { headers });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setUser({
            name: data.fullName || "",
            email: data.email || "",
            avatar: data.avatar || "/placeholder.svg",
            uid,
          });
        }

        // Fetch recent activities
        const activitiesRes = await fetch(`/api/profile/${uid}/activities`, { headers });
        if (activitiesRes.ok) {
          const activities = await activitiesRes.json();
          setRecentActivities(activities.slice(0, 5));
        }

        // Fetch dashboard stats
        const statsRes = await fetch(`/api/profile/${uid}/dashboard-stats`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [uid]);

  return { ...user, recentActivities, stats };
}

// Child component for authenticated dashboard content
function DashboardContent({ uid, currentLanguage }: { uid: string, currentLanguage: Language }) {
  const t = useTranslation(currentLanguage);
  const { name, email, avatar, recentActivities, stats } = useUserProfile(uid);
  const user = { name, email, avatar };

  // Load language preference and listen for changes
  useEffect(() => {
    const savedLanguage = localStorage.getItem("sahayak-language") as Language
    if (savedLanguage) {
      // This is safe because parent controls currentLanguage
    }
    const handleLanguageChange = (event: CustomEvent) => {
      // This is safe because parent controls currentLanguage
    }
    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  // Check if API key is available
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const quickActions = [
    {
      title: t("aiAssistant"),
      description: "Get instant help with lesson planning and teaching strategies",
      icon: Bot,
      href: "/ai-assistant",
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Lesson Planner",
      description: "Plan detailed lessons with AI support",
      icon: BookOpen,
      href: "/lesson-planner",
      color: "bg-pink-500",
      textColor: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
    {
      title: t("generateStory"),
      description: "Create engaging stories for your students",
      icon: BookOpen,
      href: "/generate-story",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: t("multigradeWorksheet"),
      description: "Generate grade-appropriate worksheets",
      icon: FileText,
      href: "/multigrade-worksheet",
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: t("visualAid"),
      description: "Create visual learning materials",
      icon: ImageIcon,
      href: "/visual-aid",
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      title: t("readingAssessment"),
      description: "Assess student reading performance",
      icon: Mic,
      href: "/reading-assessment",
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation user={auth.currentUser ? {
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        avatar: auth.currentUser.photoURL || undefined
      } : undefined} />


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {/* Remove the avatar image from the dashboard header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("welcomeBack")}, {user.name || "User"}! 👋
              </h1>
              {/* <p className="text-gray-600 dark:text-gray-300 text-sm">{user.email}</p> */}
              <p className="text-gray-600 dark:text-gray-300">{t("readyToCreate")}</p>
            </div>
          </div>
          <FontSizeSelector />
        </div>

        {/* API Key Status */}
        {hasApiKey ? (
          <Alert className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              <strong>System Ready:</strong> All AI features are configured and ready to use!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <strong>Setup Required:</strong> Please add your Gemini API key to the .env.local file to enable AI
              features.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">{t("storiesCreated")}</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold dark:text-white">{stats.storiesCreated}</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">+12%</span> from last month
                </p>
              </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">{t("worksheetsGenerated")}</CardTitle>
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold dark:text-white">{stats.worksheetsGenerated}</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">+8%</span> from last month
                </p>
              </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">{t("visualAids")}</CardTitle>
              <ImageIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold dark:text-white">{stats.visualAids}</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">+15%</span> from last month
                </p>
              </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">{t("studentsHelped")}</CardTitle>
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold dark:text-white">{stats.studentsHelped}</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">+23%</span> from last month
                </p>
              </CardContent>
          </Card>

          {/* <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Chat Usage Hours</CardTitle>
              <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">
                {(stats.chatUsageSeconds ? (stats.chatUsageSeconds / 3600).toFixed(1) : "0.0")}
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Total hours spent using the AI Assistant
              </p>
            </CardContent>
          </Card> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Jump into creating educational content with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    // Add custom height for Lesson Planner
                    const customHeight = action.title === "Lesson Planner" ? "h-[123px]" : "";
                    return (
                      <Link key={action.title} href={action.href}>
                        <div
                          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md border ${action.bgColor} ${action.borderColor} hover:scale-105 ${customHeight}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${action.color}`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-medium ${action.textColor} dark:text-white mb-1`}>{action.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-1" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
          </Card>
        </div>

          {/* Recent Activity */}
          <div>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="dark:text-gray-300">Your latest created content</CardDescription>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center">No recent activity yet.</p>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            activity.type === "story"
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : activity.type === "worksheet"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-orange-100 dark:bg-orange-900/30"
                          }`}
                        >
                          {activity.type === "story" ? (
                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : activity.type === "worksheet" ? (
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                              {activity.subject}
                            </Badge>
                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                              {activity.grade}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.createdAt?.toMillis ? new Date(activity.createdAt.toMillis()).toLocaleString() : ""}
                          </p>
                    </div>
                  </div>
                    ))
                  )}
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  useAuthRedirect();
  const [currentLanguage, setCurrentLanguage] = useState<Language>("english")
  // Auth Guard
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const router = require('next/navigation').useRouter();

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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Only render dashboard content after authentication
  return <DashboardContent uid={uid} currentLanguage={currentLanguage} />;
}