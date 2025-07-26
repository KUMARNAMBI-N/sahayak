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

// Delete a chat session
exports.deleteSession = async (req, res) => {
  const { uid, sessionId } = req.params;
  try {
    const docRef = admin.firestore().collection('chatSessions').doc(sessionId);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().uid !== uid) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }
    await docRef.delete();
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a chat session (partial update)
exports.updateSession = async (req, res) => {
  const { uid, sessionId } = req.params;
  const updateData = req.body;
  try {
    const docRef = admin.firestore().collection('chatSessions').doc(sessionId);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().uid !== uid) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }
    await docRef.set(updateData, { merge: true });
    res.json({ message: 'Session updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 