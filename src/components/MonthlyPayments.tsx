
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, saveFinancialData, type FinancialData } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';

const MonthlyPayments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
  }, []);

  const togglePaymentStatus = (id: number) => {
    if (!financialData) return;
    
    const updatedData = { ...financialData };
    const billIndex = updatedData.monthlyBills.findIndex(bill => bill.id === id);
    
    if (billIndex !== -1) {
      updatedData.monthlyBills[billIndex].paid = !updatedData.monthlyBills[billIndex].paid;
      saveFinancialData(updatedData);
      setFinancialData(updatedData);
      
      toast({
        title: updatedData.monthlyBills[billIndex].paid ? "Merkitty maksetuksi" : "Merkitty maksamattomaksi",
        description: `${updatedData.monthlyBills[billIndex].name} tila päivitetty`,
      });
    }
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen">Ladataan...</div>;
  }

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t('monthly_payments')}</h1>
        </div>
        <Button onClick={() => navigate('/add')} size="sm" className="bg-[#294D73] hover:bg-[#1f3a5f]">
          <Plus size={16} />
        </Button>
      </div>

      {/* Monthly Bills */}
      <div className="space-y-3">
        {financialData.monthlyBills.length === 0 ? (
          <Card className="bg-[#294D73] border-none">
            <CardContent className="p-6 text-center text-white/70">
              Ei kuukausimaksuja lisätty
            </CardContent>
          </Card>
        ) : (
          financialData.monthlyBills.map(bill => (
            <Card key={bill.id} className={`bg-[#294D73] border-none ${bill.paid ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">{bill.name}</span>
                      <Badge variant={bill.paid ? 'default' : 'secondary'} className="text-xs">
                        {bill.paid ? t('paid') : t('pending')}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/60">
                      {t('due')} {bill.dueDate} • {bill.type}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold text-white">€{bill.amount}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePaymentStatus(bill.id)}
                      className={`p-2 ${bill.paid ? 'text-green-400 hover:bg-green-400/10' : 'text-white/70 hover:bg-white/10'}`}
                    >
                      {bill.paid ? <Check size={16} /> : <X size={16} />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card className="mt-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">Yhteenveto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-white">
            <div className="flex justify-between">
              <span>Kokonaismäärä:</span>
              <span className="font-bold">€{financialData.monthlyBills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Maksettu:</span>
              <span className="font-bold text-green-400">€{financialData.monthlyBills.filter(bill => bill.paid).reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Jäljellä:</span>
              <span className="font-bold text-red-400">€{financialData.monthlyBills.filter(bill => !bill.paid).reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyPayments;
