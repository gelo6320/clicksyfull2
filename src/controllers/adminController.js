// backend/src/controllers/adminController.js
const User = require('../models/User');

module.exports = {
  // Cambia stile del pulsante
  changeButtonStyle: async (req, res) => {
    try {
      const { newStyle } = req.body;
      // Logica per aggiornare lo stile del pulsante, ad esempio salvando in DB
      // Questo è un mock per mostrare la risposta
      console.log('Cambio stile pulsante con:', newStyle);
      res.json({ message: 'Stile del pulsante aggiornato con successo!' });
    } catch (error) {
      console.error('Errore durante il cambio dello stile del pulsante:', error);
      res.status(500).json({ message: 'Errore del server.' });
    }
  },

  // Genera link referral personalizzato
  generateCustomRefLink: async (req, res) => {
    try {
      const { customText } = req.body;
      const link = `https://miosito.com/?ref=${customText}`;
      console.log('Generazione link referral personalizzato:', link);
      res.json({ link });
    } catch (error) {
      console.error('Errore durante la generazione del link referral:', error);
      res.status(500).json({ message: 'Errore del server.' });
    }
  },

  // Cambia lo sfondo del sito
  changeBackground: async (req, res) => {
    try {
      const { backgroundUrl } = req.body;
      // Logica per cambiare lo sfondo, ad esempio salvando in DB
      // Questo è un mock per mostrare la risposta
      console.log('Cambio sfondo del sito con:', backgroundUrl);
      res.json({ message: 'Sfondo del sito aggiornato con successo!' });
    } catch (error) {
      console.error('Errore durante il cambio dello sfondo:', error);
      res.status(500).json({ message: 'Errore del server.' });
    }
  },

  // Aggiungi sezione extra
  addExtraSection: async (req, res) => {
    try {
      const { sectionContent } = req.body;
      // Logica per aggiungere una sezione extra, ad esempio salvando in DB
      // Questo è un mock per mostrare la risposta
      console.log('Aggiunta sezione extra:', sectionContent);
      res.json({ message: 'Sezione extra aggiunta con successo!' });
    } catch (error) {
      console.error('Errore durante l\'aggiunta della sezione extra:', error);
      res.status(500).json({ message: 'Errore del server.' });
    }
  }
};