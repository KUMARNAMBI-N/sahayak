const admin = require('../config/firebaseAdmin');

// Firestore database reference
const db = admin.firestore();

// Collection names
const COLLECTIONS = {
  STORIES: 'stories',
  WORKSHEETS: 'worksheets', 
  LESSON_PLANS: 'lessonPlans',
  VISUAL_AIDS: 'visualAids',
  READING_ASSESSMENTS: 'readingAssessments',
  LIBRARY: 'library'
};

// Generic CRUD operations for Firestore
class FirestoreDatabase {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = db.collection(collectionName);
  }

  // Create a new document
  async create(data) {
    try {
      const docRef = await this.collectionRef.add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const doc = await docRef.get();
      return {
        _id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Find documents with query
  async find(query = {}) {
    try {
      let queryRef = this.collectionRef;
      
      // Apply filters
      if (query.userId) {
        queryRef = queryRef.where('userId', '==', query.userId);
      }
      
      // Get documents
      const snapshot = await queryRef.orderBy('createdAt', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error finding documents in ${this.collectionName}:`, error);
      return [];
    }
  }

  // Find document by ID
  async findById(id) {
    try {
      const doc = await this.collectionRef.doc(id).get();
      if (!doc.exists) return null;
      
      return {
        _id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Error finding document by ID in ${this.collectionName}:`, error);
      return null;
    }
  }

  // Update document by ID
  async findByIdAndUpdate(id, updateData) {
    try {
      const docRef = this.collectionRef.doc(id);
      await docRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const updatedDoc = await docRef.get();
      return {
        _id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      return null;
    }
  }

  // Delete document by ID
  async findByIdAndDelete(id) {
    try {
      const docRef = this.collectionRef.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) return null;
      
      await docRef.delete();
      return {
        _id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Error deleting document in ${this.collectionName}:`, error);
      return null;
    }
  }
}

// Create database instances for each collection
const storiesDb = new FirestoreDatabase(COLLECTIONS.STORIES);
const worksheetsDb = new FirestoreDatabase(COLLECTIONS.WORKSHEETS);
const lessonPlansDb = new FirestoreDatabase(COLLECTIONS.LESSON_PLANS);
const visualAidsDb = new FirestoreDatabase(COLLECTIONS.VISUAL_AIDS);
const readingAssessmentsDb = new FirestoreDatabase(COLLECTIONS.READING_ASSESSMENTS);

// Unified history function
async function getUnifiedHistory(userId) {
  try {
    console.log('Getting unified history for user:', userId);
    
    // Get data from all collections
    const [stories, worksheets, lessonPlans, visualAids, assessments] = await Promise.all([
      storiesDb.find({ userId }),
      worksheetsDb.find({ userId }),
      lessonPlansDb.find({ userId }),
      visualAidsDb.find({ userId }),
      readingAssessmentsDb.find({ userId })
    ]);

    console.log('Found items:', {
      stories: stories.length,
      worksheets: worksheets.length,
      lessonPlans: lessonPlans.length,
      visualAids: visualAids.length,
      assessments: assessments.length
    });

    // Combine and sort all items
    const allItems = [
      ...stories.map(item => ({ ...item, type: 'story' })),
      ...worksheets.map(item => ({ ...item, type: 'worksheet' })),
      ...lessonPlans.map(item => ({ ...item, type: 'lesson-plan' })),
      ...visualAids.map(item => ({ ...item, type: 'visual-aid' })),
      ...assessments.map(item => ({ ...item, type: 'reading-assessment' }))
    ].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    });

    console.log('Total items in unified history:', allItems.length);
    return allItems;
  } catch (error) {
    console.error('Error getting unified history:', error);
    return [];
  }
}

module.exports = {
  storiesDb,
  worksheetsDb,
  lessonPlansDb,
  visualAidsDb,
  readingAssessmentsDb,
  getUnifiedHistory,
  COLLECTIONS
}; 