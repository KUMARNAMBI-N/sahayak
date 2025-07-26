const admin = require('../config/firebaseAdmin');
const db = admin.firestore();

exports.saveFeedback = async (req, res) => {
  try {
    console.log("Received feedback:", req.body);
    const { userId, feature, inputPrompt, outputContent, rating, comment } = req.body;
    await db.collection('feedback').add({
      userId,
      feature,
      inputPrompt,
      outputContent,
      rating,
      comment,
      timestamp: new Date()
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: 'Failed to save feedback.' });
  }
};