// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/auth'); // added
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken'); // add import

// Registrazione
router.post('/register', async (req, res) => {
  const { email, password, referredBy } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata.' });
    }
    const newUser = await User.create({ email, password, referredBy });
    res.status(201).json({ message: 'Registrazione riuscita.', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, password } }); // Nota: Usa hash per password in produzione
    if (!user) {
      return res.status(400).json({ message: 'Credenziali non valide.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // token valido per 7 giorni
    );

    res.status(200).json({ message: 'Login riuscito.', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'email', 'referralCode', 'nextClickTime', 'referrals']
    });
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

// Rotta per applicare referral
router.post('/referral', authenticateToken, async (req, res) => { // protect the route
  const { refCode } = req.body;
  const userId = req.user.userId;
  try {
    const inviter = await User.findOne({ where: { referralCode: refCode } });
    if (!inviter) {
      return res.status(400).json({ message: 'Referral code non valido.' });
    }

    const invitee = await User.findByPk(userId);
    if (!invitee) {
      return res.status(400).json({ message: 'Utente non trovato.' });
    }

    if (invitee.referredBy) {
      return res.status(400).json({ message: 'Referral già applicato.' });
    }

    // Applica il referral
    invitee.referredBy = refCode;
    await invitee.save();

    // Incrementa il contatore di referrals dell'invitante
    inviter.referrals += 1;
    await inviter.save();

    res.status(200).json({ message: 'Referral applicato correttamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

// Click route, now protected
router.post('/click', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // From JWT
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: 'Utente non trovato.' });
    }

    let nextClickTime = new Date();
    let discountHours = 0;

    if (user.referredBy && !user.hasClickedReferral) {
      // Invitato tramite referral
      discountHours = 10;
      user.hasClickedReferral = true;
      await user.save();

      // Togli 6 ore al timer dell'invitante
      const inviter = await User.findOne({ where: { referralCode: user.referredBy } });
      if (inviter) {
        const ownerNextClick = inviter.nextClickTime ? inviter.nextClickTime : new Date();
        const newOwnerNextClick = new Date(ownerNextClick.getTime() - 6 * 60 * 60 * 1000);
        inviter.nextClickTime = newOwnerNextClick > new Date() ? newOwnerNextClick : new Date();
        inviter.referrals += 1; // aggiorna classifica
        await inviter.save();
      }
    }

    // Imposta il prossimo click
    nextClickTime.setHours(nextClickTime.getHours() + 24 - discountHours);

    res.status(200).json({ message: 'Click registrato.', nextClickTime });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

module.exports = router;