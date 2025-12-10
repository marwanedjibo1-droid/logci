# 🔧 Guide de Dépannage - FacturePro

## Problèmes Courants et Solutions

### ❌ Erreur: "jsPDF is not defined"

**Cause:** Module jsPDF non installé ou mal importé

**Solution:**
```bash
npm install jspdf
```

Vérifier l'import dans les fichiers:
```typescript
import { jsPDF } from 'jspdf';
```

---

### ❌ Erreur: "Cannot find module 'sonner'"

**Cause:** Package sonner manquant

**Solution:**
```bash
npm install sonner
```

Et dans App.tsx, s'assurer d'avoir:
```typescript
import { Toaster } from './components/ui/sonner';
```

---

### ❌ Les données ne se sauvegardent pas

**Causes possibles:**
1. LocalStorage désactivé dans le navigateur
2. Mode navigation privée
3. Quota LocalStorage dépassé (rare)

**Solutions:**
1. Vérifier que JavaScript est activé
2. Vérifier dans DevTools > Application > Local Storage
3. Essayer dans une fenêtre normale (pas privée)
4. Vider le cache si nécessaire

---

### ❌ Le PDF ne se génère pas

**Causes possibles:**
1. jsPDF mal installé
2. Données manquantes dans la facture
3. Logo trop volumineux

**Solutions:**
```bash
# Réinstaller jsPDF
npm uninstall jspdf
npm install jspdf
```

Vérifier la console pour les erreurs spécifiques

---

### ❌ WhatsApp ne s'ouvre pas

**Causes:**
1. Numéro de téléphone mal formaté
2. Pop-ups bloqués par le navigateur

**Solutions:**
1. Format attendu: `+225 XX XX XX XX XX`
2. Autoriser les pop-ups pour l'application
3. Vérifier la console pour les erreurs

---

### ❌ Erreur TypeScript sur les types

**Cause:** Types manquants ou conflits

**Solution:**
```bash
# Régénérer les types
npm run type-check
```

Si problème persiste:
```typescript
// Ajouter // @ts-ignore au-dessus de la ligne problématique
// @ts-ignore
const maVariable = ...
```

---

### ❌ Les graphiques ne s'affichent pas

**Cause:** Recharts non installé

**Solution:**
```bash
npm install recharts
```

---

### ❌ Erreur "Module not found: Can't resolve './utils/...'"

**Cause:** Fichiers utilitaires manquants

**Solution:**
Vérifier que tous ces fichiers existent:
- `/utils/pdfGenerator.ts`
- `/utils/exportUtils.ts`
- `/utils/whatsappHelper.ts`
- `/hooks/useKeyboardShortcuts.ts`

---

### ❌ Build échoue avec Vite

**Causes possibles:**
1. Dépendances manquantes
2. Erreurs TypeScript
3. Imports incorrects

**Solutions:**
```bash
# Nettoyer et réinstaller
rm -rf node_modules
rm package-lock.json
npm install

# Vérifier les erreurs
npm run type-check

# Build
npm run build
```

---

### ❌ Electron ne démarre pas

**Cause:** Configuration manquante

**Solution:**
1. Vérifier que `electron/main.js` existe
2. Vérifier que `electron/preload.js` existe
3. S'assurer que les dépendances Electron sont installées:

```bash
npm install electron electron-builder --save-dev
```

---

### ❌ L'EXE ne se crée pas

**Causes:**
1. electron-builder mal configuré
2. Icônes manquantes
3. Permissions insuffisantes

**Solutions:**
```bash
# Réinstaller electron-builder
npm install electron-builder --save-dev

# Créer le dossier build/ avec les icônes
mkdir build

# Build avec verbose pour voir les erreurs
npm run build:win -- --verbose
```

---

### ❌ Les données de démo ne s'affichent pas

**Cause:** Premier lancement déjà fait ou localStorage non vide

**Solution:**
```javascript
// Dans la console du navigateur:
localStorage.clear();
location.reload();
```

---

### ❌ Erreur "Uncaught TypeError: Cannot read properties of undefined"

**Causes possibles:**
1. Client supprimé mais facture existe encore
2. Données corrompues dans localStorage

**Solutions:**
```javascript
// Solution 1: Nettoyer localStorage
localStorage.clear();
location.reload();

// Solution 2: Réinitialiser via l'interface
// Paramètres > Réinitialiser toutes les données
```

---

### ❌ La recherche ne fonctionne pas

**Cause:** Majuscules/minuscules non gérées

**Solution:**
Déjà implémenté avec `.toLowerCase()` - si ça ne marche pas, vider le cache

---

### ❌ Les calculs de TVA sont incorrects

**Cause:** Taux de TVA mal configuré

**Solution:**
1. Aller dans Paramètres
2. Vérifier le taux de TVA (18% par défaut)
3. Modifier si nécessaire
4. Les nouvelles factures utiliseront le nouveau taux

---

### ❌ Logo ne s'affiche pas dans le PDF

**Causes:**
1. Logo trop volumineux
2. Format d'image non supporté

**Solutions:**
1. Réduire la taille du logo (< 2 Mo)
2. Utiliser PNG ou JPG
3. Vérifier que le logo est bien uploadé dans Paramètres

---

### ❌ Export CSV mal encodé (caractères bizarres)

**Cause:** Encodage UTF-8 non reconnu par Excel

**Solution:**
Déjà corrigé avec BOM UTF-8 dans le code. Si problème:
1. Ouvrir le CSV avec un éditeur de texte
2. Copier le contenu
3. Coller dans Excel

---

### ❌ Paiements partiels ne mettent pas à jour le statut

**Cause:** Bug dans le calcul

**Solution:**
Vérifier dans `AppContext.tsx` la fonction `addPayment`:
```typescript
const status = paidAmount >= invoice.total ? 'paid' : 
               paidAmount > 0 ? 'partial' : 
               invoice.status;
```

---

### ❌ Les raccourcis clavier ne fonctionnent pas

**Causes:**
1. Hook non implémenté
2. Focus sur un input

**Solutions:**
1. Vérifier que `useKeyboardShortcuts` est appelé dans App.tsx
2. Les raccourcis ne marchent pas quand on tape dans un champ texte (normal)

---

## 🛠️ Outils de Débogage

### Console du Navigateur
```javascript
// Voir toutes les données
console.log('Invoices:', JSON.parse(localStorage.getItem('invoices')));
console.log('Clients:', JSON.parse(localStorage.getItem('clients')));
console.log('Settings:', JSON.parse(localStorage.getItem('settings')));

// Compter les éléments
console.log('Nombre de factures:', JSON.parse(localStorage.getItem('invoices'))?.length);
```

### Vérifier l'état
```javascript
// Dans le composant avec useApp
const { invoices, clients, settings } = useApp();
console.log({ invoices, clients, settings });
```

### Tests de Fonctionnalités

1. **Test création facture:**
   - Sélectionner un client
   - Ajouter un article
   - Vérifier le calcul
   - Enregistrer
   - Vérifier dans la liste

2. **Test PDF:**
   - Créer une facture complète
   - Cliquer "Générer PDF"
   - Vérifier le téléchargement
   - Ouvrir le PDF

3. **Test WhatsApp:**
   - Sélectionner une facture
   - Cliquer "WhatsApp"
   - Vérifier que l'onglet s'ouvre
   - Vérifier le message

4. **Test Export:**
   - Aller dans Paramètres
   - Cliquer "Exporter données"
   - Vérifier le fichier JSON téléchargé

---

## 🚨 Réinitialisation Complète

Si rien ne fonctionne:

### Option 1: Via l'interface
1. Aller dans Paramètres
2. Scroll en bas
3. Cliquer "Réinitialiser toutes les données"
4. Confirmer

### Option 2: Via la console
```javascript
localStorage.clear();
location.reload();
```

### Option 3: Build fresh
```bash
rm -rf node_modules dist
npm install
npm run dev
```

---

## 📞 Support

Si le problème persiste:

1. **Vérifier les logs de la console** (F12 > Console)
2. **Prendre une capture d'écran de l'erreur**
3. **Noter les étapes pour reproduire**
4. **Vérifier la version de Node.js** (`node --version` >= 18)
5. **Vérifier la version de npm** (`npm --version` >= 9)

---

## ✅ Checklist Avant de Signaler un Bug

- [ ] J'ai vidé le cache et rechargé
- [ ] J'ai vérifié la console (F12)
- [ ] J'ai essayé dans un autre navigateur
- [ ] J'ai vérifié que toutes les dépendances sont installées
- [ ] J'ai essayé de réinitialiser les données
- [ ] J'ai les captures d'écran des erreurs
- [ ] Je peux reproduire le bug de manière constante

---

**Note:** La plupart des problèmes sont résolus en vidant le localStorage et en rechargeant ! 🔄
