// backend/src/controllers/userController.js
const User = require('../models/User');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

module.exports = {
  // Registrazione utente
  registerUser: async (req, res) => {
    console.log('registerUser chiamato');
    try {
      const { email, password, referredBy } = req.body;

      console.log('Registrazione richiesta:', { email, referredBy });

      if (!email || !password) {
        console.log('Email o password mancanti.');
        return res.status(400).json({ message: 'Email e password sono richieste.' });
      }

      // Controlla se l'utente esiste già
      let existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log('Email già registrata:', email);
        return res.status(400).json({ message: 'Email già registrata.' });
      }

      // Crea l'utente
      const newUser = await User.create({
        email,
        password,  // Hashato automaticamente grazie ai hook
        referredBy: referredBy || null,
      });

      console.log('Utente registrato con successo:', newUser.email);

      res.status(201).json({ 
        message: 'Utente registrato con successo.',
        user: {
          id: newUser.id,
          email: newUser.email,
          referralCode: newUser.referralCode,
        }
      });
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      res.status(500).json({ message: 'Errore interno del server.' });
    }
  },

  // Login utente
  loginUser: async (req, res) => {
    console.log('loginUser chiamato');
    try {
      const { email, password } = req.body;
      console.log('Login richiesto:', { email });

      if (!email || !password) {
        console.log('Email o password mancanti.');
        return res.status(400).json({ message: 'Email e password sono richieste.' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log('Utente non trovato:', email);
        return res.status(404).json({ message: 'Utente non trovato.' });
      }

      const isMatch = await user.validPassword(password);
      if (!isMatch) {
        console.log('Password non valida per:', email);
        return res.status(401).json({ message: 'Credenziali non valide.' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('Login effettuato per:', email);

      res.status(200).json({ 
        message: 'Login effettuato.',
        token,
        user: {
          id: user.id,
          email: user.email,
          referralCode: user.referralCode,
          nextClickTime: user.nextClickTime,
          referrals: user.referrals,
        }
      });
    } catch (err) {
      console.error('Errore durante il login:', err);
      res.status(500).json({ message: 'Errore interno del server.' });
    }
  },

  // Recupera i dati dell'utente corrente
  getCurrentUser: async (req, res) => {
    console.log('getCurrentUser chiamato');
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: ['id', 'email', 'referralCode', 'nextClickTime', 'referrals']
      });
      if (!user) {
        console.log('Utente non trovato:', req.user.userId);
        return res.status(404).json({ message: 'Utente non trovato.' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Errore nel recupero dell\'utente:', error);
      res.status(500).json({ message: 'Errore interno del server.' });
    }
  },

  // Applica un referral
  applyReferral: async (req, res) => {
    console.log('applyReferral chiamato');
    const { refCode } = req.body;
    const userId = req.user.userId;
    try {
      console.log(`Applicazione referral: utente=${userId}, refCode=${refCode}`);
      const inviter = await User.findOne({ where: { referralCode: refCode } });
      if (!inviter) {
        console.log('Referral code non valido:', refCode);
        return res.status(400).json({ message: 'Referral code non valido.' });
      }

      const invitee = await User.findByPk(userId);
      if (!invitee) {
        console.log('Utente non trovato:', userId);
        return res.status(400).json({ message: 'Utente non trovato.' });
      }

      if (invitee.referredBy) {
        console.log('Referral già applicato per:', invitee.email);
        return res.status(400).json({ message: 'Referral già applicato.' });
      }

      // Applica il referral
      invitee.referredBy = refCode;
      // Imposta il nextClickTime a 10 ore dalla registrazione se non è mai stato impostato
      if (!invitee.nextClickTime) {
        const now = new Date();
        const nextClickDate = new Date(now.getTime() + 10 * 60 * 60 * 1000);
        invitee.nextClickTime = nextClickDate;
      }
      await invitee.save();

      // Incrementa il contatore di referrals dell'invitante
      inviter.referrals += 1;
      await inviter.save();

      console.log(`Referral applicato: ${invitee.email} invitato da ${inviter.email}`);

      res.status(200).json({ message: 'Referral applicato correttamente.' });
    } catch (error) {
      console.error('Errore durante l\'applicazione del referral:', error);
      res.status(500).json({ message: 'Errore del server.' });
    }
  },

  // Rotta per cliccare il pulsante "ritira"
  clickButton: async (req, res) => {
    console.log('clickButton chiamato');
    const userId = req.user.userId; // From JWT
    try {
      console.log('Click button ricevuto per utente:', userId);
      const user = await User.findByPk(userId);
      if (!user) {
        console.log('Utente non trovato:', userId);
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
          console.log(`Ridotto timer per l'invitante: ${inviter.email}`);
        }
      }

      // Imposta il prossimo click
      nextClickTime.setHours(nextClickTime.getHours() + 24 - discountHours);

      console.log(`Impostato nextClickTime per ${user.email}: ${nextClickTime}`);

      res.status(200).json({ message: 'Click registrato.', nextClickTime });
    } catch (error) {
      console.error('Errore durante il click:', error);
      res.status(500).json({ message: 'Errore del server.' });
    }
  },

  // Recupera la classifica dei referrals
  getReferralLeaderboard: async (req, res) => {
    console.log('getReferralLeaderboard chiamato');
    try {
      console.log('Recupero classifica referrals.');
      const topReferrers = await User.findAll({
        where: {
          referrals: {
            [Op.gt]: 0
          }
        },
        order: [['referrals', 'DESC']],
        limit: 10,
        attributes: ['email', 'referrals']
      });
      res.status(200).json({ leaderboard: topReferrers });
    } catch (error) {
      console.error('Errore nel recupero della classifica:', error);
      res.status(500).json({ message: 'Errore del server.' });
    }
  }
};