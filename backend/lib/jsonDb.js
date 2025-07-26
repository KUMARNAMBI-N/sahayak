const fs = require('fs');
const path = require('path');

// Database directory
const DB_DIR = path.join(__dirname, '../data');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class JsonDatabase {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filePath = path.join(DB_DIR, `${collectionName}.json`);
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.error(`Error loading ${this.collectionName} data:`, error);
    }
    return [];
  }

  saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error(`Error saving ${this.collectionName} data:`, error);
    }
  }

  // Create
  create(item) {
    const newItem = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.push(newItem);
    this.saveData();
    return newItem;
  }

  // Read all
  find(query = {}) {
    let results = [...this.data];
    
    // Filter by userId if provided
    if (query.userId) {
      results = results.filter(item => item.userId === query.userId);
    }
    
    // Sort by createdAt (newest first)
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return results;
  }

  // Read by ID
  findById(id) {
    return this.data.find(item => item._id === id);
  }

  // Update
  findByIdAndUpdate(id, updateData, options = {}) {
    const index = this.data.findIndex(item => item._id === id);
    if (index === -1) return null;

    this.data[index] = {
      ...this.data[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
    return this.data[index];
  }

  // Delete
  findByIdAndDelete(id) {
    const index = this.data.findIndex(item => item._id === id);
    if (index === -1) return null;

    const deletedItem = this.data.splice(index, 1)[0];
    this.saveData();
    return deletedItem;
  }
}

// Create database instances for each collection
const generateStoryDb = new JsonDatabase('generateStories');
const multigradeWorksheetDb = new JsonDatabase('multigradeWorksheets');
const lessonPlannerDb = new JsonDatabase('lessonPlanners');
const visualAidDb = new JsonDatabase('visualAids');
const readingAssessmentDb = new JsonDatabase('readingAssessments');

module.exports = {
  generateStoryDb,
  multigradeWorksheetDb,
  lessonPlannerDb,
  visualAidDb,
  readingAssessmentDb
}; 