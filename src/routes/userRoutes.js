// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Verifica il percorso
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');

// Rotte pubbliche
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Rotte protette
router.get('/me', authenticateToken, userController.getCurrentUser);
router.post('/referral', authenticateToken, userController.applyReferral);
router.post('/click', authenticateToken, userController.clickButton);
router.get('/leaderboard', userController.getReferralLeaderboard); // Puoi proteggere questa rotta se necessario

// Rotta per impostare un utente come admin
router.post('/make-admin', authenticateToken, async (req, res) => {
  const { userId } = req.body;
  try {
    const requestingUser = await User.findByPk(req.user.userId);
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Accesso riservato agli amministratori.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }

    user.role = 'admin';
    await user.save();

    console.log(`Utente ${user.email} impostato come admin.`);
    res.json({ message: 'Utente impostato come admin.' });
  } catch (error) {
    console.error('Errore durante l\'impostazione di admin:', error);
    res.status(500).json({ message: 'Errore del server.' });
  }
});

module.exports = router;