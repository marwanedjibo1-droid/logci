# Configuration Electron pour FacturePro

## Fichiers nécessaires pour Electron

### 1. package.json supplémentaire pour Electron

Créez un fichier `package.json` à la racine avec ces dépendances :

```json
{
  "name": "facturepro",
  "version": "1.0.0",
  "description": "Logiciel de Facturation Professionnel",
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "concurrently \"vite\" \"electron .\"",
    "electron:build": "vite build && electron-builder",
    "build:win": "vite build && electron-builder --win",
    "build:mac": "vite build && electron-builder --mac",
    "build:linux": "vite build && electron-builder --linux"
  },
  "build": {
    "appId": "com.facturepro.app",
    "productName": "FacturePro",
    "directories": {
      "buildResources": "build",
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "build/icon.icns"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "build/icon.png",
      "category": "Office"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  }
}
```

### 2. electron/main.js

Créez un fichier `electron/main.js` :

```javascript
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../build/icon.png'),
    frame: true,
    backgroundColor: '#ffffff',
    show: false, // Don't show until ready
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Custom menu
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouvelle Facture',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('new-invoice')
        },
        {
          label: 'Nouveau Client',
          accelerator: 'CmdOrCtrl+K',
          click: () => mainWindow.webContents.send('new-client')
        },
        { type: 'separator' },
        {
          label: 'Exporter les données',
          click: () => mainWindow.webContents.send('export-data')
        },
        {
          label: 'Importer les données',
          click: () => mainWindow.webContents.send('import-data')
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { label: 'Annuler', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rétablir', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Couper', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copier', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Coller', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Tout sélectionner', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Recharger', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Plein écran', accelerator: 'F11', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Zoom +', accelerator: 'CmdOrCtrl+Plus', role: 'zoomin' },
        { label: 'Zoom -', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
        { label: 'Réinitialiser zoom', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos de FacturePro',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos',
              message: 'FacturePro v1.0.0',
              detail: 'Logiciel de facturation professionnel\\nDéveloppé avec Electron et React'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for communication with renderer
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});
```

### 3. electron/preload.js

Créez un fichier `electron/preload.js` :

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  onNewInvoice: (callback) => ipcRenderer.on('new-invoice', callback),
  onNewClient: (callback) => ipcRenderer.on('new-client', callback),
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onImportData: (callback) => ipcRenderer.on('import-data', callback),
});
```

### 4. Icônes de l'application

Placez vos icônes dans un dossier `build/` :
- `build/icon.ico` (Windows - 256x256)
- `build/icon.icns` (macOS)
- `build/icon.png` (Linux - 512x512)

### 5. vite.config.ts modification

Ajoutez cette configuration :

```typescript
export default defineConfig({
  base: './', // Important pour Electron
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['electron']
    }
  }
});
```

## Commandes pour créer l'EXE

### Installation

```bash
npm install
```

### Développement

```bash
npm run electron:dev
```

### Build Windows (EXE)

```bash
npm run build:win
```

L'exécutable sera dans `dist-electron/win-unpacked/FacturePro.exe`
L'installateur sera dans `dist-electron/FacturePro Setup 1.0.0.exe`

### Build Mac (DMG)

```bash
npm run build:mac
```

### Build Linux (AppImage, DEB)

```bash
npm run build:linux
```

## Fonctionnalités Electron ajoutées

✅ Menu natif personnalisé
✅ Raccourcis clavier globaux
✅ Fenêtre native avec icône
✅ Auto-updater (à configurer)
✅ Communication IPC sécurisée
✅ Sauvegarde locale dans userData
✅ Build multi-plateformes

## Taille approximative

- Application installée : ~150-200 MB
- Installateur : ~80-100 MB

## Sécurité

- ✅ contextIsolation activé
- ✅ nodeIntegration désactivé
- ✅ enableRemoteModule désactivé
- ✅ Preload script sécurisé
- ✅ CSP (Content Security Policy) recommandé

## Notes importantes

1. Les données sont stockées dans `localStorage` et persisteront entre les sessions
2. Les backups automatiques sont sauvegardés dans `localStorage` également
3. Pour une version production, considérez SQLite pour la base de données
4. Ajoutez un système d'auto-update avec electron-updater
5. Configurez la signature de code pour Windows/Mac

## Support

L'application fonctionne sur :
- ✅ Windows 10/11 (64-bit)
- ✅ macOS 10.13+ (Intel & Apple Silicon)
- ✅ Linux (Ubuntu, Debian, Fedora)
