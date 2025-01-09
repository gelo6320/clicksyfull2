// backend/src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referralCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => uuidv4(), // Imposta referralCode automaticamente
  },
  referredBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referrals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  nextClickTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  hasClickedReferral: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role: { // Campo per gestire il ruolo dell'utente
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user', // 'admin' per amministratori
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      console.log('Hook beforeCreate chiamato per l\'utente:', user.email);
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log('Password hashata.');
      }
      // Genera un referralCode unico
      if (!user.referralCode) {
        user.referralCode = uuidv4();
        console.log('ReferralCode generato:', user.referralCode);
      } else {
        console.log('ReferralCode già presente:', user.referralCode);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log('Password aggiornata e hashata.');
      }
    },
  },
});

// Metodo per verificare la password
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;