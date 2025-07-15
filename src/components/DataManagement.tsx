import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import DataExport from './data-management/DataExport';
import DataImport from './data-management/DataImport';

const DataManagement = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('export');

  const handleImportComplete = () => {
    // Refresh the page or update state to reflect imported data
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('data_management')}</h1>
      </div>

      {/* Overview Card */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('backup_and_restore')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white/70 text-sm">
            {t('backup_restore_description')}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-[#294D73] border-none">
          <TabsTrigger 
            value="export" 
            className="data-[state=active]:bg-[#192E45] data-[state=active]:text-white text-white/70"
          >
            <Download size={16} className="mr-2" />
            {t('export')}
          </TabsTrigger>
          <TabsTrigger 
            value="import" 
            className="data-[state=active]:bg-[#192E45] data-[state=active]:text-white text-white/70"
          >
            <Upload size={16} className="mr-2" />
            {t('import_data')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <DataExport />
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <DataImport onImportComplete={handleImportComplete} />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('quick_actions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start border-white/20 text-white hover:bg-white/10"
            onClick={() => setActiveTab('export')}
          >
            <Download size={16} className="mr-2" />
            {t('create_backup')}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start border-white/20 text-white hover:bg-white/10"
            onClick={() => setActiveTab('import')}
          >
            <Upload size={16} className="mr-2" />
            {t('restore_from_backup')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;