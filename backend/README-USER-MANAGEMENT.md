# SAHAYAK User-Based Data Management

This document explains how to use the user-based data storage system in SAHAYAK.

## 🔐 How User-Based Data Works

### Authentication Flow
1. **User Registration**: Users register through the frontend (`/get-started` page)
2. **Firebase Auth**: User account is created in Firebase Authentication
3. **Firestore Profile**: User profile is stored in Firestore `users` collection
4. **Data Association**: All user-generated content is linked to their UID

### Data Storage Structure
```
Firestore Collections:
├── users/                    # User profiles
│   └── {uid}/               # Each user's profile data
├── stories/                  # Generated stories
│   └── {docId}/             # Story documents with userId field
├── worksheets/               # Multi-grade worksheets
│   └── {docId}/             # Worksheet documents with userId field
├── lessonPlans/              # Lesson plans
│   └── {docId}/             # Lesson plan documents with userId field
├── visualAids/               # Visual aids
│   └── {docId}/             # Visual aid documents with userId field
└── readingAssessments/       # Reading assessments
    └── {docId}/             # Assessment documents with userId field
```

### Security Features
- **Authentication Required**: All data endpoints require valid Firebase ID token
- **User Isolation**: Users can only access their own data
- **Automatic Filtering**: All queries automatically filter by `userId`
- **Middleware Protection**: Routes are protected with `authMiddleware`

## 🚀 Getting Started

### 1. Run Migration (if you have existing data)
```bash
cd backend
node migrate-to-firestore.js
```

This will:
- Create users for existing data
- Migrate all data with proper user associations
- Create a default user if no users exist

### 2. Use the User Management CLI
```bash
# List all users
node manage-users.js list

# Create a new user
node manage-users.js create teacher@school.com "Teacher Name"

# Find user by email
node manage-users.js find teacher@school.com

# Get user data summary
node manage-users.js summary <uid>

# Get user complete history
node manage-users.js history <uid>

# Transfer data between users
node manage-users.js transfer <fromUid> <toUid>

# Delete user (WARNING: This deletes all user data)
node manage-users.js delete <uid>
```

## 📊 User Management Features

### User Creation
```javascript
const { UserManager } = require('./user-management');
const userManager = new UserManager();

// Create a new user
const user = await userManager.createUser('teacher@school.com', 'Teacher Name', {
  schoolName: 'Example School',
  subjects: ['Math', 'Science'],
  gradeRange: '4-6'
});
```

### Data Retrieval
```javascript
// Get user by email
const user = await userManager.getUserByEmail('teacher@school.com');

// Get user by UID
const user = await userManager.getUserByUID('abc123uid');

// Get user's data summary
const summary = await userManager.getUserDataSummary(user.uid);
// Returns: { user, counts: { stories, worksheets, ... }, totalItems }

// Get user's complete history
const history = await userManager.getUserHistory(user.uid);
// Returns: Array of all user's items sorted by date
```

### Data Transfer
```javascript
// Transfer all data from one user to another
await userManager.transferUserData('oldUserUid', 'newUserUid');
```

## 🔧 API Endpoints

All endpoints require authentication via Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Stories
- `POST /api/stories` - Create new story
- `GET /api/stories` - Get user's stories (history)
- `GET /api/stories/:id` - Get specific story
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

### Worksheets
- `POST /api/worksheets` - Create new worksheet
- `GET /api/worksheets` - Get user's worksheets
- `GET /api/worksheets/:id` - Get specific worksheet
- `PUT /api/worksheets/:id` - Update worksheet
- `DELETE /api/worksheets/:id` - Delete worksheet

### Lesson Plans
- `POST /api/lesson-plans` - Create new lesson plan
- `GET /api/lesson-plans` - Get user's lesson plans
- `GET /api/lesson-plans/:id` - Get specific lesson plan
- `PUT /api/lesson-plans/:id` - Update lesson plan
- `DELETE /api/lesson-plans/:id` - Delete lesson plan

### Visual Aids
- `POST /api/visual-aids` - Create new visual aid
- `GET /api/visual-aids` - Get user's visual aids
- `GET /api/visual-aids/:id` - Get specific visual aid
- `PUT /api/visual-aids/:id` - Update visual aid
- `DELETE /api/visual-aids/:id` - Delete visual aid

### Reading Assessments
- `POST /api/reading-assessments` - Create new assessment
- `GET /api/reading-assessments` - Get user's assessments
- `GET /api/reading-assessments/:id` - Get specific assessment
- `PUT /api/reading-assessments/:id` - Update assessment
- `DELETE /api/reading-assessments/:id` - Delete assessment

### Unified History
- `GET /api/history` - Get all user's data in unified format

### User Profile
- `GET /api/profile/:uid` - Get user profile
- `PUT /api/profile/:uid` - Update user profile

## 🔒 Security Best Practices

### Frontend Implementation
```javascript
// Get Firebase ID token
const idToken = await auth.currentUser?.getIdToken();

// Make authenticated API calls
const response = await fetch('/api/stories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({ title, content })
});
```

### Backend Validation
```javascript
// Controllers automatically get user from auth middleware
const createStory = async (req, res) => {
  const userId = req.user.uid; // From Firebase auth
  const story = await storiesDb.create({
    title: req.body.title,
    content: req.body.content,
    userId // Automatically associated with user
  });
};
```

## 📈 Data Analytics

### User Activity Tracking
The system automatically tracks:
- Creation timestamps for all items
- User associations for all data
- Activity history across all features

### Usage Statistics
```javascript
// Get user's activity summary
const summary = await userManager.getUserDataSummary(user.uid);
console.log(`User has created ${summary.totalItems} items total`);
console.log(`Stories: ${summary.counts.stories}`);
console.log(`Worksheets: ${summary.counts.worksheets}`);
// etc.
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Ensure Firebase ID token is valid
   - Check that token is included in Authorization header
   - Verify user exists in Firebase Auth

2. **"User not found" errors**
   - Check if user profile exists in Firestore
   - Verify UID matches between Auth and Firestore

3. **Data not showing up**
   - Ensure `userId` field is properly set
   - Check that queries include user filter
   - Verify authentication middleware is applied

### Debug Commands
```bash
# Check if user exists
node manage-users.js find user@example.com

# Get user's data summary
node manage-users.js summary <uid>

# Check user's complete history
node manage-users.js history <uid>
```

## 🔄 Migration Support

If you have existing data without user associations:

1. **Run migration script**:
   ```bash
   node migrate-to-firestore.js
   ```

2. **Verify migration**:
   ```bash
   node manage-users.js list
   node manage-users.js summary <default-user-uid>
   ```

3. **Reassign data to specific users**:
   ```bash
   node manage-users.js transfer <default-uid> <specific-user-uid>
   ```

## 📞 Support

For issues with user management:
1. Check the troubleshooting section above
2. Use the CLI tools to diagnose problems
3. Review Firebase console for authentication issues
4. Check Firestore console for data structure issues 