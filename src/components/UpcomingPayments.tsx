
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, getThisWeekUpcomingPayments, type FinancialData } from '@/services/storageService';

const UpcomingPayments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [thisWeekPayments, setThisWeekPayments] = useState<any[]>([]);

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
    const weekPayments = getThisWeekUpcomingPayments();
    setThisWeekPayments(weekPayments);
  }, []);

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen">Ladataan...</div>;
  }

  const allUpcomingPayments = financialData.monthlyBills.filter(bill => !bill.paid);

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t('upcoming')}</h1>
        </div>
        <Button onClick={() => navigate('/add')} size="sm" className="bg-[#294D73] hover:bg-[#1f3a5f]">
          <Plus size={16} />
        </Button>
      </div>

      {/* This Week Section */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar size={20} />
            <span>{t('upcoming_week')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {thisWeekPayments.length === 0 ? (
            <div className="text-white/70 text-center py-4">
              Ei maksuja tällä viikolla
            </div>
          ) : (
            thisWeekPayments.map(bill => (
              <div key={bill.id} className="flex justify-between items-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <div>
                  <div className="font-medium text-white">{bill.name}</div>
                  <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
                </div>
                <div className="font-bold text-yellow-300">€{bill.amount}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* All Upcoming Payments */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">Kaikki tulevat maksut</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allUpcomingPayments.length === 0 ? (
            <div className="text-white/70 text-center py-4">
              Ei tulevia maksuja
            </div>
          ) : (
            allUpcomingPayments.map(bill => (
              <div key={bill.id} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-white">{bill.name}</div>
                    <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="font-bold text-white">€{bill.amount}</div>
                    <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                      {bill.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="mt-6 bg-[#294D73] border-none">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-white">
            <span className="text-lg">Yhteensä tulossa:</span>
            <span className="text-xl font-bold text-orange-300">
              €{allUpcomingPayments.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingPayments;
