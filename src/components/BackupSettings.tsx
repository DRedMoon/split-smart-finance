
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Download, Upload, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData, exportFinancialData } from '@/services/storageService';

const BackupSettings = () => {
  const navigate = useNavigate();
  const { t } = useSafeLanguage();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    backupFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    backupPassword: '',
    automaticBackup: true,
    backupLocation: 'downloads',
    customBackupPath: '',
    cloudBackup: false,
    compressionEnabled: true,
    cloudProvider: 'google_drive' as 'google_drive' | 'icloud' | 'dropbox' | 'onedrive'
  });
  
  const [backupStatus, setBackupStatus] = useState({
    lastBackup: null as Date | null,
    backupSize: 0,
    isBackingUp: false,
    backupError: null as string | null
  });

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.settings) {
      setSettings(prev => ({
        ...prev,
        backupFrequency: data.settings.backupFrequency || 'weekly',
        backupPassword: data.settings.backupPassword || '',
        automaticBackup: data.settings.automaticBackup !== false,
        cloudBackup: data.settings.cloudBackup || false,
        cloudProvider: data.settings.cloudProvider || 'google_drive',
        compressionEnabled: data.settings.compressionEnabled !== false
      }));
    }
    
    // Load backup status
    const lastBackupStr = localStorage.getItem('last-backup-date');
    const backupSizeStr = localStorage.getItem('last-backup-size');
    if (lastBackupStr) {
      setBackupStatus(prev => ({
        ...prev,
        lastBackup: new Date(lastBackupStr),
        backupSize: parseInt(backupSizeStr || '0', 10)
      }));
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    // Validate cloud backup requires password
    if (key === 'cloudBackup' && value && !settings.backupPassword) {
      toast({
        title: t('password_required'),
        description: t('cloud_backup_requires_password'),
        variant: 'destructive'
      });
      return;
    }
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to storage
    const data = loadFinancialData();
    if (data) {
      data.settings = { ...data.settings, [key]: value };
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
    setBackupStatus(prev => ({ ...prev, isBackingUp: true }));
    
    try {
      const data = loadFinancialData();
      const backupData = JSON.stringify(data);
      const backupSize = new Blob([backupData]).size;
      
      exportFinancialData(settings.backupPassword);
      
      // Update backup status
      const now = new Date();
      localStorage.setItem('last-backup-date', now.toISOString());
      localStorage.setItem('last-backup-size', backupSize.toString());
      
      setBackupStatus(prev => ({
        ...prev,
        lastBackup: now,
        backupSize,
        isBackingUp: false,
        backupError: null
      }));
      
      toast({
        title: t('backup_created'),
        description: t('backup_downloaded_to_device')
      });
    } catch (error) {
      setBackupStatus(prev => ({
        ...prev,
        isBackingUp: false,
        backupError: (error as Error).message
      }));
      
      toast({
        title: t('backup_failed'),
        description: t('backup_error_occurred'),
        variant: 'destructive'
      });
    }
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
          
          {settings.cloudBackup && (
            <div>
              <label className="text-white font-medium mb-2 block">{t('cloud_provider')}</label>
              <Select value={settings.cloudProvider} onValueChange={(value) => handleSettingChange('cloudProvider', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_drive">{t('google_drive')}</SelectItem>
                  <SelectItem value="icloud">{t('icloud')}</SelectItem>
                  <SelectItem value="dropbox">{t('dropbox')}</SelectItem>
                  <SelectItem value="onedrive">{t('onedrive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Backup Status */}
          <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
            <div className="text-white font-medium mb-2">{t('backup_status')}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-white/70">
                <span>{t('last_backup')}</span>
                <span>{backupStatus.lastBackup ? backupStatus.lastBackup.toLocaleDateString() : t('never')}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>{t('backup_size')}</span>
                <span>{backupStatus.backupSize > 0 ? `${(backupStatus.backupSize / 1024).toFixed(1)} KB` : t('unknown')}</span>
              </div>
              {backupStatus.backupError && (
                <div className="text-red-400 text-xs">{backupStatus.backupError}</div>
              )}
            </div>
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
          <Button 
            onClick={handleManualBackup} 
            disabled={backupStatus.isBackingUp}
            className="w-full bg-white text-[#294D73]"
          >
            <Download size={16} className="mr-2" />
            {backupStatus.isBackingUp ? t('creating_backup') : t('create_backup_now')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupSettings;
