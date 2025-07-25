"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, FileText, ImageIcon, Users, Award } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

const slides = [
  {
    id: 1,
    title: "Transform Teaching with AI",
    subtitle: "Create engaging local stories and culturally relevant content",
    description:
      "Generate stories in regional languages that connect with your students' cultural background and make learning more meaningful.",
    image: "/placeholder.svg?height=400&width=600&text=AI+Story+Generation",
    cta: "Generate Stories",
    ctaLink: "/get-started",
    bgColor: "from-blue-600 to-indigo-700",
  },
  {
    id: 2,
    title: "Multigrade Worksheets Made Easy",
    subtitle: "Upload textbook images, get instant worksheets",
    description:
      "Simply upload a textbook page and our AI creates customized worksheets for multiple grade levels automatically.",
    image: "/placeholder.svg?height=400&width=600&text=Multigrade+Worksheets",
    cta: "Create Worksheets",
    ctaLink: "/get-started",
    bgColor: "from-green-600 to-emerald-700",
  },
  {
    id: 3,
    title: "Visual Learning Enhanced",
    subtitle: "Generate diagrams and visual aids instantly",
    description:
      "Create educational diagrams and visual aids that help students understand complex concepts through visual representation.",
    image: "/placeholder.svg?height=400&width=600&text=Visual+Learning",
    cta: "Create Visuals",
    ctaLink: "/get-started",
    bgColor: "from-purple-600 to-pink-700",
  },
  {
    id: 4,
    title: "AI-Powered Reading Assessment",
    subtitle: "Instant feedback for student reading skills",
    description:
      "Record student reading sessions and get detailed analysis with personalized feedback and improvement suggestions.",
    image: "/placeholder.svg?height=400&width=600&text=Reading+Assessment",
    cta: "Try Assessment",
    ctaLink: "/get-started",
    bgColor: "from-orange-600 to-red-700",
  },
]

const features = [
  {
    icon: BookOpen,
    title: "Local Story Generation",
    description: "Create culturally relevant stories in regional languages",
  },
  {
    icon: FileText,
    title: "Smart Worksheets",
    description: "Generate grade-appropriate worksheets from any content",
  },
  {
    icon: ImageIcon,
    title: "Visual Aids",
    description: "Create diagrams and illustrations for better understanding",
  },
  {
    icon: Users,
    title: "Multigrade Support",
    description: "Content for all levels from primary to higher secondary",
  },
]

const stats = [
  { icon: Users, value: "10,000+", label: "Teachers Using SAHAYAK" },
  { icon: BookOpen, value: "50,000+", label: "Stories Generated" },
  { icon: FileText, value: "25,000+", label: "Worksheets Created" },
  { icon: Award, value: "95%", label: "Teacher Satisfaction" },
]

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Slider */}
      <section className="relative h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
            }`}
          >
            <div className={`h-full bg-gradient-to-r ${slide.bgColor} flex items-center`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-white space-y-6">
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">{slide.title}</h1>
                  <h2 className="text-xl lg:text-2xl text-blue-100">{slide.subtitle}</h2>
                  <p className="text-lg text-blue-50 max-w-lg">{slide.description}</p>
                  <div className="flex space-x-4">
                    <Link href={slide.ctaLink}>
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                        {slide.cta}
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                      >
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="rounded-lg shadow-2xl" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Powerful AI Tools for Modern Teaching</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SAHAYAK provides comprehensive AI-powered tools designed specifically for Indian educators to create
              engaging, culturally relevant learning experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Icon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center text-white">
                  <Icon className="h-8 w-8 mx-auto mb-4 text-indigo-200" />
                  <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-indigo-200">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-full w-16 h-16 mx-auto mb-8 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Teaching?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of teachers who are already using SAHAYAK to create more engaging and effective learning
            experiences for their students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                Login to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">SAHAYAK</h3>
                  <p className="text-gray-400 text-sm">AI Teaching Companion</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                Empowering teachers with AI-driven local learning tools designed for Indian classrooms.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Story Generation</li>
                <li>Multigrade Worksheets</li>
                <li>Visual Aids</li>
                <li>Reading Assessment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SAHAYAK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
