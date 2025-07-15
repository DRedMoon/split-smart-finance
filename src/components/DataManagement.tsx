
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, saveFinancialData, clearAllData, type FinancialData } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';

const DataManagement = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
  }, []);

  const refreshData = () => {
    const data = loadFinancialData();
    setFinancialData(data);
  };

  const deleteTransaction = (id: number) => {
    if (!financialData) return;
    
    const updatedData = { ...financialData };
    const transaction = updatedData.transactions.find(t => t.id === id);
    
    if (transaction) {
      updatedData.transactions = updatedData.transactions.filter(t => t.id !== id);
      // Recalculate balance
      updatedData.balance = updatedData.transactions.reduce((sum, t) => sum + t.amount, 0);
      saveFinancialData(updatedData);
      refreshData();
      
      toast({
        title: t('transaction_deleted'),
        description: `${transaction.name} ${t('item_deleted')}`,
      });
    }
  };

  const deleteLoan = (id: number) => {
    if (!financialData) return;
    
    const updatedData = { ...financialData };
    const loan = updatedData.loans.find(l => l.id === id);
    
    if (loan) {
      updatedData.loans = updatedData.loans.filter(l => l.id !== id);
      // Also remove associated monthly bill
      updatedData.monthlyBills = updatedData.monthlyBills.filter(bill => bill.name !== loan.name);
      saveFinancialData(updatedData);
      refreshData();
      
      toast({
        title: t('loan_deleted'),
        description: `${loan.name} ${t('item_deleted')}`,
      });
    }
  };

  const deleteMonthlyBill = (id: number) => {
    if (!financialData) return;
    
    const updatedData = { ...financialData };
    const bill = updatedData.monthlyBills.find(b => b.id === id);
    
    if (bill) {
      updatedData.monthlyBills = updatedData.monthlyBills.filter(b => b.id !== id);
      saveFinancialData(updatedData);
      refreshData();
      
      toast({
        title: t('monthly_payment_deleted'),
        description: `${bill.name} ${t('item_deleted')}`,
      });
    }
  };

  const handleClearAllData = () => {
    if (confirm(t('confirm_delete_all'))) {
      clearAllData();
      refreshData();
      toast({
        title: t('all_data_deleted'),
        description: t('app_reset'),
      });
    }
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen">{t('loading')}</div>;
  }

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('data_management')}</h1>
      </div>

      {/* Transactions */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('transactions')} ({financialData.transactions.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {financialData.transactions.length === 0 ? (
            <div className="text-white/70 text-center py-4">{t('no_transactions')}</div>
          ) : (
            financialData.transactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div>
                  <div className="font-medium text-white">{transaction.name}</div>
                  <div className="text-sm text-white/70">{transaction.date} • €{Math.abs(transaction.amount)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTransaction(transaction.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Loans */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('loans')} ({financialData.loans.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {financialData.loans.length === 0 ? (
            <div className="text-white/70 text-center py-4">{t('no_loans')}</div>
          ) : (
            financialData.loans.map(loan => (
              <div key={loan.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div>
                  <div className="font-medium text-white">{loan.name}</div>
                  <div className="text-sm text-white/70">€{loan.currentAmount} • €{loan.monthly}{t('per_month')}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteLoan(loan.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Monthly Bills */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('monthly_payments')} ({financialData.monthlyBills.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {financialData.monthlyBills.length === 0 ? (
            <div className="text-white/70 text-center py-4">{t('no_monthly_payments')}</div>
          ) : (
            financialData.monthlyBills.map(bill => (
              <div key={bill.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div>
                  <div className="font-medium text-white">{bill.name}</div>
                  <div className="text-sm text-white/70">€{bill.amount} • {bill.dueDate}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMonthlyBill(bill.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-900/20 border-red-500/30">
        <CardHeader>
        <CardTitle className="text-red-400 flex items-center space-x-2">
          <AlertTriangle size={20} />
          <span>{t('danger_zone')}</span>
        </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleClearAllData}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {t('delete_all_data')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;
