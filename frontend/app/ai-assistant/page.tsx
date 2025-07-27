"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, Bot, User, MessageSquare, Trash2, Plus, History, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FontSizeSelector } from "@/components/font-size-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation, type Language } from "@/lib/localization"
import { saveToLibrary } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { generateGeneralResponse } from '@/lib/gemini';
import { onAuthStateChanged } from 'firebase/auth';
import FeedbackForm from "@/components/FeedbackForm"


interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// Mock user data


export default function AIAssistantPage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("english")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const t = useTranslation(currentLanguage)
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<{ [id: string]: boolean }>({});
  

  // Check if API key is available
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY

  // Load language preference and chat sessions on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("sahayak-language") as Language;
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch chat sessions from backend using UID
        const sessions = await fetchChatSessions(firebaseUser.uid);
        setChatSessions(sessions);
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id);
          setMessages(sessions[0].messages);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Save chat session to Firestore
  async function saveSessionToFirestore(session: ChatSession) {
    const user = auth.currentUser;
    if (!user) return;
    await saveToLibrary({
      type: 'ai-chat',
      title: session.title,
      content: JSON.stringify(session.messages),
      metadata: {},
      userId: user.uid,
    });
  }

  // Utility functions for backend chat session CRUD
  function normalizeSession(session: any): ChatSession {
    return {
      ...session,
      messages: Array.isArray(session.messages) ? session.messages : [],
      updatedAt: session.updatedAt ? new Date(session.updatedAt) : null,
      createdAt: session.createdAt ? new Date(session.createdAt) : null,
    };
  }
  async function fetchChatSessions(uid: string) {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/chat/${uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        console.error('Failed to fetch chat sessions:', res.statusText);
        return [];
      }
      const data = await res.json();
      return data.map(normalizeSession);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
  }

  async function saveChatSession(uid: string, session: ChatSession) {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/chat/${uid}/${session.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      });
      if (!res.ok) {
        console.error('Failed to save chat session:', res.statusText);
      }
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }

  async function updateChatSession(uid: string, sessionId: string, updateData: Partial<ChatSession>) {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/chat/${uid}/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        console.error('Failed to update chat session:', res.statusText);
      }
    } catch (error) {
      console.error('Error updating chat session:', error);
    }
  }

  async function deleteChatSession(uid: string, sessionId: string) {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/chat/${uid}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        console.error('Failed to delete chat session:', res.statusText);
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  }

  // Update saveChatSessions to also save to Firestore
  const saveChatSessions = (sessions: ChatSession[]) => {
    setChatSessions(sessions);
    if (user && user.uid) {
      // Save the current session to backend
      const currentSession = sessions.find(s => s.id === currentSessionId);
      if (currentSession) {
        saveChatSession(user.uid, currentSession);
      }
    }
  };

  const createNewSession = () => {
    if (!user) return;
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedSessions = [newSession, ...chatSessions];
    saveChatSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    toast({
      title: "New conversation started",
      description: "You can now start a fresh conversation.",
    });
  };

  const loadSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(Array.isArray(session.messages) ? session.messages : []);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    // Call backend to delete session
    await deleteChatSession(user.uid, sessionId);
    const updatedSessions = chatSessions.filter((s) => s.id !== sessionId);
    saveChatSessions(updatedSessions);
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        loadSession(updatedSessions[0].id);
      } else {
        createNewSession();
      }
    }
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed.",
    });
  };

  const updateCurrentSession = (newMessages: Message[]) => {
    if (!currentSessionId || !user || !user.uid) return;
    const updatedSessions = chatSessions.map((session) => {
      if (session.id === currentSessionId) {
        const updatedSession = {
          ...session,
          messages: newMessages,
          updatedAt: new Date(),
        };
        // Update title based on first user message if it's still "New Conversation"
        if (session.title === "New Conversation" && newMessages.length > 0) {
          const firstUserMessage = newMessages.find((msg) => msg.role === "user");
          if (firstUserMessage) {
            updatedSession.title = firstUserMessage.content.slice(0, 50) + "...";
          }
        }
        // Save to backend
        saveChatSession(user.uid, updatedSession);
        return updatedSession;
      }
      return session;
    });
    saveChatSessions(updatedSessions);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };
    // If no current session, create a new one
    if (!currentSessionId || !currentSession) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : ""),
        messages: [userMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedSessions = [newSession, ...chatSessions];
      setChatSessions(updatedSessions);
      setCurrentSessionId(newSession.id);
      setMessages([userMessage]);
      // Save to backend
      if (user && user.uid) {
        await saveChatSession(user.uid, newSession);
      }
    } else {
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
    }
    setInputMessage("");
    try {
      const aiResponse = await generateGeneralResponse(inputMessage.trim());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      const finalMessages = [...(currentSessionId && currentSession ? messages : []), userMessage, assistantMessage];
      setMessages(finalMessages);
      await updateCurrentSession(finalMessages);
      toast({
        title: "Response generated",
        description: "AI assistant has responded to your query.",
      });
    } catch (err: any) {
      setError("Failed to generate response. Please try again.");
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const currentSession = chatSessions.find((s) => s.id === currentSessionId)

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("aiAssistant")}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your intelligent teaching companion for lesson planning and educational support
            </p>
          </div>
          <FontSizeSelector />
        </div>

        {/* API Key Status */}
        {hasApiKey ? (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              <strong>AI Ready:</strong> Gemini API is configured and ready to assist you!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <strong>API Key Missing:</strong> Please add your Gemini API key to the .env.local file to enable AI
              assistance.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat History Sidebar */}
          <Card className="lg:col-span-1 h-fit dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg dark:text-white flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Chat History
                </CardTitle>
                <Button onClick={createNewSession} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        currentSessionId === session.id
                          ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => loadSession(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Array.isArray(session.messages) ? session.messages.length : 0} messages
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {chatSessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs">Start a new chat to begin</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Chat Interface */}
          <Card className="lg:col-span-3 flex flex-col h-[600px] dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white">AI Teaching Assistant</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    {currentSession ? currentSession.title : "Start a new conversation"}
                  </CardDescription>
                </div>
                {messages.length > 0 && (
                  <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                    {messages.length} messages
                  </Badge>
                )}
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {t("welcome")} to SAHAYAK AI Assistant
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">{t("aiAssistantWelcome")}</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-3 max-w-[85%] ${
                            message.role === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div
                            className={`rounded-lg px-4 py-3 break-words overflow-wrap-anywhere ${
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                            <div
                              className={`text-xs mt-2 opacity-70 ${
                                message.role === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {(() => {
                                let dateObj = message.timestamp;
                                if (!(dateObj instanceof Date)) {
                                  dateObj = new Date(dateObj);
                                }
                                return dateObj.toLocaleTimeString();
                              })()}
                            </div>
                            {/* Add FeedbackForm for assistant messages only */}
                            {message.role === "assistant" && (
                              <FeedbackForm
                                key={message.id}
                                userId={auth.currentUser ? auth.currentUser.uid : ""}
                                feature="ai-assistant"
                                inputPrompt={
                                  messages
                                    .slice(0, messages.findIndex(m => m.id === message.id))
                                    .filter(m => m.role === "user")
                                    .slice(-1)[0]?.content || ""
                                }
                                outputContent={message.content}
                                submitted={feedbackGiven[message.id] || false}
                                onSubmit={() => setFeedbackGiven(prev => ({ ...prev, [message.id]: true }))}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator className="my-4 dark:bg-gray-600" />

              {/* Input Area */}
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about teaching, lesson planning, or educational strategies..."
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim() || !hasApiKey}
                  size="lg"
                  className="px-6"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Examples */}
        <Card className="mt-8 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Quick Start Examples</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Click on any example to start a conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                onClick={() =>
                  setInputMessage("Help me create a lesson plan for teaching fractions to Grade 4 students")
                }
              >
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Lesson Planning</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Create engaging lesson plans</p>
              </div>
              <div
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                onClick={() =>
                  setInputMessage(
                    "Suggest some interactive activities for teaching the water cycle to Grade 5 students",
                  )
                }
              >
                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Activity Ideas</p>
                <p className="text-xs text-green-600 dark:text-green-400">Interactive learning activities</p>
              </div>
              <div
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
                onClick={() =>
                  setInputMessage("How can I help students who are struggling with reading comprehension?")
                }
              >
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">Student Support</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Strategies for struggling learners</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
