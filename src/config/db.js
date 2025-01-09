const { Sequelize } = require('sequelize');

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      // A volte è necessario disattivare la verifica del certificato
      // se Render non usa certificati rilasciati da CA pubblica
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;
