const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Deposit = sequelize.define('Deposit', {
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
  end: {
    type: DataTypes.DATE,
    defaultValue: () => {
      const now = new Date();
      const h24 = 1000 * 60 * 60 * 24;
      return new Date(now.getTime() + h24);
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  profit: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  closed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false
});

module.exports = Deposit;
