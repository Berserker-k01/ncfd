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

## Would you like to contribute?
- [ ] We need a better UI design. a feature to have multiple themes to easily select in the config would be nice.
- [ ] Multi language support would be great.
- [ ] error handling 
- [ ] documentation

these are parts we need contributions. feel free to push your code.

## bug report
create an issue. we will take care of it


## License
Released under the [MIT license](LICENSE).