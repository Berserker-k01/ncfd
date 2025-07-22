/**
 * Script pour migrer les données de MongoDB vers PostgreSQL (Prisma)
 * 
 * Ce script extrait les données de MongoDB et les insère dans PostgreSQL
 * en utilisant Prisma comme ORM.
 * 
 * Usage:
 * node scripts/migrate-mongo-to-postgres.js
 */

const { MongoClient } = require('mongodb');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration MongoDB (à paramétrer avec les valeurs réelles)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ncfd';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'ncfd';

async function main() {
  console.log('🚀 Démarrage de la migration MongoDB → PostgreSQL...');

  // Connexion à MongoDB
  const mongoClient = new MongoClient(MONGO_URI);
  try {
    await mongoClient.connect();
    console.log('✅ Connecté à MongoDB');
    
    const mongoDB = mongoClient.db(MONGO_DB_NAME);

    // Migration des utilisateurs
    console.log('🔄 Migration des utilisateurs...');
    const users = await mongoDB.collection('users').find({}).toArray();
    console.log(`📊 ${users.length} utilisateurs trouvés dans MongoDB`);

    for (const user of users) {
      await prisma.user.create({
        data: {
          payeer: user.payeer,
          joined: user.joined || new Date(),
          balance: user.balance || 0,
          referid: user.referid,
          referer: user.referer
        }
      });
    }
    console.log('✅ Migration des utilisateurs terminée');

    // Migration des dépôts
    console.log('🔄 Migration des dépôts...');
    const deposits = await mongoDB.collection('deposits').find({}).toArray();
    console.log(`📊 ${deposits.length} dépôts trouvés dans MongoDB`);

    for (const deposit of deposits) {
      await prisma.deposit.create({
        data: {
          payeer: deposit.payeer,
          created: deposit.created || new Date(),
          end: deposit.end || new Date(Date.now() + 24 * 60 * 60 * 1000),
          amount: deposit.amount || 0,
          profit: deposit.profit || 0,
          closed: deposit.closed || false
        }
      });
    }
    console.log('✅ Migration des dépôts terminée');

    // Migration des transactions
    console.log('🔄 Migration des transactions...');
    const transactions = await mongoDB.collection('transactions').find({}).toArray();
    console.log(`📊 ${transactions.length} transactions trouvées dans MongoDB`);

    for (const transaction of transactions) {
      await prisma.transaction.create({
        data: {
          payeer: transaction.payeer,
          created: transaction.created || new Date(),
          amount: transaction.amount || 0,
          status: transaction.status,
          type: transaction.type
        }
      });
    }
    console.log('✅ Migration des transactions terminée');

    // Migration des commissions
    console.log('🔄 Migration des commissions...');
    const commissions = await mongoDB.collection('commitions').find({}).toArray();
    console.log(`📊 ${commissions.length} commissions trouvées dans MongoDB`);

    for (const commission of commissions) {
      await prisma.commission.create({
        data: {
          payeer: commission.payeer,
          referer: commission.referer,
          created: commission.created || new Date(),
          amount: commission.amount || 0,
          profit: commission.profit || 0
        }
      });
    }
    console.log('✅ Migration des commissions terminée');

    console.log('✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur pendant la migration:', error);
  } finally {
    await prisma.$disconnect();
    await mongoClient.close();
    console.log('🔒 Connexions fermées');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
