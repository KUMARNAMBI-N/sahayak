# Lesson Planner Setup Guide

## 🎯 Overview

The Lesson Planner is a comprehensive AI-powered tool that helps teachers create detailed lesson plans using Gemini AI. It includes full CRUD operations and integrates with the Sahayak platform.

## 🏗️ Architecture

### Frontend Components
- **Page**: `frontend/app/lesson-planner/page.tsx`
- **AI Integration**: `frontend/lib/gemini.ts` (generateLessonPlan function)
- **API Client**: `frontend/lib/api.ts` (lessonPlannerAPI)

### Backend Components
- **Controller**: `backend/controllers/lessonPlannerController.js`
- **Routes**: `backend/routes/lessonPlannerRoutes.js`
- **Database**: `backend/lib/firestore.js` (lessonPlansDb)
- **Server**: `backend/server.js` (registered at `/api/lesson-planner`)

## 🚀 Features

### ✅ AI-Powered Generation
- Uses Gemini AI to generate comprehensive lesson plans
- Supports multiple subjects and grade levels
- Includes learning objectives, activities, assessments, and resources
- Tailored for Indian education system

### ✅ CRUD Operations
- **Create**: Generate and save new lesson plans
- **Read**: View lesson plans by ID or get all for a user
- **Update**: Modify existing lesson plans
- **Delete**: Remove lesson plans from the system

### ✅ User Management
- Lesson plans are associated with authenticated users
- Secure access through Firebase authentication
- User-specific lesson plan history

### ✅ Professional UI
- Teal color scheme matching Sahayak brand
- Responsive design for all devices
- Loading states and error handling
- Copy and save functionality

## 🔧 Configuration

### 1. Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Backend (.env)
```bash
# Firebase Admin SDK (already configured)
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json
```

### 2. API Key Setup

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your frontend `.env.local` file
3. Restart your development server

## 📊 Database Schema

### Lesson Plan Document Structure
```javascript
{
  _id: "auto-generated-id",
  title: "Lesson Plan Title",
  plan: {
    subject: "science",
    grade: "3",
    topic: "Water Cycle",
    duration: "5 days",
    lesson: "JSON string of detailed lesson plan"
  },
  userId: "firebase-user-id",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Generated Lesson Plan Structure
```javascript
{
  title: "Lesson Title",
  grade: "3",
  subject: "science",
  duration: "5 days",
  learningObjectives: ["Objective 1", "Objective 2"],
  prerequisites: ["What students should know"],
  materials: ["Required materials"],
  lessonStructure: [
    {
      day: 1,
      title: "Day 1 Title",
      duration: "45 minutes",
      activities: [
        {
          type: "Introduction/Activity/Assessment",
          description: "Activity description",
          time: "10 minutes",
          materials: ["materials needed"],
          instructions: "Step-by-step instructions"
        }
      ],
      learningOutcomes: ["What students will learn"]
    }
  ],
  assessment: {
    formative: ["Formative assessment methods"],
    summative: ["Summative assessment methods"],
    rubrics: ["Assessment criteria"]
  },
  differentiation: {
    forStrugglingStudents: ["Support strategies"],
    forAdvancedStudents: ["Extension activities"]
  },
  homework: ["Homework assignments"],
  resources: ["Additional resources"],
  notes: ["Important notes for teachers"]
}
```

## 🛠️ API Endpoints

### Base URL: `/api/lesson-planner`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new lesson plan | ✅ |
| GET | `/` | Get all lesson plans for user | ✅ |
| GET | `/:id` | Get lesson plan by ID | ✅ |
| PUT | `/:id` | Update lesson plan | ✅ |
| DELETE | `/:id` | Delete lesson plan | ✅ |

### Example API Usage

#### Create Lesson Plan
```javascript
const response = await lessonPlannerAPI.create({
  title: "Water Cycle Lesson",
  plan: {
    subject: "science",
    grade: "3",
    topic: "Water Cycle",
    duration: "5 days",
    lesson: "JSON string of lesson plan"
  },
  userId: "user-id"
});
```

#### Get All Lesson Plans
```javascript
const lessonPlans = await lessonPlannerAPI.getAll();
```

#### Update Lesson Plan
```javascript
const updated = await lessonPlannerAPI.update("plan-id", {
  title: "Updated Title",
  plan: updatedPlanData
});
```

#### Delete Lesson Plan
```javascript
await lessonPlannerAPI.delete("plan-id");
```

## 🧪 Testing

### Run Test Script
```bash
cd backend
node test-lesson-planner.js
```

This will test all CRUD operations and verify the system is working correctly.

### Manual Testing
1. Start the backend server: `npm start`
2. Start the frontend: `npm run dev`
3. Navigate to `/lesson-planner`
4. Test the AI generation with different topics
5. Verify save and copy functionality

## 🎨 UI Features

### Color Scheme
- **Primary**: Teal (`bg-teal-600`, `text-teal-600`)
- **Hover**: Dark teal (`hover:bg-teal-700`)
- **Borders**: Teal (`border-teal-600`)
- **Background**: Gradient from teal to blue

### Interactive Elements
- **Generate Button**: Teal background with loading state
- **Copy Button**: Teal outline with hover effects
- **Save Button**: Teal outline with loading state
- **Form Elements**: Consistent styling with dark mode support

## 🔒 Security

### Authentication
- All routes protected with `authMiddleware`
- User ID extracted from Firebase JWT token
- Lesson plans are user-specific

### Data Validation
- Input validation on frontend and backend
- API key validation for AI generation
- Error handling for all operations

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Single column layout
- **Tablet**: Two-column grid for form elements
- **Desktop**: Three-column grid for optimal space usage

### Features
- Responsive form layout
- Mobile-friendly button sizes
- Scrollable content areas
- Touch-friendly interactions

## 🚀 Deployment

### Frontend
1. Set environment variables in production
2. Build the application: `npm run build`
3. Deploy to your hosting platform

### Backend
1. Set up Firebase Admin SDK credentials
2. Configure environment variables
3. Deploy to your server/cloud platform

## 🔧 Troubleshooting

### Common Issues

#### API Key Not Working
- Verify `NEXT_PUBLIC_GEMINI_API_KEY` is set correctly
- Check if the API key has proper permissions
- Ensure the key is valid and not expired

#### Lesson Plans Not Saving
- Check Firebase authentication
- Verify user is logged in
- Check network connectivity
- Review browser console for errors

#### AI Generation Failing
- Verify Gemini API key
- Check API quota limits
- Review error messages in console
- Ensure topic is not empty

### Debug Mode
Enable debug logging by adding to your environment:
```bash
DEBUG=true
```

## 📈 Future Enhancements

### Planned Features
- [ ] Lesson plan templates
- [ ] Collaborative editing
- [ ] Export to PDF/Word
- [ ] Integration with school calendars
- [ ] Student progress tracking
- [ ] Advanced AI customization options

### Performance Optimizations
- [ ] Caching for frequently used lesson plans
- [ ] Batch operations for multiple plans
- [ ] Optimized AI prompt engineering
- [ ] Progressive loading for large lesson plans

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the test script output
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

**🎉 Your Lesson Planner is now fully configured and ready to use!** 