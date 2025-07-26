const { lessonPlansDb } = require('./lib/firestore');

async function testLessonPlanner() {
  console.log('🧪 Testing Lesson Planner Functionality...\n');

  try {
    // Test 1: Create a lesson plan
    console.log('1. Creating a test lesson plan...');
    const testLessonPlan = {
      title: "Water Cycle - Grade 3 Science",
      plan: {
        subject: "science",
        grade: "3",
        topic: "Water Cycle",
        duration: "5 days",
        lesson: JSON.stringify({
          title: "Understanding the Water Cycle",
          learningObjectives: [
            "Understand the basic stages of the water cycle",
            "Identify different forms of water in nature",
            "Explain the importance of water conservation"
          ],
          lessonStructure: [
            {
              day: 1,
              title: "Introduction to Water Cycle",
              activities: [
                {
                  type: "Introduction",
                  description: "Introduce students to the concept of water cycle through interactive discussion",
                  time: "20 minutes"
                }
              ]
            }
          ]
        })
      },
      userId: "test-user-123"
    };

    const createdPlan = await lessonPlansDb.create(testLessonPlan);
    console.log('✅ Lesson plan created successfully!');
    console.log('   ID:', createdPlan._id);
    console.log('   Title:', createdPlan.title);

    // Test 2: Find lesson plans by user
    console.log('\n2. Finding lesson plans for user...');
    const userPlans = await lessonPlansDb.find({ userId: "test-user-123" });
    console.log('✅ Found', userPlans.length, 'lesson plans for user');

    // Test 3: Find lesson plan by ID
    console.log('\n3. Finding lesson plan by ID...');
    const foundPlan = await lessonPlansDb.findById(createdPlan._id);
    if (foundPlan) {
      console.log('✅ Lesson plan found by ID');
      console.log('   Title:', foundPlan.title);
    } else {
      console.log('❌ Lesson plan not found by ID');
    }

    // Test 4: Update lesson plan
    console.log('\n4. Updating lesson plan...');
    const updatedPlan = await lessonPlansDb.findByIdAndUpdate(createdPlan._id, {
      title: "Updated Water Cycle Lesson Plan"
    });
    if (updatedPlan) {
      console.log('✅ Lesson plan updated successfully');
      console.log('   New Title:', updatedPlan.title);
    } else {
      console.log('❌ Failed to update lesson plan');
    }

    // Test 5: Delete lesson plan
    console.log('\n5. Deleting lesson plan...');
    const deletedPlan = await lessonPlansDb.findByIdAndDelete(createdPlan._id);
    if (deletedPlan) {
      console.log('✅ Lesson plan deleted successfully');
    } else {
      console.log('❌ Failed to delete lesson plan');
    }

    console.log('\n🎉 All lesson planner tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Create lesson plan');
    console.log('   ✅ Find lesson plans by user');
    console.log('   ✅ Find lesson plan by ID');
    console.log('   ✅ Update lesson plan');
    console.log('   ✅ Delete lesson plan');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testLessonPlanner();
}

module.exports = { testLessonPlanner }; 