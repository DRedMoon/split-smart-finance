
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { loadFinancialData, updateTransaction, deleteTransaction, type FinancialData } from '@/services/storageService';
import { toast } from '@/hooks/use-toast';
import TransactionFilters from './transaction-history/TransactionFilters';
import TransactionItem from './transaction-history/TransactionItem';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { t } = useSafeLanguage();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '', category: '' });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
    
    // Set default start date to 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setDateRange(prev => ({
      ...prev,
      start: thirtyDaysAgo.toISOString().split('T')[0]
    }));
  }, []);

  const refreshData = () => {
    const data = loadFinancialData();
    setFinancialData(data);
  };

  if (!financialData) {
    return <div className="p-4 text-white">{t('loading')}</div>;
  }

  const filteredTransactions = financialData.transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = transactionDate >= startDate && transactionDate <= endDate;
    }
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setEditForm({
      name: transaction.name,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category
    });
  };

  const handleSaveEdit = () => {
    if (editingTransaction) {
      const amount = parseFloat(editForm.amount);
      const updatedAmount = editingTransaction.type === 'income' ? amount : -amount;
      
      try {
        updateTransaction(editingTransaction.id, {
          name: editForm.name,
          amount: updatedAmount,
          category: editForm.category
        });
        
        setEditingTransaction(null);
        refreshData();
        toast({
          title: t('success'),
          description: t('transaction_updated'),
        });
      } catch (error) {
        toast({
          title: t('error'),
          description: t('failed_to_update_transaction'),
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteTransaction = (id: number) => {
    if (confirm(t('confirm_delete_transaction'))) {
      try {
        deleteTransaction(id);
        refreshData();
        toast({
          title: t('success'),
          description: t('transaction_deleted'),
        });
      } catch (error) {
        toast({
          title: t('error'),
          description: t('failed_to_delete_transaction'),
          variant: "destructive"
        });
      }
    }
  };

  const handleExportTransactions = () => {
    const dataStr = JSON.stringify(filteredTransactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('success'),
      description: t('transactions_exported'),
    });
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t('all_transactions')}</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportTransactions} size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Download size={16} />
          </Button>
          <Button onClick={() => navigate('/add')} size="sm" className="bg-[#294D73] hover:bg-[#1f3a5f]">
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Results Summary */}
      <div className="mb-4 text-white/70 text-sm">
        {t('showing_transactions')}: {filteredTransactions.length} / {financialData.transactions.length}
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-white/70 py-8">
            {t('no_transactions_found')}
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="bg-[#294D73] border-none text-white">
          <DialogHeader>
            <DialogTitle>{t('edit_transaction')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">{t('name')}</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="editAmount">{t('amount')}</Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="editCategory">{t('category')}</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">{t('food_dining')}</SelectItem>
                  <SelectItem value="transport">{t('transportation')}</SelectItem>
                  <SelectItem value="utilities">{t('utilities')}</SelectItem>
                  <SelectItem value="entertainment">{t('entertainment')}</SelectItem>
                  <SelectItem value="shopping">{t('shopping')}</SelectItem>
                  <SelectItem value="insurance">{t('insurance')}</SelectItem>
                  <SelectItem value="subscriptions">{t('subscriptions')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveEdit} className="flex-1 bg-white text-[#294D73] hover:bg-white/90">
                {t('save')}
              </Button>
              <Button onClick={() => setEditingTransaction(null)} variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionHistory;
