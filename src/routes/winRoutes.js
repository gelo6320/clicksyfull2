// backend/src/routes/winRoutes.js
const express = require('express');
const router = express.Router();
const { getFakeWins } = require('../utils/fakeWins');

// Endpoint to get fake wins
router.get('/', (req, res) => {
  res.json({ wins: getFakeWins() });
});

module.exports = router;