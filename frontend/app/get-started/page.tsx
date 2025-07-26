"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Mail, Lock, User, School, MapPin, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Sayahak from "@/public/sahayak_logo.png";
const steps = [
  { id: 1, title: "Account Details", description: "Basic information" },
  { id: 2, title: "Teaching Profile", description: "Your teaching background" },
  { id: 3, title: "Preferences", description: "Customize your experience" },
]

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
]

const subjects = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Economics",
  "Political Science",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music",
  "Regional Language",
]

const gradeRanges = [
  { value: "primary", label: "Primary (1st-5th)", grades: "Classes 1-5" },
  { value: "middle", label: "Middle School (6th-8th)", grades: "Classes 6-8" },
  { value: "secondary", label: "Secondary (9th-10th)", grades: "Classes 9-10" },
  { value: "higher-secondary", label: "Higher Secondary (11th-12th)", grades: "Classes 11-12" },
  { value: "mixed", label: "Mixed Grades", grades: "Multiple levels" },
]

export default function GetStartedPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Account Details
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",

    // Step 2: Teaching Profile
    schoolName: "",
    state: "",
    city: "",
    experience: "",
    gradeRange: "",
    subjects: [] as string[],

    // Step 3: Preferences
    preferredLanguage: "hindi",
    emailUpdates: true,
    whatsappUpdates: false,
    terms: false,
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      updateFormData("subjects", [...formData.subjects, subject])
    } else {
      updateFormData(
        "subjects",
        formData.subjects.filter((s) => s !== subject),
      )
    }
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
          toast({
            title: "Missing fields",
            description: "Please fill in all required fields.",
            variant: "destructive",
          })
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password mismatch",
            description: "Passwords do not match.",
            variant: "destructive",
          })
          return false
        }
        if (formData.password.length < 6) {
          toast({
            title: "Weak password",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          })
          return false
        }
        return true
      case 2:
        if (!formData.schoolName || !formData.state || !formData.city || !formData.gradeRange) {
          toast({
            title: "Missing fields",
            description: "Please fill in all required fields.",
            variant: "destructive",
          })
          return false
        }
        return true
      case 3:
        if (!formData.terms) {
          toast({
            title: "Terms required",
            description: "Please accept the terms and conditions.",
            variant: "destructive",
          })
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsLoading(true)

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Optionally update display name
      await updateProfile(user, { displayName: formData.fullName });

      // 3. Store user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        schoolName: formData.schoolName,
        state: formData.state,
        city: formData.city,
        experience: formData.experience,
        gradeRange: formData.gradeRange,
        subjects: formData.subjects,
        preferredLanguage: formData.preferredLanguage,
        emailUpdates: formData.emailUpdates,
        whatsappUpdates: formData.whatsappUpdates,
        terms: formData.terms,
        createdAt: new Date(),
      });

      toast({
        title: "Account created successfully!",
        description: "Welcome to SAHAYAK. Let's start creating amazing learning experiences.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="p-3 rounded-lg">
              {/* <Sparkles className="h-8 w-8 text-white" /> */}
              <img
    src={Sayahak.src}
    alt="Sahayak Logo"
    className="h-10 w-10 object-contain"
    style={{ minWidth: 40 }}
  />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">SAHAYAK</h1>
              <p className="text-sm text-gray-600">AI Teaching Companion</p>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl">Get Started</CardTitle>
                <CardDescription>Create your SAHAYAK account in just a few steps</CardDescription>
              </div>
              <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
            </div>
            <Progress value={progress} className="h-2" />

            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id < currentStep
                        ? "bg-green-500 text-white"
                        : step.id === currentStep
                          ? "bg-teal-600 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => updateFormData("fullName", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="teacher@school.edu"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Teaching Profile */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School/Institution Name *</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="schoolName"
                      placeholder="Enter your school name"
                      value={formData.schoolName}
                      onChange={(e) => updateFormData("schoolName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => updateFormData("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, "-")}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="city"
                        placeholder="Enter your city"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Teaching Experience</Label>
                    <Select value={formData.experience} onValueChange={(value) => updateFormData("experience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="2-5">2-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-15">11-15 years</SelectItem>
                        <SelectItem value="15+">15+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradeRange">Grade Range *</Label>
                    <Select value={formData.gradeRange} onValueChange={(value) => updateFormData("gradeRange", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade range" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            <div>
                              <div className="font-medium">{range.label}</div>
                              <div className="text-xs text-gray-500">{range.grades}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subjects You Teach</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                    {subjects.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={subject}
                          checked={formData.subjects.includes(subject)}
                          onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                        />
                        <Label htmlFor={subject} className="text-sm">
                          {subject}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Language for Content</Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(value) => updateFormData("preferredLanguage", value)}
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Communication Preferences</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailUpdates"
                        checked={formData.emailUpdates}
                        onCheckedChange={(checked) => updateFormData("emailUpdates", checked)}
                      />
                      <Label htmlFor="emailUpdates" className="text-sm">
                        Email updates about new features and tips
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="whatsappUpdates"
                        checked={formData.whatsappUpdates}
                        onCheckedChange={(checked) => updateFormData("whatsappUpdates", checked)}
                      />
                      <Label htmlFor="whatsappUpdates" className="text-sm">
                        WhatsApp notifications for important updates
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => updateFormData("terms", checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-teal-600 hover:text-teal-500">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-teal-600 hover:text-teal-500">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <div>
                {currentStep > 1 && (
                  <Button onClick={prevStep} variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                {currentStep < 3 ? (
                  <Button onClick={nextStep} className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-600 hover:text-teal-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
