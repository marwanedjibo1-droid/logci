# ⚡ Démarrage Ultra-Rapide - FacturePro

Ce guide vous permet de lancer **FacturePro en 5 minutes** sur votre machine locale.

---

## 🎯 Prérequis Minimum

Installez ces 3 logiciels (5 minutes) :

1. **Node.js 18+** → [Télécharger](https://nodejs.org/)
2. **PostgreSQL 14+** → [Télécharger](https://www.postgresql.org/download/)
3. **Git** → [Télécharger](https://git-scm.com/downloads)

---

## 🚀 Installation en 5 Étapes

### Étape 1 : Cloner le Projet (30 secondes)

```bash
git clone https://github.com/votre-repo/facturepro.git
cd facturepro
```

### Étape 2 : Base de Données (1 minute)

```bash
# Ouvrir PostgreSQL
psql -U postgres

# Créer la base
CREATE DATABASE facturepro;
\q

# Importer le schéma
cd backend
psql -U postgres -d facturepro -f database/schema.sql
```

### Étape 3 : Backend (2 minutes)

```bash
# Rester dans /backend
npm install

# Configuration
cp .env.example .env

# Éditer .env (changez juste le mot de passe PostgreSQL)
# DB_PASSWORD=votre_mot_de_passe_postgres
```

### Étape 4 : Frontend (1 minute)

```bash
cd ..  # Retour à la racine
npm install

echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Étape 5 : Lancer ! (30 secondes)

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

---

## 🎉 C'est Prêt !

Ouvrez votre navigateur :

- **Application** : http://localhost:5173
- **API** : http://localhost:5000

---

## 🔑 Premier Compte

L'application démarre avec des **données de démonstration** :
- 3 clients exemples
- 3 factures exemples

Pour créer un compte utilisateur :

```bash
# Utiliser l'API directement
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@facturepro.com",
    "password": "admin123",
    "name": "Administrateur",
    "role": "admin"
  }'
```

Ou créez-le depuis l'interface (si vous avez ajouté une page de register).

---

## 📱 Utilisation

### Créer une Facture

1. Cliquez sur **"Créer une facture"**
2. Sélectionnez un client
3. Ajoutez des articles
4. La TVA se calcule automatiquement
5. Enregistrez (Brouillon / Impayée / Payée)
6. Téléchargez le PDF ou envoyez par WhatsApp

### Ajouter un Client

1. Allez dans **"Clients"**
2. Cliquez **"Ajouter un client"**
3. Remplissez nom + téléphone (obligatoire)
4. Email et adresse (optionnel)
5. Enregistrez

### Voir les Rapports

1. Allez dans **"Rapports"**
2. Choisissez la période (Jour/Semaine/Mois/Année)
3. Consultez les graphiques
4. Exportez en PDF ou Excel

---

## 🛠️ Commandes Utiles

### Backend

```bash
cd backend

# Développement avec auto-reload
npm run dev

# Production
npm start

# Tests
npm test

# Migrations
npm run migrate

# Seeds (données de test)
npm run seed
```

### Frontend

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Tests
npm test

# Lint
npm run lint
```

### Base de Données

```bash
# Se connecter
psql -U postgres -d facturepro

# Lister les tables
\dt

# Voir la structure d'une table
\d invoices

# Compter les factures
SELECT COUNT(*) FROM invoices;

# Quitter
\q
```

---

## 🔧 Dépannage Express

### Problème 1 : Port déjà utilisé

```bash
# Trouver le processus sur le port 5000
lsof -i :5000

# Le tuer
kill -9 <PID>

# Ou changer le port dans .env
PORT=5001
```

### Problème 2 : PostgreSQL ne démarre pas

```bash
# Windows
net start postgresql-x64-14

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Problème 3 : Erreur "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Pareil pour backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Problème 4 : Base de données connexion refusée

Vérifiez dans `backend/.env` :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=facturepro
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE_ICI  # ← Vérifiez ça !
```

---

## 🎓 Prochaines Étapes

1. **Personnalisez votre entreprise**
   - Allez dans Paramètres
   - Ajoutez votre logo
   - Modifiez les informations

2. **Créez de vrais clients**
   - Supprimez les clients de démo
   - Ajoutez vos vrais clients

3. **Créez vos premières factures**
   - Utilisez vos vrais tarifs
   - Testez la génération PDF
   - Testez l'envoi WhatsApp

4. **Explorez les rapports**
   - Consultez les statistiques
   - Exportez en Excel
   - Analysez vos ventes

---

## 📚 Documentation Complète

- [📖 Installation Détaillée](/docs/INSTALLATION.md)
- [📡 Documentation API](/docs/API.md)
- [🚀 Guide de Déploiement](/docs/DEPLOYMENT.md)
- [🔐 Sécurité](/docs/SECURITY.md)
- [🐛 Dépannage](/TROUBLESHOOTING.md)
- [✨ Fonctionnalités](/FEATURES.md)

---

## 💡 Astuces

### Raccourcis Clavier

- `Ctrl + N` → Nouvelle facture
- `Ctrl + K` → Nouveau client
- `Ctrl + 1-5` → Navigation rapide
- `Ctrl + S` → Sauvegarder
- `Ctrl + P` → Imprimer

### Auto-backup

L'application sauvegarde automatiquement toutes les 30 minutes dans `localStorage`.

### Export/Import

- **Export** : Paramètres → Exporter les données
- **Import** : Paramètres → Importer les données

---

## 🆘 Besoin d'Aide ?

- **Documentation** : Voir `/docs`
- **Issues** : [GitHub Issues](https://github.com/votre-repo/facturepro/issues)
- **Email** : support@facturepro.com
- **Discord** : [Rejoindre](https://discord.gg/facturepro)

---

## ⭐ Vous aimez FacturePro ?

- ⭐ Star le projet sur GitHub
- 🐛 Signalez les bugs
- 💡 Proposez des fonctionnalités
- 🤝 Contribuez au code
- 📣 Partagez avec vos amis

---

**FacturePro** - Facturation Professionnelle Simplifiée 🚀

*Temps de lecture : 3 min | Temps d'installation : 5 min | Prêt pour la production : ✅*
