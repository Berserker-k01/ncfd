/**
 * Script de démarrage pour Render
 * Exécute les migrations Prisma et génère config.json avant le démarrage de l'application
 */
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
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

    // Génération du fichier config.json
    console.log('🔄 Génération du fichier config.json...');
    const configPath = path.join(__dirname, '..', 'config.json');
    const config = {
      account: process.env.PAYEER_ACCOUNT || "",
      apiId: process.env.PAYEER_API_ID || "",
      apiPass: process.env.PAYEER_API_PASS || "",
      m_shop: process.env.PAYEER_M_SHOP || "",
      keys: [
        process.env.PAYEER_KEY1 || "default_key1",
        process.env.PAYEER_KEY2 || "default_key2"
      ]
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Fichier config.json généré avec succès');

    // Démarrage de l'application principale
    console.log('🚀 Démarrage de l\'application...');
    require('../server/index.js');
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

main().catch(console.error);
