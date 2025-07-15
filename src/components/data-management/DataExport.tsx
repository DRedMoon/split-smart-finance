import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Database, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { exportToJSON, exportToCSV } from '@/services/exportImportService';
import { loadFinancialData } from '@/services/storageService';

const DataExport = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    try {
      // Simulate progress
      setExportProgress(20);
      
      // Load data
      const data = loadFinancialData();
      if (!data) {
        throw new Error(t('no_data_to_export'));
      }
      
      setExportProgress(50);
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `financial_data_${dateStr}.${format}`;
      
      setExportProgress(80);
      
      // Export data
      if (format === 'json') {
        exportToJSON(data, filename);
      } else {
        exportToCSV(data, filename);
      }
      
      setExportProgress(100);
      setExportComplete(true);
      
      toast({
        title: t('export_successful'),
        description: t('data_exported_successfully'),
      });
      
    } catch (error) {
      toast({
        title: t('export_failed'),
        description: error instanceof Error ? error.message : t('export_failed'),
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
      setTimeout(() => {
        setExportProgress(0);
        setExportComplete(false);
      }, 3000);
    }
  };

  const getDataStats = () => {
    const data = loadFinancialData();
    if (!data) return { transactions: 0, bills: 0, loans: 0, categories: 0 };
    
    return {
      transactions: data.transactions?.length || 0,
      bills: data.monthlyBills?.length || 0,
      loans: data.loans?.length || 0,
      categories: data.categories?.length || 0
    };
  };

  const stats = getDataStats();
  const hasData = stats.transactions > 0 || stats.bills > 0 || stats.loans > 0;

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Download size={20} />
          <span>{t('export_data')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-white/70 text-sm">
          {t('export_description')}
        </div>
        
        {/* Data Statistics */}
        <div className="bg-white/10 p-4 rounded-lg">
          <div className="text-white font-medium text-sm mb-3">
            {t('available_data')}:
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Database size={16} className="text-white/70" />
              <span className="text-white/70">{t('transactions')}:</span>
              <span className="text-white font-medium">{stats.transactions}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database size={16} className="text-white/70" />
              <span className="text-white/70">{t('monthly_bills')}:</span>
              <span className="text-white font-medium">{stats.bills}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database size={16} className="text-white/70" />
              <span className="text-white/70">{t('loans')}:</span>
              <span className="text-white font-medium">{stats.loans}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database size={16} className="text-white/70" />
              <span className="text-white/70">{t('categories')}:</span>
              <span className="text-white font-medium">{stats.categories}</span>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <div className="text-white font-medium text-sm">
            {t('export_format')}:
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {/* JSON Export */}
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">JSON</div>
                  <div className="text-white/70 text-sm">{t('complete_backup_format')}</div>
                </div>
                <Button
                  onClick={() => handleExport('json')}
                  disabled={!hasData || exporting}
                  className="bg-[#192E45] hover:bg-[#1f3a5f] text-white"
                >
                  <FileText size={16} className="mr-2" />
                  {t('export_json')}
                </Button>
              </div>
            </div>

            {/* CSV Export */}
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">CSV</div>
                  <div className="text-white/70 text-sm">{t('spreadsheet_compatible')}</div>
                </div>
                <Button
                  onClick={() => handleExport('csv')}
                  disabled={!hasData || exporting}
                  className="bg-[#192E45] hover:bg-[#1f3a5f] text-white"
                >
                  <FileText size={16} className="mr-2" />
                  {t('export_csv')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        {exporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-white text-sm">
              <span>{t('exporting_data')}</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="bg-white/20" />
          </div>
        )}

        {/* Success Message */}
        {exportComplete && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              {t('export_completed_successfully')}
            </AlertDescription>
          </Alert>
        )}

        {/* No Data Warning */}
        {!hasData && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertDescription className="text-yellow-300">
              {t('no_data_available_for_export')}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/20 p-4 rounded-lg">
          <div className="text-blue-300 font-medium text-sm mb-2">
            {t('export_instructions')}:
          </div>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• {t('json_full_backup')}</li>
            <li>• {t('csv_for_analysis')}</li>
            <li>• {t('save_files_securely')}</li>
            <li>• {t('regular_backups_recommended')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExport;