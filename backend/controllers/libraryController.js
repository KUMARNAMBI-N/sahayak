const admin = require('../config/firebaseAdmin');

// Create a new library item
exports.createLibraryItem = async (req, res) => {
  try {
    const data = req.body;
    const docRef = await admin.firestore().collection('library').add({
      ...data,
      createdAt: new Date(),
    });
    res.json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all library items for a user
exports.getLibraryItemsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const snapshot = await admin.firestore().collection('library').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a library item
exports.updateLibraryItem = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    await admin.firestore().collection('library').doc(id).set(updateData, { merge: true });
    res.json({ message: 'Item updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a library item
exports.deleteLibraryItem = async (req, res) => {
  const { id } = req.params;
  try {
    await admin.firestore().collection('library').doc(id).delete();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 