const { storiesDb, worksheetsDb, lessonPlansDb, visualAidsDb, readingAssessmentsDb } = require('./lib/firestore');
const admin = require('./config/firebaseAdmin');
const fs = require('fs');
const path = require('path');

// Migration script to move data from JSON files to Firestore with user-based storage
async function migrateToFirestore() {
  console.log('🚀 Starting migration to Firestore with user-based storage...');
  
  try {
    // First, let's check if we have any existing users in Firestore
    const usersSnapshot = await admin.firestore().collection('users').get();
    const existingUsers = {};
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      existingUsers[userData.email] = doc.id; // Map email to UID
    });
    
    console.log(`📊 Found ${Object.keys(existingUsers).length} existing users in Firestore`);
    
    // If no users exist, create a default user for migration
    let defaultUserId = null;
    if (Object.keys(existingUsers).length === 0) {
      console.log('⚠️ No users found. Creating a default user for migration...');
      try {
        const userRecord = await admin.auth().createUser({
          email: 'default@sahayak.com',
          password: 'defaultPassword123!',
          displayName: 'Default User',
        });
        
        await admin.firestore().collection('users').doc(userRecord.uid).set({
          fullName: 'Default User',
          email: 'default@sahayak.com',
          createdAt: new Date(),
        });
        
        defaultUserId = userRecord.uid;
        existingUsers['default@sahayak.com'] = userRecord.uid;
        console.log('✅ Created default user for migration');
      } catch (error) {
        console.error('❌ Failed to create default user:', error.message);
        return;
      }
    }

    // Function to get or create user ID
    const getUserOrCreate = async (email, fullName = 'Unknown User') => {
      if (existingUsers[email]) {
        return existingUsers[email];
      }
      
      try {
        const userRecord = await admin.auth().createUser({
          email,
          password: 'tempPassword123!', // User should change this
          displayName: fullName,
        });
        
        await admin.firestore().collection('users').doc(userRecord.uid).set({
          fullName,
          email,
          createdAt: new Date(),
        });
        
        existingUsers[email] = userRecord.uid;
        console.log(`✅ Created new user: ${email}`);
        return userRecord.uid;
      } catch (error) {
        console.error(`❌ Failed to create user ${email}:`, error.message);
        return defaultUserId;
      }
    };

    // Migrate stories
    console.log('\n📚 Migrating stories...');
    const storiesPath = path.join(__dirname, 'data', 'generateStories.json');
    if (fs.existsSync(storiesPath)) {
      const storiesData = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
      for (const story of storiesData) {
        try {
          const userId = story.userId || story.userEmail ? 
            await getUserOrCreate(story.userEmail, story.userName) : 
            defaultUserId;
          
          await storiesDb.create({
            title: story.title,
            content: story.content,
            userId: userId,
            userEmail: story.userEmail || 'default@sahayak.com',
            userName: story.userName || 'Default User'
          });
          console.log(`✅ Migrated story: ${story.title} (User: ${story.userEmail || 'default'})`);
        } catch (error) {
          console.error(`❌ Failed to migrate story: ${story.title}`, error.message);
        }
      }
    }

    // Migrate worksheets
    console.log('\n📝 Migrating worksheets...');
    const worksheetsPath = path.join(__dirname, 'data', 'multigradeWorksheets.json');
    if (fs.existsSync(worksheetsPath)) {
      const worksheetsData = JSON.parse(fs.readFileSync(worksheetsPath, 'utf8'));
      for (const worksheet of worksheetsData) {
        try {
          const userId = worksheet.userId || worksheet.userEmail ? 
            await getUserOrCreate(worksheet.userEmail, worksheet.userName) : 
            defaultUserId;
          
          await worksheetsDb.create({
            title: worksheet.title,
            worksheetData: worksheet.worksheetData,
            userId: userId,
            userEmail: worksheet.userEmail || 'default@sahayak.com',
            userName: worksheet.userName || 'Default User'
          });
          console.log(`✅ Migrated worksheet: ${worksheet.title} (User: ${worksheet.userEmail || 'default'})`);
        } catch (error) {
          console.error(`❌ Failed to migrate worksheet: ${worksheet.title}`, error.message);
        }
      }
    }

    // Check for other collections
    const lessonPlansPath = path.join(__dirname, 'data', 'lessonPlanners.json');
    if (fs.existsSync(lessonPlansPath)) {
      console.log('\n📋 Migrating lesson plans...');
      const lessonPlansData = JSON.parse(fs.readFileSync(lessonPlansPath, 'utf8'));
      for (const plan of lessonPlansData) {
        try {
          const userId = plan.userId || plan.userEmail ? 
            await getUserOrCreate(plan.userEmail, plan.userName) : 
            defaultUserId;
          
          await lessonPlansDb.create({
            title: plan.title,
            plan: plan.plan,
            userId: userId,
            userEmail: plan.userEmail || 'default@sahayak.com',
            userName: plan.userName || 'Default User'
          });
          console.log(`✅ Migrated lesson plan: ${plan.title} (User: ${plan.userEmail || 'default'})`);
        } catch (error) {
          console.error(`❌ Failed to migrate lesson plan: ${plan.title}`, error.message);
        }
      }
    }

    const visualAidsPath = path.join(__dirname, 'data', 'visualAids.json');
    if (fs.existsSync(visualAidsPath)) {
      console.log('\n🖼️ Migrating visual aids...');
      const visualAidsData = JSON.parse(fs.readFileSync(visualAidsPath, 'utf8'));
      for (const aid of visualAidsData) {
        try {
          const userId = aid.userId || aid.userEmail ? 
            await getUserOrCreate(aid.userEmail, aid.userName) : 
            defaultUserId;
          
          await visualAidsDb.create({
            title: aid.title,
            aidData: aid.aidData,
            userId: userId,
            userEmail: aid.userEmail || 'default@sahayak.com',
            userName: aid.userName || 'Default User'
          });
          console.log(`✅ Migrated visual aid: ${aid.title} (User: ${aid.userEmail || 'default'})`);
        } catch (error) {
          console.error(`❌ Failed to migrate visual aid: ${aid.title}`, error.message);
        }
      }
    }

    const assessmentsPath = path.join(__dirname, 'data', 'readingAssessments.json');
    if (fs.existsSync(assessmentsPath)) {
      console.log('\n📊 Migrating reading assessments...');
      const assessmentsData = JSON.parse(fs.readFileSync(assessmentsPath, 'utf8'));
      for (const assessment of assessmentsData) {
        try {
          const userId = assessment.userId || assessment.userEmail ? 
            await getUserOrCreate(assessment.userEmail, assessment.userName) : 
            defaultUserId;
          
          await readingAssessmentsDb.create({
            title: assessment.title,
            assessmentData: assessment.assessmentData,
            userId: userId,
            userEmail: assessment.userEmail || 'default@sahayak.com',
            userName: assessment.userName || 'Default User'
          });
          console.log(`✅ Migrated assessment: ${assessment.title} (User: ${assessment.userEmail || 'default'})`);
        } catch (error) {
          console.error(`❌ Failed to migrate assessment: ${assessment.title}`, error.message);
        }
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Your data is now stored in Firestore collections with user-based access:');
    console.log('   - stories (filtered by userId)');
    console.log('   - worksheets (filtered by userId)');
    console.log('   - lessonPlans (filtered by userId)');
    console.log('   - visualAids (filtered by userId)');
    console.log('   - readingAssessments (filtered by userId)');
    console.log('   - users (user profiles)');
    
    console.log('\n🔑 User Management:');
    console.log(`   - Total users created: ${Object.keys(existingUsers).length}`);
    console.log('   - Each user can only access their own data');
    console.log('   - Data is automatically filtered by userId in all queries');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrateToFirestore(); 