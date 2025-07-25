const admin = require('../config/firebaseAdmin');

// Get all chat sessions for a user (flat table)
exports.getSessions = async (req, res) => {
  const { uid } = req.params;
  try {
    const snapshot = await admin.firestore()
      .collection('chatSessions')
      .where('uid', '==', uid)
      .get();
    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save or update a chat session (flat table)
exports.saveSession = async (req, res) => {
  const { uid, sessionId } = req.params;
  const sessionData = req.body;
  try {
    await admin.firestore()
      .collection('chatSessions')
      .doc(sessionId)
      .set({ ...sessionData, uid }, { merge: true });
    res.json({ message: 'Session saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 