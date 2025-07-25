// Script pour le build dans Render avec support pour les anciennes fonctionnalités OpenSSL
const { execSync } = require('child_process');

console.log('🚀 Début du build pour Render...');

// Configuration d'OpenSSL pour la compatibilité avec Next.js 9.5.1
console.log('⚙️ Configuration de NODE_OPTIONS...');
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

// Préparation de la base de données
console.log('🔄 Préparation du schéma de base de données...');
try {
  // Génération du client Prisma
  console.log('Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Déploiement du schéma (en mode non-interactif)
  console.log('Création du schéma dans la base de données...');
  execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit' });

  console.log('✅ Schéma de base de données préparé avec succès');
} catch (error) {
  console.error('⚠️ Attention: Erreur lors de la préparation du schéma:', error);
  console.log('Continuer le build malgré l\'erreur...');
  // Continuer même en cas d'erreur pour ne pas bloquer le déploiement
}

// Génération du fichier config.json
console.log('🔄 Génération du fichier config.json...');
const fs = require('fs');
const path = require('path');

// Configuration par défaut avec des valeurs des variables d'environnement
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

// Build de Next.js
console.log('🔨 Lancement du build Next.js...');
execSync('next build', { stdio: 'inherit' });

console.log('✅ Build terminé avec succès');

