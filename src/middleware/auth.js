// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('authenticateToken middleware chiamato');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('Token mancante.');
    return res.status(401).json({ message: 'Token mancante.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token non valido:', err);
      return res.status(403).json({ message: 'Token non valido.' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;