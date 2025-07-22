const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  payeer: {
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
  status: {
    type: DataTypes.STRING
  },
  type: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false
});

module.exports = Transaction;
