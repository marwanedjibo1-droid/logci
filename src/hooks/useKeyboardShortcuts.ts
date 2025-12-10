import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Common shortcuts for the app
export const APP_SHORTCUTS = {
  NEW_INVOICE: { key: 'n', ctrl: true, description: 'Nouvelle facture' },
  NEW_CLIENT: { key: 'k', ctrl: true, description: 'Nouveau client' },
  SEARCH: { key: 'f', ctrl: true, description: 'Rechercher' },
  SAVE: { key: 's', ctrl: true, description: 'Enregistrer' },
  EXPORT: { key: 'e', ctrl: true, description: 'Exporter' },
  PRINT: { key: 'p', ctrl: true, description: 'Imprimer' },
  DASHBOARD: { key: '1', ctrl: true, description: 'Dashboard' },
  INVOICES: { key: '2', ctrl: true, description: 'Factures' },
  CLIENTS: { key: '3', ctrl: true, description: 'Clients' },
  REPORTS: { key: '4', ctrl: true, description: 'Rapports' },
  SETTINGS: { key: '5', ctrl: true, description: 'Paramètres' },
};
