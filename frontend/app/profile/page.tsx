"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, School, Edit, Save, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Mock user data
// const user = {
//   name: "Priya Sharma",
//   email: "priya.sharma@school.edu",
//   avatar: "/placeholder.svg?height=100&width=100&text=PS",
// }

const states = [
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  "Madhya Pradesh",
  "Bihar",
  "Odisha",
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    schoolName: "",
    state: "",
    city: "",
    experience: "",
    subjects: "",
    bio: "",
    preferredLanguage: "hindi",
  })
  const { toast } = useToast()

  // Fetch profile data on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${user.uid}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfileData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          schoolName: data.schoolName || "",
          state: data.state || "",
          city: data.city || "",
          experience: data.experience || "",
          subjects: data.subjects || "",
          bio: data.bio || "",
          preferredLanguage: data.preferredLanguage || "hindi",
        });
      } catch (error) {
        toast({ title: "Error", description: (error as any).message, variant: "destructive" });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setIsEditing(false)
    const user = auth.currentUser;
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({ title: "Error", description: (error as any).message, variant: "destructive" });
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data if needed
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={auth.currentUser?.photoURL || "/placeholder.svg"} alt={auth.currentUser?.displayName || "User"} />
                    <AvatarFallback className="text-2xl">{auth.currentUser?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{auth.currentUser?.displayName || "Loading..."}</h1>
                      <p className="text-gray-600">{auth.currentUser?.email || "Loading..."}</p>
                      <p className="text-sm text-gray-500">{profileData.schoolName || "Loading..."}</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School className="h-5 w-5" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School/Institution</Label>
                  <Input
                    id="schoolName"
                    value={profileData.schoolName}
                    onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={profileData.state}
                      onValueChange={(value) => setProfileData({ ...profileData, state: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.toLowerCase()} value={state.toLowerCase()}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Teaching Experience</Label>
                  <Select
                    value={profileData.experience}
                    onValueChange={(value) => setProfileData({ ...profileData, experience: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects Teaching</Label>
                  <Input
                    id="subjects"
                    value={profileData.subjects}
                    onChange={(e) => setProfileData({ ...profileData, subjects: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g., Mathematics, Science, English"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your SAHAYAK experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Content Language</Label>
                  <Select
                    value={profileData.preferredLanguage}
                    onValueChange={(value) => setProfileData({ ...profileData, preferredLanguage: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                      <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
