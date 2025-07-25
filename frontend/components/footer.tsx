import Link from "next/link"
import { Sparkles, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
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
            <p className="text-gray-400 max-w-md mb-4">
              Empowering teachers with AI-driven local learning tools designed for Indian classrooms. Create engaging
              content in regional languages and enhance student learning experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/generate-story" className="hover:text-white transition-colors">
                  Story Generation
                </Link>
              </li>
              <li>
                <Link href="/multigrade-worksheet" className="hover:text-white transition-colors">
                  Multigrade Worksheets
                </Link>
              </li>
              <li>
                <Link href="/visual-aid" className="hover:text-white transition-colors">
                  Visual Aids
                </Link>
              </li>
              <li>
                <Link href="/reading-assessment" className="hover:text-white transition-colors">
                  Reading Assessment
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-white transition-colors">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@sahayak.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 SAHAYAK. All rights reserved. Made with ❤️ for Indian educators.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">Version 1.0.0</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-400">Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
