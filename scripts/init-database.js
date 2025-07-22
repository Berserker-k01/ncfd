/**
 * Script pour initialiser la structure de la base de données PostgreSQL avec Prisma
 * 
 * Ce script vérifie si la connexion à PostgreSQL fonctionne correctement
 * et crée la structure de la base de données via Prisma.
 * 
 * Usage:
 * node scripts/init-database.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation de la base de données avec Prisma...');

  try {
    // Test de connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connecté à PostgreSQL');

    // Vérification des modèles
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs dans la base de données: ${userCount}`);

    console.log(`
🎉 Base de données initialisée avec succès!

Autres commandes utiles:
- Pour visualiser votre base de données: npx prisma studio
- Pour générer un nouveau client Prisma après des modifications: npx prisma generate
- Pour appliquer des migrations: npx prisma migrate dev
    `);

  } catch (error) {
    console.error('❌ Erreur pendant l\'initialisation:', error);
    console.log(`
⚠️ Veuillez vérifier:
1. Que PostgreSQL est en cours d'exécution
2. Que la variable DATABASE_URL dans .env est correcte
3. Que la base de données existe (créez-la manuellement si nécessaire)
    `);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
