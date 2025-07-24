# ncfd
an open source hyip project.Deposit your money and earn money after awhile
code is fully functional and can be cloned and run on your own server.

## Installation
Vous avez besoin de nodejs12, yarn et PostgreSQL installés sur votre machine pour exécuter ce projet. Ce projet utilise Prisma comme ORM pour interagir avec la base de données PostgreSQL.

Suivez ces étapes pour installer le projet :

```bash
git clone https://github.com/puyaars/ncfd.git
cd ncfd
yarn
```

### Base de données et migrations

1. Créez une base de données PostgreSQL nommée `ncfd`

2. Configurez votre URL de base de données dans le fichier `.env` :

```
DATABASE_URL="postgresql://username:password@localhost:5432/ncfd?schema=public"
```

3. Générez et appliquez les migrations Prisma :

```bash
npx prisma migrate dev --name init
```

### Configuration

1. Copiez **config.sample.json** en **config.json** et ajoutez vos clés API Payeer :

```json
{
    "account": "",
    "apiId": "",
    "apiPass": "",
    "m_shop": "",
    "keys": ["key1", "key2"]
}
```

2. La configuration de la base de données est maintenant gérée dans le fichier `.env` à travers la variable `DATABASE_URL`, ce qui est la méthode recommandée par Prisma.
### Migration depuis MongoDB

Si vous avez des données existantes dans MongoDB que vous souhaitez migrer vers PostgreSQL, suivez ces étapes :

1. Assurez-vous que MongoDB est accessible et que vos données sont disponibles.

2. Configurez l'URL de MongoDB dans le fichier `.env` :

```
MONGO_URI=mongodb://username:password@localhost:27017/ncfd
MONGO_DB_NAME=ncfd
```

3. Exécutez le script de migration :

```bash
yarn db:migrate-from-mongo
```

### Développement

```bash
yarn dev
```
    
### Construction

```bash
yarn build
```

### Production

```bash
yarn build
yarn start
```

### Commandes Prisma utiles

```bash
# Générer le client Prisma après modification du schéma
yarn prisma:generate

# Appliquer les migrations de la base de données
yarn prisma:migrate

# Interface graphique pour explorer la base de données
yarn prisma:studio

# Initialiser la base de données
yarn db:init
```

## Déploiement sur Render

Vous pouvez déployer facilement cette application sur Render en suivant ces étapes :

### Méthode 1 : Déploiement en un clic

1. Assurez-vous que votre dépôt est sur GitHub
2. Connectez-vous à votre compte Render sur [https://dashboard.render.com](https://dashboard.render.com)
3. Allez dans **Blueprints** et cliquez sur **New Blueprint Instance**
4. Sélectionnez votre dépôt GitHub contenant le projet
5. Render va automatiquement détecter le fichier `render.yaml` et vous proposer de déployer les services définis
6. Validez le déploiement et attendez que Render termine la mise en place

### Méthode 2 : Déploiement manuel

1. Connectez-vous à votre compte Render sur [https://dashboard.render.com](https://dashboard.render.com)
2. Créez une nouvelle base de données PostgreSQL :
   - Allez dans **New > PostgreSQL**
   - Nommez-la `ncfd-db`
   - Choisissez la région la plus proche de vous
   - Sélectionnez le plan que vous préférez
   - Cliquez sur **Create Database**

3. Créez un nouveau service Web :
   - Allez dans **New > Web Service**
   - Connectez votre compte GitHub
   - Sélectionnez votre dépôt
   - Nommez le service `ncfd-app`
   - Laissez la racine sur `/`
   - Définissez la commande de construction : `yarn install && yarn prisma:generate && yarn build`
   - Définissez la commande de démarrage : `yarn start`
   - Sélectionnez le plan que vous préférez
   - Ajoutez la variable d'environnement `DATABASE_URL` en utilisant la chaîne de connexion de votre base de données PostgreSQL créée à l'étape 2
   - Cliquez sur **Create Web Service**

4. Votre application sera déployée et accessible à l'URL fournie par Render.

### Notes importantes pour le déploiement

- La première construction peut prendre plusieurs minutes
- Les migrations Prisma s'exécuteront automatiquement lors du déploiement
- Si vous rencontrez des problèmes de connexion à la base de données, vérifiez que l'URL dans la variable d'environnement `DATABASE_URL` est correcte

## Would you like to contribute?
- [ ] We need a better UI design. a feature to have multiple themes to easily select in the config would be nice.
- [ ] More payment methods/gateways to be added.
- [ ] error handling 
- [ ] documentation

these are parts we need contributions. feel free to push your code.

## bug report
create an issue. we will take care of it


## License
Released under the [MIT license](LICENSE).