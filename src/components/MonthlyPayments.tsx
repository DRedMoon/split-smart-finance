
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, saveFinancialData, payBill, type FinancialData } from '@/services/storageService';
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
      const bill = updatedData.monthlyBills[billIndex];
      const wasPaid = bill.paid;
      
      // Toggle payment status
      updatedData.monthlyBills[billIndex].paid = !bill.paid;
      
      // Handle balance changes and loan reductions
      if (!wasPaid) {
        // Bill is being marked as paid
        payBill(bill.id, bill.amount, bill.type);
        toast({
          title: "Merkitty maksetuksi",
          description: `${bill.name} maksettu - Saldo päivitetty`,
        });
      } else {
        // Bill is being marked as unpaid - reverse the payment
        updatedData.balance += bill.amount;
        
        // If it was a loan/credit payment, restore the loan amount
        if (bill.type === 'loan_payment' || bill.type === 'credit_payment') {
          const loanIndex = updatedData.loans.findIndex(loan => 
            loan.name.toLowerCase().includes(bill.name.toLowerCase().split(' - ')[0].toLowerCase())
          );
          if (loanIndex !== -1) {
            updatedData.loans[loanIndex].currentAmount += bill.amount;
          }
        }
        
        toast({
          title: "Merkitty maksamattomaksi",
          description: `${bill.name} peruttu - Saldo palautettu`,
        });
      }
      
      saveFinancialData(updatedData);
      setFinancialData(updatedData);
    }
  };

  const handleBackNavigation = () => {
    // Navigate back to dashboard and set it to monthly payments view
    navigate('/?view=monthly-payments');
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen max-w-md mx-auto">Ladataan...</div>;
  }

  // Filter out loan and credit payments - only show actual recurring bills
  const actualMonthlyBills = financialData.monthlyBills.filter(bill => 
    bill.type !== 'laina' && 
    bill.type !== 'luottokortti' && 
    bill.type !== 'loan_payment' && 
    bill.type !== 'credit_payment'
  );

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="text-white hover:bg-white/10">
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
        {actualMonthlyBills.length === 0 ? (
          <Card className="bg-[#294D73] border-none">
            <CardContent className="p-6 text-center text-white/70">
              Ei kuukausimaksuja lisätty
            </CardContent>
          </Card>
        ) : (
          actualMonthlyBills.map(bill => (
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
                      className={`p-2 ${bill.paid ? 'text-green-400 hover:bg-green-400/10' : 'text-red-400 hover:bg-red-400/10'}`}
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
              <span className="font-bold">€{actualMonthlyBills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Maksettu:</span>
              <span className="font-bold text-green-400">€{actualMonthlyBills.filter(bill => bill.paid).reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Jäljellä:</span>
              <span className="font-bold text-red-400">€{actualMonthlyBills.filter(bill => !bill.paid).reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyPayments;
