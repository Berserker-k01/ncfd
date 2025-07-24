/**
 * Script pour générer les migrations Prisma en local puis les déployer sur Render
 * 
 * Ce script contourne le problème de permission SUPERUSER sur Render
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Sauvegarde de l'URL de base de données originale
let originalDbUrl = '';
try {
  originalDbUrl = process.env.DATABASE_URL || fs.readFileSync('.env', 'utf8')
    .split('\n')
    .find(line => line.startsWith('DATABASE_URL='))
    ?.split('=')[1]
    ?.trim()
    ?.replace(/["']/g, '');
} catch (error) {
  console.error('❌ Erreur lors de la lecture de l\'URL de base de données originale:', error);
  process.exit(1);
}

if (!originalDbUrl) {
  console.error('❌ URL de base de données originale non trouvée');
  process.exit(1);
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Génération et déploiement des migrations Prisma...');

    // 1. Vérifier si une base de données locale est disponible
    const localDbUrl = "postgresql://postgres:password@localhost:5432/ncfd?schema=public";
    
    // 2. Modifier temporairement le fichier .env pour utiliser la base de données locale
    console.log('🔄 Configuration temporaire pour la base de données locale...');
    fs.writeFileSync('.env.backup', fs.readFileSync('.env', 'utf8'));
    fs.writeFileSync('.env', `DATABASE_URL="${localDbUrl}"\n`);

    try {
      // 3. Créer la base de données locale si elle n'existe pas
      console.log('🔄 Création de la base de données locale si nécessaire...');
      try {
        execSync('createdb -U postgres ncfd', { stdio: 'ignore' });
        console.log('✅ Base de données locale créée');
      } catch (error) {
        console.log('⚠️ La base de données existe peut-être déjà, on continue...');
      }

      // 4. Générer les migrations en local
      console.log('🔄 Génération des migrations en local...');
      execSync('npx prisma migrate dev --name init --create-only', { stdio: 'inherit' });
      console.log('✅ Fichiers de migration générés avec succès');

    } finally {
      // 5. Restaurer le fichier .env original
      console.log('🔄 Restauration de la configuration originale...');
      fs.writeFileSync('.env', fs.readFileSync('.env.backup', 'utf8'));
      fs.unlinkSync('.env.backup');
    }

    // 6. Déployer les migrations sur la base de données distante
    console.log('🔄 Déploiement des migrations sur la base de données distante...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations déployées avec succès sur la base de données distante');

    // 7. Générer le client Prisma
    console.log('🔄 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Client Prisma généré avec succès');

    console.log(`
🎉 Processus de migration terminé avec succès!

Votre base de données est maintenant prête à être utilisée avec votre application.
Les migrations ont été déployées sur : ${originalDbUrl.split('@')[1].split('/')[0]}
    `);

  } catch (error) {
    console.error('❌ Erreur lors du processus de migration:', error);
    process.exit(1);
  }
}

main();
