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