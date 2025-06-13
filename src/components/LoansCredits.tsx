
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, CreditCard, Banknote, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData } from '@/services/storageService';

const LoansCredits = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const data = loadFinancialData();
  const loans = data?.loans || [];

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('loans_credits')}</h1>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Button
          onClick={() => navigate('/add-loan')}
          className="h-16 bg-[#294D73] text-white hover:bg-[#1f3a5f] flex items-center justify-center space-x-3"
        >
          <Banknote size={20} />
          <span>{t('add_loan')}</span>
        </Button>
        
        <Button
          onClick={() => navigate('/add-credit')}
          className="h-16 bg-[#294D73] text-white hover:bg-[#1f3a5f] flex items-center justify-center space-x-3"
        >
          <CreditCard size={20} />
          <span>{t('add_credit_card')}</span>
        </Button>
        
        <Button
          onClick={() => navigate('/manage-loans-credits')}
          className="h-16 bg-[#294D73] text-white hover:bg-[#1f3a5f] flex items-center justify-center space-x-3"
        >
          <Settings size={20} />
          <span>{t('manage_loans_credits')}</span>
        </Button>
      </div>

      {/* Quick Overview */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('loans_credits_list')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loans.length === 0 ? (
            <div className="text-white/70 text-center py-8">
              {t('no_loans_credits')}
            </div>
          ) : (
            loans.slice(0, 3).map((loan) => (
              <div key={loan.id} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <div>
                  <h3 className="text-white font-semibold">{loan.name}</h3>
                  <p className="text-white/70 text-sm">
                    €{loan.currentAmount.toFixed(2)} / €{loan.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">€{loan.monthly.toFixed(2)}/kk</p>
                  <p className="text-white/70 text-sm">{loan.remaining}</p>
                </div>
              </div>
            ))
          )}
          {loans.length > 3 && (
            <Button
              variant="ghost"
              onClick={() => navigate('/manage-loans-credits')}
              className="w-full text-white hover:bg-white/10"
            >
              {t('view_all_payments')} ({loans.length})
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoansCredits;
