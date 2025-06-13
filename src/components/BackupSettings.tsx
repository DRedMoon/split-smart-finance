
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Shield, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData, exportFinancialData, importFinancialData, performAutomaticBackup } from '@/services/storageService';

const BackupSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [backupPassword, setBackupPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [importPassword, setImportPassword] = useState('');

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.settings) {
      setBackupFrequency(data.settings.backupFrequency);
      setUsePassword(!!data.settings.backupPassword);
    }
  }, []);

  const handleFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly') => {
    setBackupFrequency(frequency);
    const data = loadFinancialData();
    if (data) {
      data.settings.backupFrequency = frequency;
      saveFinancialData(data);
      toast({
        title: "Varmuuskopioasetukset päivitetty",
        description: `Automaattiset varmuuskopiot: ${frequency === 'daily' ? 'päivittäin' : frequency === 'weekly' ? 'viikoittain' : 'kuukausittain'}`,
      });
    }
  };

  const handlePasswordToggle = (enabled: boolean) => {
    setUsePassword(enabled);
    const data = loadFinancialData();
    if (data) {
      data.settings.backupPassword = enabled ? backupPassword : undefined;
      saveFinancialData(data);
    }
  };

  const handleExportWithPassword = () => {
    exportFinancialData(usePassword ? backupPassword : undefined);
    toast({
      title: "Varmuuskopio luotu",
      description: usePassword ? "Suojattu varmuuskopio on tallennettu" : "Varmuuskopio on tallennettu",
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFinancialData(file, importPassword)
        .then(() => {
          toast({
            title: "Tiedot tuotu",
            description: "Varmuuskopio on palautettu onnistuneesti",
          });
        })
        .catch((error) => {
          toast({
            title: "Virhe",
            description: error.message === 'Invalid password' ? 'Väärä salasana' : 'Tietojen tuonti epäonnistui',
            variant: "destructive"
          });
        });
    }
  };

  const handleManualBackup = () => {
    performAutomaticBackup();
    toast({
      title: "Varmuuskopio luotu",
      description: "Manuaalinen varmuuskopio on tallennetty",
    });
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Varmuuskopioasetukset</h1>
      </div>

      {/* Backup Frequency */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar size={20} />
            <span>Automaattiset varmuuskopiot</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Varmuuskopioiden tiheys</Label>
            <Select value={backupFrequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Päivittäin</SelectItem>
                <SelectItem value="weekly">Viikoittain</SelectItem>
                <SelectItem value="monthly">Kuukausittain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleManualBackup} className="w-full bg-white text-[#294D73]">
            Luo varmuuskopio nyt
          </Button>
        </CardContent>
      </Card>

      {/* Password Protection */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield size={20} />
            <span>Salasanasuojaus</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">Suojaa varmuuskopiot salasanalla</div>
              <div className="text-sm text-white/70">Lisäturvallisuus varmuuskopioille</div>
            </div>
            <Switch checked={usePassword} onCheckedChange={handlePasswordToggle} />
          </div>
          {usePassword && (
            <div>
              <Label htmlFor="backup-password" className="text-white">Varmuuskopion salasana</Label>
              <Input
                id="backup-password"
                type="password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="Syötä salasana"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export/Import */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">Manuaalinen varmuuskopiointi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExportWithPassword} className="w-full bg-white text-[#294D73]">
            <Download size={16} className="mr-2" />
            Vie tiedot (.json)
          </Button>
          
          <div className="space-y-2">
            <Button onClick={() => document.getElementById('backup-import')?.click()} variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
              <Upload size={16} className="mr-2" />
              Tuo varmuuskopio
            </Button>
            
            <div>
              <Label htmlFor="import-password" className="text-white text-sm">Salasana (jos tarvitaan)</Label>
              <Input
                id="import-password"
                type="password"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white mt-1"
                placeholder="Varmuuskopion salasana"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        id="backup-import"
        type="file"
        accept=".json"
        onChange={handleImportData}
        className="hidden"
      />
    </div>
  );
};

export default BackupSettings;
