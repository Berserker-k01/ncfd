const { DataTypes } = require('sequelize');
const sequelize = require('../../database');
const shortid = require('shortid');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  payeer: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  joined: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  referid: {
    type: DataTypes.STRING,
    defaultValue: () => shortid.generate()
  },
  referer: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: false
});

module.exports = User;
