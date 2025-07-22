const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Commission = sequelize.define('Commission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  payeer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  referer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  profit: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  timestamps: false,
  tableName: 'commissions' // Fixing the spelling from "Commition" to "Commission"
});

module.exports = Commission;
