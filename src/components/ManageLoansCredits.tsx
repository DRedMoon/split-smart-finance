
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/dataService';
import { migrateExistingBillCategories } from '@/services/loanService';
import { calculateInterestFromPayments } from '@/services/calculationService';

const ManageLoansCredits = () => {
  const navigate = useNavigate();
  const { t } = useSafeLanguage();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState(null);

  useEffect(() => {
    const data = loadFinancialData();
    console.log('ManageLoansCredits - Loaded financial data:', data);
    
    // Run migration to ensure proper bill categorization
    migrateExistingBillCategories();
    
    setFinancialData(data);
  }, []);
  
  const loans = financialData?.loans || [];
  console.log('ManageLoansCredits - Loans to display:', loans);

  const handleDelete = (loanId: number, loanName: string) => {
    if (financialData) {
      const updatedData = { ...financialData };
      updatedData.loans = updatedData.loans.filter(loan => loan.id !== loanId);
      updatedData.monthlyBills = updatedData.monthlyBills.filter(bill => bill.name !== loanName);
      saveFinancialData(updatedData);
      setFinancialData(updatedData);
      
      toast({
        title: 'Poistettu',
        description: `${loanName} on poistettu`
      });
    }
  };

  const calculateDisplayRates = (loan) => {
    const isCredit = loan.remaining === 'Credit Card';
    
    if (!isCredit && loan.totalAmount > 0 && loan.monthly > 0 && loan.remaining) {
      const termMonths = parseInt(loan.remaining.match(/\d+/)?.[0] || '12');
      if (termMonths > 0) {
        const calculation = calculateInterestFromPayments(
          loan.totalAmount,
          loan.monthly,
          loan.managementFee || 0,
          termMonths
        );
        
        return {
          euriborRate: calculation.euriborEstimate || 0,
          totalRate: calculation.yearlyRate || 0,
          personalMargin: loan.personalMargin || 0.5
        };
      }
    }
    
    return {
      euriborRate: loan.euriborRate || 0,
      totalRate: loan.rate || 0,
      personalMargin: loan.personalMargin || 0
    };
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen max-w-md mx-auto">Ladataan...</div>;
  }

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/loans-credits')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Hallitse lainoja ja luottoja</h1>
      </div>

      <div className="space-y-4">
        {loans.length === 0 ? (
          <Card className="bg-[#294D73] border-none">
            <CardContent className="p-8 text-center">
              <p className="text-white/70">Ei lainoja tai luottoja</p>
            </CardContent>
          </Card>
        ) : (
          loans.map((loan) => {
            const isCredit = loan.remaining === 'Credit Card';
            const rates = calculateDisplayRates(loan);
            
            console.log('ManageLoansCredits - Displaying loan:', loan.name, 'calculated rates:', rates);
            
            return (
              <Card key={loan.id} className="bg-[#294D73] border-none">
                <CardHeader>
                  <CardTitle className="text-white flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span>{loan.name}</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                        {isCredit ? 'Luottokortti' : 'Laina'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/edit-loan/${loan.id}`)}
                        className="text-white hover:bg-white/10"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(loan.id, loan.name)}
                        className="text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">
                        {isCredit ? 'Luottoraja' : 'Kokonaissumma'}
                      </p>
                      <p className="text-white font-medium">€{(loan.totalAmount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70">
                        {isCredit ? 'Käytetty luotto' : 'Nykyinen summa'}
                      </p>
                      <p className="text-white font-medium">€{(loan.currentAmount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Kuukausimaksu</p>
                      <p className="text-white font-medium">€{(loan.monthly || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Korko</p>
                      <p className="text-white font-medium">{rates.totalRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-white/70">Eräpäivä</p>
                      <p className="text-white font-medium">{loan.dueDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Jäljellä</p>
                      <p className="text-white font-medium">{loan.remaining || '-'}</p>
                    </div>
                  </div>
                  
                  {!isCredit && (
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/70">Euribor-korko</p>
                          <p className="text-white font-medium">{rates.euriborRate.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-white/70">Marginaali</p>
                          <p className="text-white font-medium">{rates.personalMargin.toFixed(2)}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCredit && loan.minimumPercent && (
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/70">Vähimmäismaksu-%</p>
                          <p className="text-white font-medium">{(loan.minimumPercent || 0).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-white/70">Hoitokulu</p>
                          <p className="text-white font-medium">€{(loan.managementFee || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {loan.totalPayback && loan.totalPayback > 0 && (
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/70">Kokonaismaksu</p>
                          <p className="text-white font-bold">€{loan.totalPayback.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-white/70">Kokonaiskorko</p>
                          <p className="text-white font-medium text-red-300">
                            €{(loan.totalPayback - (loan.currentAmount || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManageLoansCredits;
