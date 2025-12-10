# 📦 Installation Complète - FacturePro

Ce guide vous explique comment installer et lancer FacturePro en local et en production.

## 📋 Prérequis

### Logiciels requis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **PostgreSQL** 14+ ([Télécharger](https://www.postgresql.org/download/))
- **Git** ([Télécharger](https://git-scm.com/downloads))
- **npm** ou **yarn** (inclus avec Node.js)

### Compétences recommandées

- Connaissance basique de la ligne de commande
- Connaissance de base SQL (optionnel)

---

## 🚀 Installation Rapide (Mode Développement)

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/facturepro.git
cd facturepro
```

### 2. Configuration de la Base de Données

#### A. Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE facturepro;

# Se connecter à la base
\c facturepro

# Quitter
\q
```

#### B. Importer le schéma

```bash
cd backend
psql -U postgres -d facturepro -f database/schema.sql
```

### 3. Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos informations
nano .env  # ou vim, code, notepad++, etc.
```

**Modifier `.env` :**

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=facturepro
DB_USER=postgres
DB_PASSWORD=VotreMdpPostgres

JWT_SECRET=ChangeMoiEnProduction123!@#
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173
```

### 4. Configuration Frontend

```bash
cd ../  # Retour à la racine

# Installer les dépendances
npm install

# Créer le fichier .env
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 5. Lancer l'Application

#### Option A : Lancer Backend et Frontend séparément

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

#### Option B : Lancer tout en même temps (avec concurrently)

```bash
# À la racine du projet
npm run dev:all
```

### 6. Accéder à l'Application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000
- **API Health** : http://localhost:5000/api/health

---

## 🏭 Installation en Production

### 1. Serveur Requirements

- **Serveur** : Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM** : Minimum 2 GB
- **CPU** : 1 vCPU minimum
- **Stockage** : 10 GB minimum

### 2. Installation des dépendances système

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installation Nginx (Reverse Proxy)
sudo apt install -y nginx

# Installation PM2 (Process Manager)
sudo npm install -g pm2
```

### 3. Configuration PostgreSQL en Production

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer un utilisateur dédié
CREATE USER facturepro_user WITH PASSWORD 'MotDePasseSecurise123!';

# Créer la base de données
CREATE DATABASE facturepro_prod;

# Donner les droits
GRANT ALL PRIVILEGES ON DATABASE facturepro_prod TO facturepro_user;

# Quitter
\q

# Importer le schéma
sudo -u postgres psql -d facturepro_prod -f /chemin/vers/schema.sql
```

### 4. Déploiement Backend

```bash
# Cloner le projet
cd /var/www
sudo git clone https://github.com/votre-repo/facturepro.git
cd facturepro/backend

# Installer les dépendances
npm install --production

# Configuration
sudo nano .env
```

**Configuration Production `.env` :**

```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=facturepro_prod
DB_USER=facturepro_user
DB_PASSWORD=MotDePasseSecurise123!

JWT_SECRET=CleSuperSecurePourProduction987!@#$%^
JWT_EXPIRE=7d

CLIENT_URL=https://votre-domaine.com

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Lancer avec PM2 :**

```bash
pm2 start server.js --name facturepro-api
pm2 save
pm2 startup
```

### 5. Build et Déploiement Frontend

```bash
cd /var/www/facturepro

# Configuration
echo "VITE_API_URL=https://api.votre-domaine.com/api" > .env

# Build
npm install
npm run build

# Les fichiers sont dans /dist
```

### 6. Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/facturepro
```

**Configuration Nginx :**

```nginx
# Frontend
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    root /var/www/facturepro/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

# Backend API
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Activer le site :**

```bash
sudo ln -s /etc/nginx/sites-available/facturepro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL avec Let's Encrypt (HTTPS)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir les certificats
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
sudo certbot --nginx -d api.votre-domaine.com

# Auto-renouvellement
sudo certbot renew --dry-run
```

---

## 🔐 Sécurité en Production

### 1. Firewall

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 2. Sécurisation PostgreSQL

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Changez:
```
local   all             all                                     peer
```
en:
```
local   all             all                                     md5
```

```bash
sudo systemctl restart postgresql
```

### 3. Variables d'environnement sécurisées

- Utilisez des mots de passe forts (32+ caractères)
- Ne committez JAMAIS les fichiers `.env` dans Git
- Changez toutes les clés secrètes par défaut
- Utilisez un gestionnaire de secrets en production (Vault, AWS Secrets Manager, etc.)

---

## 🧪 Tests

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
npm test
```

---

## 📊 Monitoring

### Logs Backend (PM2)

```bash
pm2 logs facturepro-api
pm2 logs facturepro-api --lines 100
pm2 logs facturepro-api --err  # Erreurs seulement
```

### Monitoring avec PM2

```bash
pm2 monit
```

### Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Mises à jour

### Backend

```bash
cd /var/www/facturepro/backend
git pull origin main
npm install
pm2 restart facturepro-api
```

### Frontend

```bash
cd /var/www/facturepro
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

---

## 🆘 Dépannage

### La base de données ne se connecte pas

```bash
# Vérifier que PostgreSQL est actif
sudo systemctl status postgresql

# Tester la connexion
psql -U postgres -d facturepro -h localhost
```

### Le backend ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs facturepro-api

# Vérifier le port 5000
sudo lsof -i :5000
```

### Le frontend ne charge pas

```bash
# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Support

- **Documentation** : `/docs`
- **Issues** : GitHub Issues
- **Email** : support@facturepro.com

---

**FacturePro** - Installation Guide v1.0.0
