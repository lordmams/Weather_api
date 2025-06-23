# Utiliser une image Node.js officielle comme base
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de l'application
# Utiliser --only=production pour ne pas installer les devDependencies comme jest
RUN npm install --only=production

# Copier le code source de l'application
COPY . .

# Exposer le port sur lequel l'application tourne
EXPOSE 3000

# Commande pour démarrer l'application
CMD [ "node", "src/server.js" ] 