const admin = require('./config/firebaseAdmin');
const { storiesDb, worksheetsDb, lessonPlansDb, visualAidsDb, readingAssessmentsDb, getUnifiedHistory } = require('./lib/firestore');

// User Management Utility Script
class UserManager {
  constructor() {
    this.db = admin.firestore();
  }

  // List all users
  async listUsers() {
    try {
      const snapshot = await this.db.collection('users').get();
      const users = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          uid: doc.id,
          email: userData.email,
          fullName: userData.fullName,
          createdAt: userData.createdAt,
          ...userData
        });
      });
      
      console.log(`📊 Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ${user.fullName} (${user.email}) - UID: ${user.uid}`);
      });
      
      return users;
    } catch (error) {
      console.error('❌ Error listing users:', error);
      return [];
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const snapshot = await this.db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        console.log(`❌ No user found with email: ${email}`);
        return null;
      }
      
      const doc = snapshot.docs[0];
      const userData = doc.data();
      const user = {
        uid: doc.id,
        email: userData.email,
        fullName: userData.fullName,
        createdAt: userData.createdAt,
        ...userData
      };
      
      console.log(`✅ Found user: ${user.fullName} (${user.email}) - UID: ${user.uid}`);
      return user;
    } catch (error) {
      console.error('❌ Error getting user by email:', error);
      return null;
    }
  }

  // Get user by UID
  async getUserByUID(uid) {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      
      if (!doc.exists) {
        console.log(`❌ No user found with UID: ${uid}`);
        return null;
      }
      
      const userData = doc.data();
      const user = {
        uid: doc.id,
        email: userData.email,
        fullName: userData.fullName,
        createdAt: userData.createdAt,
        ...userData
      };
      
      console.log(`✅ Found user: ${user.fullName} (${user.email}) - UID: ${user.uid}`);
      return user;
    } catch (error) {
      console.error('❌ Error getting user by UID:', error);
      return null;
    }
  }

  // Create a new user
  async createUser(email, fullName, additionalData = {}) {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        console.log(`⚠️ User with email ${email} already exists`);
        return existingUser;
      }

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password: 'tempPassword123!', // User should change this
        displayName: fullName,
      });

      // Store user profile in Firestore
      const userData = {
        fullName,
        email,
        createdAt: new Date(),
        ...additionalData
      };

      await this.db.collection('users').doc(userRecord.uid).set(userData);

      console.log(`✅ Created new user: ${fullName} (${email}) - UID: ${userRecord.uid}`);
      return {
        uid: userRecord.uid,
        email,
        fullName,
        ...userData
      };
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return null;
    }
  }

  // Get user's data summary
  async getUserDataSummary(uid) {
    try {
      const user = await this.getUserByUID(uid);
      if (!user) return null;

      console.log(`\n📊 Data Summary for ${user.fullName} (${user.email}):`);
      
      // Get counts from all collections
      const [stories, worksheets, lessonPlans, visualAids, assessments] = await Promise.all([
        storiesDb.find({ userId: uid }),
        worksheetsDb.find({ userId: uid }),
        lessonPlansDb.find({ userId: uid }),
        visualAidsDb.find({ userId: uid }),
        readingAssessmentsDb.find({ userId: uid })
      ]);

      const summary = {
        user,
        counts: {
          stories: stories.length,
          worksheets: worksheets.length,
          lessonPlans: lessonPlans.length,
          visualAids: visualAids.length,
          assessments: assessments.length
        },
        totalItems: stories.length + worksheets.length + lessonPlans.length + visualAids.length + assessments.length
      };

      console.log(`   📚 Stories: ${summary.counts.stories}`);
      console.log(`   📝 Worksheets: ${summary.counts.worksheets}`);
      console.log(`   📋 Lesson Plans: ${summary.counts.lessonPlans}`);
      console.log(`   🖼️ Visual Aids: ${summary.counts.visualAids}`);
      console.log(`   📊 Assessments: ${summary.counts.assessments}`);
      console.log(`   📈 Total Items: ${summary.totalItems}`);

      return summary;
    } catch (error) {
      console.error('❌ Error getting user data summary:', error);
      return null;
    }
  }

  // Get user's complete history
  async getUserHistory(uid) {
    try {
      const user = await this.getUserByUID(uid);
      if (!user) return null;

      console.log(`\n📜 Complete History for ${user.fullName} (${user.email}):`);
      
      const history = await getUnifiedHistory(uid);
      
      console.log(`   📊 Found ${history.length} items in history`);
      
      // Group by type
      const grouped = history.reduce((acc, item) => {
        const type = item.type || 'unknown';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});

      Object.entries(grouped).forEach(([type, items]) => {
        console.log(`   ${type}: ${items.length} items`);
        items.slice(0, 3).forEach(item => {
          console.log(`     - ${item.title} (${new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()})`);
        });
        if (items.length > 3) {
          console.log(`     ... and ${items.length - 3} more`);
        }
      });

      return history;
    } catch (error) {
      console.error('❌ Error getting user history:', error);
      return [];
    }
  }

  // Delete user and all their data
  async deleteUser(uid) {
    try {
      const user = await this.getUserByUID(uid);
      if (!user) {
        console.log(`❌ User with UID ${uid} not found`);
        return false;
      }

      console.log(`⚠️ WARNING: This will delete user ${user.fullName} (${user.email}) and ALL their data!`);
      console.log('This action cannot be undone.');
      
      // In a real application, you might want to add confirmation here
      // For now, we'll proceed with deletion

      // Delete user's data from all collections
      const collections = [
        { name: 'stories', db: storiesDb },
        { name: 'worksheets', db: worksheetsDb },
        { name: 'lessonPlans', db: lessonPlansDb },
        { name: 'visualAids', db: visualAidsDb },
        { name: 'readingAssessments', db: readingAssessmentsDb }
      ];

      let totalDeleted = 0;
      for (const collection of collections) {
        const items = await collection.db.find({ userId: uid });
        for (const item of items) {
          await collection.db.findByIdAndDelete(item._id);
          totalDeleted++;
        }
        console.log(`   🗑️ Deleted ${items.length} items from ${collection.name}`);
      }

      // Delete user profile
      await this.db.collection('users').doc(uid).delete();
      console.log(`   🗑️ Deleted user profile`);

      // Delete user from Firebase Auth
      await admin.auth().deleteUser(uid);
      console.log(`   🗑️ Deleted user from Firebase Auth`);

      console.log(`✅ Successfully deleted user ${user.fullName} and ${totalDeleted} items of data`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return false;
    }
  }

  // Transfer user's data to another user
  async transferUserData(fromUid, toUid) {
    try {
      const fromUser = await this.getUserByUID(fromUid);
      const toUser = await this.getUserByUID(toUid);
      
      if (!fromUser || !toUser) {
        console.log('❌ One or both users not found');
        return false;
      }

      console.log(`🔄 Transferring data from ${fromUser.fullName} to ${toUser.fullName}...`);

      const collections = [
        { name: 'stories', db: storiesDb },
        { name: 'worksheets', db: worksheetsDb },
        { name: 'lessonPlans', db: lessonPlansDb },
        { name: 'visualAids', db: visualAidsDb },
        { name: 'readingAssessments', db: readingAssessmentsDb }
      ];

      let totalTransferred = 0;
      for (const collection of collections) {
        const items = await collection.db.find({ userId: fromUid });
        for (const item of items) {
          await collection.db.findByIdAndUpdate(item._id, { 
            userId: toUid,
            userEmail: toUser.email,
            userName: toUser.fullName
          });
          totalTransferred++;
        }
        console.log(`   📤 Transferred ${items.length} items from ${collection.name}`);
      }

      console.log(`✅ Successfully transferred ${totalTransferred} items from ${fromUser.fullName} to ${toUser.fullName}`);
      return true;
    } catch (error) {
      console.error('❌ Error transferring user data:', error);
      return false;
    }
  }
}

// Example usage functions
async function exampleUsage() {
  const userManager = new UserManager();
  
  console.log('🔧 User Management Utility Examples:\n');
  
  // List all users
  console.log('1. Listing all users:');
  await userManager.listUsers();
  
  // Create a new user
  console.log('\n2. Creating a new user:');
  const newUser = await userManager.createUser('teacher@school.com', 'Teacher Name', {
    schoolName: 'Example School',
    subjects: ['Math', 'Science']
  });
  
  if (newUser) {
    // Get user data summary
    console.log('\n3. Getting user data summary:');
    await userManager.getUserDataSummary(newUser.uid);
    
    // Get user history
    console.log('\n4. Getting user history:');
    await userManager.getUserHistory(newUser.uid);
  }
}

// Export for use in other scripts
module.exports = { UserManager, exampleUsage };

// Run examples if this script is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
} 