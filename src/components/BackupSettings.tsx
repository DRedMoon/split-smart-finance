
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Download, Upload, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData, exportFinancialData } from '@/services/storageService';

const BackupSettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    backupFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    backupPassword: '',
    automaticBackup: true,
    backupLocation: 'downloads',
    customBackupPath: '',
    cloudBackup: false,
    compressionEnabled: true
  });

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.settings) {
      setSettings(prev => ({
        ...prev,
        backupFrequency: data.settings.backupFrequency,
        backupPassword: data.settings.backupPassword || ''
      }));
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to storage
    const data = loadFinancialData();
    if (data) {
      if (key === 'backupFrequency') {
        data.settings.backupFrequency = value;
      }
      if (key === 'backupPassword') {
        data.settings.backupPassword = value;
      }
      saveFinancialData(data);
    }
    
    toast({
      title: t('backup_setting_updated'),
      description: `${key} ${t('updated_successfully')}`
    });
  };

  const handleChooseBackupFolder = async () => {
    try {
      // Web File System Access API (if supported)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        setSettings(prev => ({ ...prev, customBackupPath: dirHandle.name }));
        toast({
          title: t('folder_selected'),
          description: `${t('backups_will_be_saved_to_folder')}: ${dirHandle.name}`
        });
      } else {
        toast({
          title: t('not_supported'),
          description: t('browser_does_not_support_folder_selection'),
          variant: "destructive"
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: t('error'),
          description: t('folder_selection_failed'),
          variant: "destructive"
        });
      }
    }
  };

  const handleManualBackup = () => {
    exportFinancialData(settings.backupPassword);
    toast({
      title: t('backup_created'),
      description: t('backup_downloaded_to_device')
    });
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('backup')}</h1>
      </div>

      {/* Automatic Backup Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock size={20} />
            <span>{t('automatic_backup')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('automatic_backup')}</div>
              <div className="text-sm text-white/70">{t('create_backups_automatically')}</div>
            </div>
            <Switch 
              checked={settings.automaticBackup}
              onCheckedChange={(checked) => handleSettingChange('automaticBackup', checked)}
            />
          </div>
          
          {settings.automaticBackup && (
            <div>
              <label className="text-white font-medium mb-2 block">{t('backup_frequency')}</label>
              <Select value={settings.backupFrequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => handleSettingChange('backupFrequency', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('daily')}</SelectItem>
                  <SelectItem value="weekly">{t('weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('monthly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Location Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FolderOpen size={20} />
            <span>{t('backup_location')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 block">{t('storage_location')}</label>
            <Select value={settings.backupLocation} onValueChange={(value) => handleSettingChange('backupLocation', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downloads">{t('downloads')}</SelectItem>
                <SelectItem value="documents">{t('documents')}</SelectItem>
                <SelectItem value="custom">{t('custom_folder')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {settings.backupLocation === 'custom' && (
            <div className="space-y-2">
              <Button
                onClick={handleChooseBackupFolder}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <FolderOpen size={16} className="mr-2" />
                {t('choose_backup_folder')}
              </Button>
              {settings.customBackupPath && (
                <p className="text-white/70 text-sm">{t('selected')}: {settings.customBackupPath}</p>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('file_compression')}</div>
              <div className="text-sm text-white/70">{t('compress_backup_files')}</div>
            </div>
            <Switch 
              checked={settings.compressionEnabled}
              onCheckedChange={(checked) => handleSettingChange('compressionEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield size={20} />
            <span>{t('security')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="backup-password" className="text-white">{t('backup_password_optional')}</Label>
            <Input
              id="backup-password"
              type="password"
              value={settings.backupPassword}
              onChange={(e) => handleSettingChange('backupPassword', e.target.value)}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder={t('enter_password_to_protect_backups')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('cloud_storage')}</div>
              <div className="text-sm text-white/70">{t('save_backups_to_cloud')}</div>
            </div>
            <Switch 
              checked={settings.cloudBackup}
              onCheckedChange={(checked) => handleSettingChange('cloudBackup', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Manual Backup */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Download size={20} />
            <span>{t('manual_backup')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleManualBackup} className="w-full bg-white text-[#294D73]">
            <Download size={16} className="mr-2" />
            {t('create_backup_now')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupSettings;
