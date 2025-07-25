const admin = require('../config/firebaseAdmin');

// Register a new user
exports.register = async (req, res) => {
  const { email, password, fullName, ...profile } = req.body;
  try {
    // 1. Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });
    // 2. Store user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      fullName,
      email,
      ...profile,
      createdAt: new Date(),
    });
    res.status(201).json({ message: 'User registered', uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login a user (returns custom token)
exports.login = async (req, res) => {
  // Note: Password login should be handled on the frontend with Firebase Auth SDK.
  res.status(400).json({ error: 'Login with email/password should be handled on the frontend with Firebase Auth SDK.' });
}; 