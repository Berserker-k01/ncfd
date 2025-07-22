const sequelize = require('../../database');
const User = require('./User');
const Deposit = require('./Deposit');
const Transaction = require('./Transaction');
const Commission = require('./Commission');

// Define relationships between models
User.hasMany(Deposit, { foreignKey: 'payeer', sourceKey: 'payeer' });
Deposit.belongsTo(User, { foreignKey: 'payeer', targetKey: 'payeer' });

User.hasMany(Transaction, { foreignKey: 'payeer', sourceKey: 'payeer' });
Transaction.belongsTo(User, { foreignKey: 'payeer', targetKey: 'payeer' });

User.hasMany(Commission, { foreignKey: 'referer', sourceKey: 'referid' });
Commission.belongsTo(User, { foreignKey: 'referer', targetKey: 'referid' });

// Export the models
module.exports = {
  sequelize,
  User,
  Deposit,
  Transaction,
  Commission
};
