const { Sequelize } = require('sequelize');
const config = require('../config.json');

const sequelize = new Sequelize(config.postgres.database, config.postgres.username, config.postgres.password, {
  host: config.postgres.host,
  port: config.postgres.port || 5432,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
