// Script pour le build dans Render avec support pour les anciennes fonctionnalités OpenSSL
process.env.NODE_OPTIONS = '--openssl-legacy-provider';
require('child_process').execSync('next build', { stdio: 'inherit' });
