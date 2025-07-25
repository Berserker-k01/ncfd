// Script pour générer le fichier config.json à partir des variables d'environnement
const fs = require('fs');
const path = require('path');

// Configuration par défaut avec des valeurs vides
const defaultConfig = {
  account: process.env.PAYEER_ACCOUNT || "",
  apiId: process.env.PAYEER_API_ID || "",
  apiPass: process.env.PAYEER_API_PASS || "",
  m_shop: process.env.PAYEER_M_SHOP || "",
  keys: [
    process.env.PAYEER_KEY1 || "default_key1",
    process.env.PAYEER_KEY2 || "default_key2"
  ]
};

// Chemin vers le fichier config.json
const configPath = path.join(__dirname, '..', 'config.json');

// Écrire la configuration dans le fichier
fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));

console.log('Fichier config.json généré avec succès !');
