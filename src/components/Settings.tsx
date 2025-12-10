import { useState, useRef } from 'react';
import { Building2, Upload, Save, Download, Moon, Sun, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { Switch } from './ui/switch';

export function Settings() {
  const { settings, updateSettings, exportData, importData } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [logoPreview, setLogoPreview] = useState(settings.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Le fichier doit faire moins de 2 Mo');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setLocalSettings({ ...localSettings, logo: base64 });
        toast.success('Logo chargé !');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('Paramètres enregistrés avec succès !');
  };

  const handleExport = () => {
    exportData();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        importData(content);
        toast.success('Données importées avec succès !');
        // Reload settings after import
        window.location.reload();
      };
      reader.readAsText(file);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !localSettings.darkMode;
    setLocalSettings({ ...localSettings, darkMode: newDarkMode });
    updateSettings({ darkMode: newDarkMode });
    toast.info(newDarkMode ? 'Mode sombre activé' : 'Mode clair activé');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-500">Configurez les informations de votre entreprise</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <Button
              onClick={handleSave}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              <Save className="w-5 h-5 mr-2" />
              Enregistrer
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200"
            >
              <Download className="w-5 h-5 mr-2" />
              Exporter données
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <Button
              onClick={() => importInputRef.current?.click()}
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200"
            >
              <Upload className="w-5 h-5 mr-2" />
              Importer données
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      {/* Company Logo */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Logo de l'entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-gray-600 mb-4">
                Téléchargez le logo de votre entreprise. Format recommandé : PNG, JPG (max 2 Mo)
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="rounded-xl border-gray-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger le logo
                </Button>
                {logoPreview && (
                  <Button
                    onClick={() => {
                      setLogoPreview('');
                      setLocalSettings({ ...localSettings, logo: '' });
                      toast.success('Logo supprimé');
                    }}
                    variant="ghost"
                    className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Informations de l'entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName" className="text-gray-700">
                Nom de l'entreprise
              </Label>
              <Input
                id="companyName"
                value={localSettings.companyName}
                onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-700">
                Téléphone
              </Label>
              <Input
                id="phone"
                value={localSettings.phone}
                onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={localSettings.email}
                onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-gray-700">
                Adresse
              </Label>
              <Input
                id="address"
                value={localSettings.address}
                onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Settings */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Configuration des factures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prefix" className="text-gray-700">
                Préfixe de numérotation
              </Label>
              <Input
                id="prefix"
                value={localSettings.invoicePrefix}
                onChange={(e) => setLocalSettings({ ...localSettings, invoicePrefix: e.target.value })}
                placeholder="Ex: F-, INV-"
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="number" className="text-gray-700">
                Numéro actuel
              </Label>
              <Input
                id="number"
                type="number"
                value={localSettings.invoiceNumber}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, invoiceNumber: parseInt(e.target.value) || 0 })
                }
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-600 mb-2">Aperçu de la numérotation</p>
            <p className="text-gray-900">
              Prochaine facture : {localSettings.invoicePrefix}
              {String(localSettings.invoiceNumber).padStart(6, '0')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Currency & Tax */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Devise et taxes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency" className="text-gray-700">
                Devise
              </Label>
              <Select
                value={localSettings.currency}
                onValueChange={(value) => setLocalSettings({ ...localSettings, currency: value })}
              >
                <SelectTrigger id="currency" className="mt-2 rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCFA">FCFA (Franc CFA)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="USD">USD (Dollar américain)</SelectItem>
                  <SelectItem value="GBP">GBP (Livre sterling)</SelectItem>
                  <SelectItem value="CAD">CAD (Dollar canadien)</SelectItem>
                  <SelectItem value="CHF">CHF (Franc suisse)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tax" className="text-gray-700">
                Taux de TVA (%)
              </Label>
              <Input
                id="tax"
                type="number"
                value={localSettings.taxRate}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, taxRate: parseFloat(e.target.value) || 0 })
                }
                className="mt-2 rounded-xl border-gray-200"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-600 mb-2">Calcul TVA</p>
            <p className="text-gray-900">
              Pour 100 000 {localSettings.currency} :{' '}
              {(100000 * (localSettings.taxRate / 100)).toLocaleString('fr-FR')} {localSettings.currency} de TVA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Apparence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {localSettings.darkMode ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600" />
              )}
              <div>
                <p className="text-gray-900">Mode sombre</p>
                <p className="text-gray-500">Activer le thème sombre</p>
              </div>
            </div>
            <Switch checked={localSettings.darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-gray-900">Langue</p>
                <p className="text-gray-500">Choisir la langue de l'interface</p>
              </div>
            </div>
            <Select
              value={localSettings.language}
              onValueChange={(value: 'fr' | 'en') => setLocalSettings({ ...localSettings, language: value })}
            >
              <SelectTrigger className="w-32 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Sauvegarde et restauration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-900 mb-2">⚠️ Important</p>
            <p className="text-amber-700">
              Exportez régulièrement vos données pour éviter toute perte. Le fichier exporté contient toutes vos
              factures, clients et paramètres.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleExport} variant="outline" className="h-14 rounded-xl border-gray-200">
              <Download className="w-5 h-5 mr-2" />
              Exporter toutes les données
            </Button>
            <Button
              onClick={() => importInputRef.current?.click()}
              variant="outline"
              className="h-14 rounded-xl border-gray-200"
            >
              <Upload className="w-5 h-5 mr-2" />
              Importer des données
            </Button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-900 mb-2">🔴 Zone dangereuse</p>
            <p className="text-red-700 mb-3">
              L'importation de données remplacera toutes vos données actuelles. Assurez-vous d'avoir une sauvegarde
              avant de procéder.
            </p>
            <Button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
                  localStorage.clear();
                  window.location.reload();
                  toast.success('Données réinitialisées');
                }
              }}
              variant="outline"
              className="rounded-xl border-red-300 text-red-700 hover:bg-red-100"
            >
              Réinitialiser toutes les données
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="h-14 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Save className="w-5 h-5 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
