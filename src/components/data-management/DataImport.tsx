import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { importFromJSON, mergeImportedData } from '@/services/exportImportService';
import { loadFinancialData, saveFinancialData, type FinancialData } from '@/services/storageService';

interface DataImportProps {
  onImportComplete: () => void;
}

const DataImport = ({ onImportComplete }: DataImportProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details?: { added: number; skipped: number; total: number };
  } | null>(null);

  const handleFileImport = async (file: File) => {
    setImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      // Simulate progress
      setImportProgress(20);
      
      // Import data from file
      const importedData = await importFromJSON(file);
      setImportProgress(50);
      
      // Load existing data
      const existingData = loadFinancialData();
      setImportProgress(70);
      
      // Merge data
      const mergedData = existingData ? mergeImportedData(existingData, importedData) : importedData;
      setImportProgress(90);
      
      // Save merged data
      saveFinancialData(mergedData);
      setImportProgress(100);
      
      // Calculate statistics
      const addedTransactions = (importedData.transactions?.length || 0);
      const addedBills = (importedData.monthlyBills?.length || 0);
      const addedLoans = (importedData.loans?.length || 0);
      const totalAdded = addedTransactions + addedBills + addedLoans;
      
      setImportResult({
        success: true,
        message: t('import_successful'),
        details: {
          added: totalAdded,
          skipped: 0,
          total: totalAdded
        }
      });
      
      toast({
        title: t('import_successful'),
        description: t('data_imported_successfully'),
      });
      
      onImportComplete();
      
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : t('import_failed')
      });
      
      toast({
        title: t('import_failed'),
        description: error instanceof Error ? error.message : t('import_failed'),
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
      setTimeout(() => setImportProgress(0), 2000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        handleFileImport(file);
      } else {
        toast({
          title: t('invalid_file_format'),
          description: t('only_json_files_supported'),
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Upload size={20} />
          <span>{t('import_data')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-white/70 text-sm">
          {t('import_description')}
        </div>
        
        {/* File Upload */}
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <FileText size={48} className="text-white/50" />
            <div className="text-white">
              <div className="font-medium">{t('select_file_to_import')}</div>
              <div className="text-sm text-white/70">{t('json_files_only')}</div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={importing}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                disabled={importing}
                asChild
              >
                <span>{importing ? t('importing') : t('select_file')}</span>
              </Button>
            </label>
          </div>
        </div>

        {/* Progress */}
        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-white text-sm">
              <span>{t('importing_data')}</span>
              <span>{importProgress}%</span>
            </div>
            <Progress value={importProgress} className="bg-white/20" />
          </div>
        )}

        {/* Results */}
        {importResult && (
          <Alert className={importResult.success ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}>
            <div className="flex items-center space-x-2">
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription className={importResult.success ? 'text-green-300' : 'text-red-300'}>
                {importResult.message}
                {importResult.details && (
                  <div className="mt-2 text-sm">
                    {t('items_added')}: {importResult.details.added} / {importResult.details.total}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/20 p-4 rounded-lg">
          <div className="text-blue-300 font-medium text-sm mb-2">
            {t('import_instructions')}:
          </div>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• {t('backup_current_data')}</li>
            <li>• {t('use_exported_json_files')}</li>
            <li>• {t('duplicate_entries_skipped')}</li>
            <li>• {t('import_cannot_be_undone')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataImport;