const admin = require('../config/firebaseAdmin');

// Get user profile by UID
exports.getProfile = async (req, res) => {
  const { uid } = req.params;
  try {
    const doc = await admin.firestore().collection('users').doc(uid).get();
    if (!doc.exists) {
      console.error(`[PROFILE] No document for UID: ${uid}`);
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(doc.data());
  } catch (error) {
    console.error(`[PROFILE] Error fetching profile for UID ${uid}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile by UID
exports.updateProfile = async (req, res) => {
  const { uid } = req.params;
  const profileData = req.body;
  try {
    await admin.firestore().collection('users').doc(uid).set(profileData, { merge: true });
    res.json({ message: 'Profile updated' });
  } catch (error) {
    console.error(`[PROFILE] Error updating profile for UID ${uid}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard statistics for a user
exports.getDashboardStats = async (req, res) => {
  const { uid } = req.params;
  try {
    const snapshot = await admin.firestore().collection('library').where('userId', '==', uid).get();
    let storiesCreated = 0;
    let worksheetsGenerated = 0;
    let visualAids = 0;
    let studentsHelped = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'story') storiesCreated++;
      if (data.type === 'worksheet') worksheetsGenerated++;
      if (data.type === 'visual-aid') visualAids++;
      if (data.metadata && typeof data.metadata.studentsHelped === 'number') {
        studentsHelped += data.metadata.studentsHelped;
      }
    });
    res.json({ storiesCreated, worksheetsGenerated, visualAids, studentsHelped });
  } catch (error) {
    console.error(`[DASHBOARD] Error fetching stats for UID ${uid}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Get recent activities for a user
exports.getRecentActivities = async (req, res) => {
  const { uid } = req.params;
  try {
    let snapshot;
    try {
      snapshot = await admin.firestore()
        .collection('library')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
    } catch (err) {
      // If index error, fallback to fetching all and sorting in JS
      if (err.code === 9 || (err.message && err.message.includes('index'))) {
        const allSnap = await admin.firestore()
          .collection('library')
          .where('userId', '==', uid)
          .get();
        const docs = allSnap.docs
          .map(doc => ({
            doc,
            createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(0)
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5);
        const activities = docs.map(({ doc }) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type,
            title: data.title,
            subject: data.metadata?.subject,
            grade: data.metadata?.grade,
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
          };
        });
        return res.json(activities);
      } else {
        throw err;
      }
    }
    const activities = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        title: data.title,
        subject: data.metadata?.subject,
        grade: data.metadata?.grade,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
      };
    });
    res.json(activities);
  } catch (error) {
    console.error(`[ACTIVITIES] Error fetching recent activities for UID ${uid}:`, error);
    res.status(500).json({ error: error.message });
  }
}; 