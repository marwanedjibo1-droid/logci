# 🧾 FacturePro - Logiciel de Facturation Professionnel

> **Logiciel de facturation moderne, complet et professionnel pour les petites entreprises**

[![Version](https://img.shields.io/badge/version-1.0.0-emerald)](https://github.com/votre-repo/facturepro)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/votre-repo/facturepro)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E%3D14-blue)](https://www.postgresql.org/)

Un système complet de facturation avec **Frontend React**, **Backend Node.js/Express**, et **Base de données PostgreSQL** - Prêt pour la production !

![Version](https://img.shields.io/badge/version-1.0.0-emerald)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## ✨ Fonctionnalités

### 📊 Dashboard
- ✅ Statistiques en temps réel (ventes du jour/mois/année)
- ✅ Alertes factures impayées
- ✅ Dernières factures avec détails
- ✅ Résumé IA des activités

### 📄 Gestion des Factures
- ✅ Création de factures complètes
- ✅ Calcul automatique de la TVA
- ✅ Gestion des remises
- ✅ Notes et commentaires personnalisés
- ✅ Dates de facturation et d'échéance
- ✅ Numérotation automatique
- ✅ Statuts (Payée, Impayée, En attente, Paiement partiel)
- ✅ **Gestion des paiements partiels**
- ✅ Historique des paiements
- ✅ Modification et suppression
- ✅ Duplication de factures
- ✅ Recherche et filtres avancés
- ✅ Tri personnalisable

### 👥 Gestion des Clients
- ✅ Ajout, modification, suppression
- ✅ Informations complètes (nom, téléphone, email, adresse)
- ✅ Historique des factures par client
- ✅ Calcul automatique des montants impayés
- ✅ Recherche et filtres
- ✅ Export CSV

### 📈 Rapports & Statistiques
- ✅ Graphiques dynamiques (barres + camembert)
- ✅ Filtres par période (jour/semaine/mois/année)
- ✅ Sélection de dates personnalisées
- ✅ Top 5 meilleurs clients
- ✅ Taux de paiement
- ✅ Factures en retard avec calcul des jours
- ✅ Export PDF et Excel

### 📤 Export & Communication
- ✅ **Génération PDF professionnelle** avec logo
- ✅ **Impression directe**
- ✅ **Envoi WhatsApp** automatisé
- ✅ Export CSV pour clients et factures
- ✅ Export/Import des données (backup)
- ✅ Auto-backup toutes les 30 minutes

### ⚙️ Paramètres
- ✅ Upload de logo entreprise
- ✅ Informations entreprise personnalisables
- ✅ Configuration de la numérotation
- ✅ Gestion des devises (FCFA, EUR, USD, GBP, CAD, CHF)
- ✅ Taux de TVA personnalisable
- ✅ Mode sombre
- ✅ Multi-langues (FR/EN)
- ✅ Sauvegarde et restauration complète

### 🔒 Sécurité & Données
- ✅ Sauvegarde LocalStorage automatique
- ✅ Données de démonstration au premier lancement
- ✅ Historique des activités (100 dernières actions)
- ✅ Export/Import sécurisé
- ✅ Réinitialisation complète des données

### ⌨️ Raccourcis Clavier
- ✅ `Ctrl+N` : Nouvelle facture
- ✅ `Ctrl+K` : Nouveau client
- ✅ `Ctrl+F` : Rechercher
- ✅ `Ctrl+S` : Enregistrer
- ✅ `Ctrl+E` : Exporter
- ✅ `Ctrl+P` : Imprimer
- ✅ `Ctrl+1-5` : Navigation rapide

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-repo/facturepro.git

# Installer les dépendances
cd facturepro
npm install

# Lancer en développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Build pour production (Web)

```bash
npm run build
```

## 💻 Build Electron (EXE)

Voir le fichier `/electron-config.md` pour les instructions complètes.

### Installation Electron

```bash
# Installer les dépendances Electron
npm install electron electron-builder concurrently --save-dev
```

### Créer l'EXE Windows

```bash
npm run build:win
```

L'exécutable sera dans `dist-electron/FacturePro Setup 1.0.0.exe`

### Autres plateformes

```bash
# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 📁 Structure du Projet

```
facturepro/
├── components/
│   ├── Dashboard.tsx          # Tableau de bord
│   ├── CreateInvoice.tsx      # Création de factures
│   ├── InvoicesList.tsx       # Liste des factures
│   ├── ClientsList.tsx        # Liste des clients
│   ├── Reports.tsx            # Rapports et statistiques
│   ├── Settings.tsx           # Paramètres
│   ├── PaymentDialog.tsx      # Gestion des paiements
│   └── ui/                    # Composants UI (Shadcn)
├── context/
│   └── AppContext.tsx         # État global de l'application
├── utils/
│   ├── pdfGenerator.ts        # Génération de PDF
│   ├── exportUtils.ts         # Utilitaires d'export
│   └── whatsappHelper.ts      # Helpers WhatsApp
├── hooks/
│   └── useKeyboardShortcuts.ts # Raccourcis clavier
├── App.tsx                    # Composant principal
└── styles/
    └── globals.css            # Styles globaux
```

## 🎨 Design

- **Framework CSS** : Tailwind CSS 4.0
- **Composants UI** : Shadcn/ui
- **Icônes** : Lucide React
- **Graphiques** : Recharts
- **Notifications** : Sonner
- **PDF** : jsPDF

## 📊 Technologies

- **Frontend** : React 18 + TypeScript
- **Build** : Vite
- **État** : Context API + LocalStorage
- **Desktop** : Electron
- **Styling** : Tailwind CSS

## 🔧 Configuration

### Données de démonstration

Au premier lancement, l'application génère automatiquement :
- 3 clients de démonstration
- 3 factures exemples
- Historique d'activités

Vous pouvez les supprimer depuis les paramètres.

### Personnalisation

1. **Logo** : Uploadez votre logo dans Paramètres
2. **Devise** : Choisissez votre devise (FCFA par défaut)
3. **TVA** : Configurez votre taux de TVA (18% par défaut)
4. **Numérotation** : Personnalisez le préfixe (F- par défaut)

## 📝 Utilisation

### Créer une facture

1. Cliquez sur "Créer une facture" ou `Ctrl+N`
2. Sélectionnez un client
3. Ajoutez des articles/services
4. La TVA est calculée automatiquement
5. Enregistrez (Brouillon/Impayée/Payée)
6. Générez le PDF ou envoyez par WhatsApp

### Gérer les paiements

1. Ouvrez une facture
2. Cliquez sur "Ajouter un paiement"
3. Entrez le montant et la méthode
4. Le statut s'update automatiquement

### Générer des rapports

1. Accédez à "Rapports"
2. Sélectionnez la période
3. Consultez les graphiques et statistiques
4. Exportez en PDF ou Excel

## 🌍 Multi-langues

Actuellement disponible en :
- 🇫🇷 Français (par défaut)
- 🇬🇧 English (à venir)

## 💾 Sauvegarde des données

- **Auto-save** : Toutes les modifications sont sauvegardées automatiquement
- **Auto-backup** : Backup automatique toutes les 30 minutes
- **Export manuel** : Exportez vos données JSON à tout moment
- **Import** : Importez des données depuis un fichier JSON

## 🐛 Résolution de problèmes

### Les données ne se sauvegardent pas
- Vérifiez que JavaScript est activé
- Vérifiez que LocalStorage n'est pas désactivé
- Videz le cache et rechargez

### Le PDF ne se génère pas
- Vérifiez la console pour les erreurs
- Assurez-vous que jsPDF est bien installé

### WhatsApp ne s'ouvre pas
- Vérifiez le format du numéro de téléphone
- Le navigateur doit autoriser les pop-ups

## 📦 Dépendances principales

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "latest",
  "recharts": "latest",
  "jspdf": "latest",
  "sonner": "latest",
  "tailwindcss": "^4.0.0"
}
```

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé avec ❤️ pour les petites entreprises

## 🙏 Remerciements

- [Shadcn/ui](https://ui.shadcn.com/) pour les composants
- [Lucide](https://lucide.dev/) pour les icônes
- [Recharts](https://recharts.org/) pour les graphiques
- [jsPDF](https://github.com/parallax/jsPDF) pour la génération PDF

## 🆘 Support

Pour toute question ou problème :
- 📧 Email : support@facturepro.com
- 💬 Discord : [Rejoindre](https://discord.gg/facturepro)
- 📖 Documentation : [docs.facturepro.com](https://docs.facturepro.com)

---

**FacturePro** - Facturation Simple & Professionnelle 🚀
