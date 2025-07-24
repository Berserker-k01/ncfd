/**
 * Script de démarrage pour Render
 * Exécute les migrations Prisma avant le démarrage de l'application
 */
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Démarrage sur Render...');

  try {
    // Vérification de la connexion à la base de données
    console.log('🔍 Vérification de la connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    // Déploiement des migrations
    console.log('🔄 Déploiement des migrations Prisma...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations déployées avec succès');

    // Démarrage de l'application principale
    console.log('🚀 Démarrage de l\'application...');
    require('../server/index.js');
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

main().catch(console.error);
