// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const User = require('../models/User'); // Importa il modello User

// Middleware per autenticazione admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Accesso riservato agli amministratori.' });
    }
  } catch (error) {
    console.error('Errore nell\'autenticazione admin:', error);
    res.status(500).json({ message: 'Errore del server.' });
  }
};

// Rotte Admin
router.post('/change-button-style', authenticateToken, authenticateAdmin, adminController.changeButtonStyle);
router.post('/generate-referral-link', authenticateToken, authenticateAdmin, adminController.generateCustomRefLink);
router.post('/change-background', authenticateToken, authenticateAdmin, adminController.changeBackground);
router.post('/add-extra-section', authenticateToken, authenticateAdmin, adminController.addExtraSection);

module.exports = router;