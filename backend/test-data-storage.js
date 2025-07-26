const { generateStoryDb, multigradeWorksheetDb, lessonPlannerDb, visualAidDb, readingAssessmentDb } = require('./lib/jsonDb');

// Test function to verify database operations
async function testDatabase() {
  console.log('Testing JSON Database...');
  
  try {
    // Test 1: Create a test story
    console.log('\n1. Testing story creation...');
    const testStory = generateStoryDb.create({
      title: 'Test Story',
      content: 'This is a test story content',
      userId: 'test-user-123'
    });
    console.log('✅ Story created:', testStory._id);
    
    // Test 2: Find stories by user
    console.log('\n2. Testing story retrieval...');
    const stories = generateStoryDb.find({ userId: 'test-user-123' });
    console.log('✅ Found stories:', stories.length);
    
    // Test 3: Create a test worksheet
    console.log('\n3. Testing worksheet creation...');
    const testWorksheet = multigradeWorksheetDb.create({
      title: 'Test Worksheet',
      worksheetData: { questions: ['Q1', 'Q2'] },
      userId: 'test-user-123'
    });
    console.log('✅ Worksheet created:', testWorksheet._id);
    
    // Test 4: Find worksheets by user
    console.log('\n4. Testing worksheet retrieval...');
    const worksheets = multigradeWorksheetDb.find({ userId: 'test-user-123' });
    console.log('✅ Found worksheets:', worksheets.length);
    
    // Test 5: Create a test lesson plan
    console.log('\n5. Testing lesson plan creation...');
    const testLessonPlan = lessonPlannerDb.create({
      title: 'Test Lesson Plan',
      plan: { subject: 'Math', grade: '5' },
      userId: 'test-user-123'
    });
    console.log('✅ Lesson plan created:', testLessonPlan._id);
    
    // Test 6: Find lesson plans by user
    console.log('\n6. Testing lesson plan retrieval...');
    const lessonPlans = lessonPlannerDb.find({ userId: 'test-user-123' });
    console.log('✅ Found lesson plans:', lessonPlans.length);
    
    // Test 7: Create a test visual aid
    console.log('\n7. Testing visual aid creation...');
    const testVisualAid = visualAidDb.create({
      title: 'Test Visual Aid',
      aidData: { type: 'diagram', content: 'test diagram' },
      userId: 'test-user-123'
    });
    console.log('✅ Visual aid created:', testVisualAid._id);
    
    // Test 8: Find visual aids by user
    console.log('\n8. Testing visual aid retrieval...');
    const visualAids = visualAidDb.find({ userId: 'test-user-123' });
    console.log('✅ Found visual aids:', visualAids.length);
    
    // Test 9: Create a test assessment
    console.log('\n9. Testing assessment creation...');
    const testAssessment = readingAssessmentDb.create({
      title: 'Test Assessment',
      assessmentData: { score: 85, questions: 10 },
      userId: 'test-user-123'
    });
    console.log('✅ Assessment created:', testAssessment._id);
    
    // Test 10: Find assessments by user
    console.log('\n10. Testing assessment retrieval...');
    const assessments = readingAssessmentDb.find({ userId: 'test-user-123' });
    console.log('✅ Found assessments:', assessments.length);
    
    // Test 11: Test combined history-like query
    console.log('\n11. Testing combined history query...');
    const allItems = [
      ...stories.map(item => ({ ...item, type: 'story' })),
      ...worksheets.map(item => ({ ...item, type: 'worksheet' })),
      ...lessonPlans.map(item => ({ ...item, type: 'lesson-plan' })),
      ...visualAids.map(item => ({ ...item, type: 'visual-aid' })),
      ...assessments.map(item => ({ ...item, type: 'reading-assessment' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log('✅ Combined items:', allItems.length);
    console.log('✅ Items by type:', {
      stories: allItems.filter(item => item.type === 'story').length,
      worksheets: allItems.filter(item => item.type === 'worksheet').length,
      lessonPlans: allItems.filter(item => item.type === 'lesson-plan').length,
      visualAids: allItems.filter(item => item.type === 'visual-aid').length,
      assessments: allItems.filter(item => item.type === 'reading-assessment').length,
    });
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the test
testDatabase(); 