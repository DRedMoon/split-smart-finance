
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, updateTransaction, deleteTransaction, type FinancialData } from '@/services/storageService';
import { toast } from '@/hooks/use-toast';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '', category: '' });

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
  }, []);

  const refreshData = () => {
    const data = loadFinancialData();
    setFinancialData(data);
  };

  if (!financialData) {
    return <div className="p-4 text-white">Ladataan...</div>;
  }

  const filteredTransactions = financialData.transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      food: '🍔',
      transport: '🚗',
      utilities: '💡',
      shopping: '🛍️',
      loan: '🏦',
      salary: '💰',
      insurance: '🛡️',
      subscriptions: '📺',
      entertainment: '🎬',
      income: '💰',
      other: '📝'
    };
    return emojis[category] || '📝';
  };

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
      
      updateTransaction(editingTransaction.id, {
        name: editForm.name,
        amount: updatedAmount,
        category: editForm.category
      });
      
      setEditingTransaction(null);
      refreshData();
      toast({
        title: "Tapahtuma päivitetty",
        description: "Tapahtuma on päivitetty onnistuneesti.",
      });
    }
  };

  const handleDeleteTransaction = (id: number) => {
    deleteTransaction(id);
    refreshData();
    toast({
      title: "Tapahtuma poistettu",
      description: "Tapahtuma on poistettu onnistuneesti.",
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
        <Button onClick={() => navigate('/add')} size="sm" className="bg-[#294D73] hover:bg-[#1f3a5f]">
          <Plus size={16} />
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Hae tapahtumia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#294D73] border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="bg-[#294D73] border-white/20 text-white">
            <SelectValue placeholder="Suodata tyypillä" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Kaikki Tapahtumat</SelectItem>
            <SelectItem value="expense">Kulut</SelectItem>
            <SelectItem value="income">Tulot</SelectItem>
            <SelectItem value="loan">Lainat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction History */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <Card className="bg-[#294D73] border-none">
            <CardContent className="p-6 text-center text-white/70">
              Ei tapahtumia löytynyt
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map(transaction => (
            <Card key={transaction.id} className="bg-[#294D73] border-none">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getCategoryEmoji(transaction.category)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{transaction.name}</div>
                      <div className="text-sm text-white/60">
                        {transaction.date} • {transaction.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className={`font-bold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                      </div>
                      <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                        {transaction.type === 'income' ? 'Tulo' : transaction.type === 'expense' ? 'Kulu' : 'Laina'}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                          <Edit size={16} className="mr-2" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600"
                        >
                          <Trash size={16} className="mr-2" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="bg-[#294D73] border-none text-white">
          <DialogHeader>
            <DialogTitle>Muokkaa Tapahtumaa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Nimi</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="editAmount">Summa</Label>
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
              <Label htmlFor="editCategory">Kategoria</Label>
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
                Tallenna
              </Button>
              <Button onClick={() => setEditingTransaction(null)} variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                Peruuta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionHistory;
