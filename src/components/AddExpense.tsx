
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Receipt, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { addTransaction, addLoan, addMonthlyBill } from '@/services/storageService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AddExpense = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [expenseData, setExpenseData] = useState({
    name: '',
    amount: '',
    type: '',
    dueDate: '',
    interestRate: '',
    totalAmount: '',
    paymentTerm: ''
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState('quick');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'quick' || activeTab === 'income') {
      const amount = parseFloat(expenseData.amount);
      if (isNaN(amount)) return;
      
      const transaction = {
        name: expenseData.name,
        amount: activeTab === 'income' ? amount : -amount,
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        type: activeTab === 'income' ? 'income' : 'expense',
        category: expenseData.type || 'other'
      };
      
      addTransaction(transaction);
      
      // If it's a subscription, also add to monthly bills
      if (expenseData.type === 'subscriptions') {
        addMonthlyBill({
          name: expenseData.name,
          amount: amount,
          dueDate: expenseData.dueDate || '1.',
          type: 'tilaus',
          paid: false
        });
      }
      
      toast({
        title: activeTab === 'income' ? t('income_added') : t('expense_added'),
        description: activeTab === 'income' ? t('income_added_desc') : t('expense_added_desc'),
      });
    } else if (activeTab === 'loan') {
      const totalAmount = parseFloat(expenseData.totalAmount);
      const monthlyAmount = parseFloat(expenseData.amount);
      const rate = parseFloat(expenseData.interestRate) || 0;
      
      if (isNaN(totalAmount) || isNaN(monthlyAmount)) return;
      
      const loan = {
        name: expenseData.name,
        totalAmount: totalAmount,
        currentAmount: totalAmount,
        monthly: monthlyAmount,
        rate: rate,
        remaining: expenseData.paymentTerm,
        dueDate: expenseData.dueDate,
        lastPayment: format(new Date(), 'yyyy-MM-dd')
      };
      
      addLoan(loan);
      
      toast({
        title: t('loan_added'),
        description: t('loan_added_desc'),
      });
    }
    
    navigate('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setExpenseData(prev => ({ ...prev, [field]: value }));
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you would implement OCR processing
      toast({
        title: t('receipt_scanner'),
        description: "OCR-toiminto tulossa pian / OCR feature coming soon",
      });
    }
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('add_expense')}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-[#294D73]">
          <TabsTrigger value="quick" className="text-white data-[state=active]:bg-white data-[state=active]:text-[#294D73]">
            {t('quick_add')}
          </TabsTrigger>
          <TabsTrigger value="income" className="text-white data-[state=active]:bg-white data-[state=active]:text-[#294D73]">
            {t('add_income')}
          </TabsTrigger>
          <TabsTrigger value="loan" className="text-white data-[state=active]:bg-white data-[state=active]:text-[#294D73]">
            {t('loan_credit')}
          </TabsTrigger>
          <TabsTrigger value="receipt" className="text-white data-[state=active]:bg-white data-[state=active]:text-[#294D73]">
            {t('receipt')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <Card className="bg-[#294D73] border-none">
            <CardHeader>
              <CardTitle className="text-white">{t('quick_expense')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">{t('expense_name')}</Label>
                  <Input
                    id="name"
                    value={expenseData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="esim. Ruokakauppa, Bensiini"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="text-white">{t('amount')}</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={expenseData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="text-white">Päivämäärä</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                          !selectedDate && "text-white/50"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd.MM.yyyy") : <span>{t('select_date')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="type" className="text-white">{t('category')}</Label>
                  <Select value={expenseData.type} onValueChange={(value) => handleInputChange('type', value)} required>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder={t('select_category')} />
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

                {expenseData.type === 'subscriptions' && (
                  <div>
                    <Label htmlFor="dueDate" className="text-white">{t('due_date')}</Label>
                    <Input
                      id="dueDate"
                      value={expenseData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      placeholder="1."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full bg-white text-[#294D73] hover:bg-white/90">
                  {t('add_expense')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card className="bg-[#294D73] border-none">
            <CardHeader>
              <CardTitle className="text-white">{t('add_income')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="incomeName" className="text-white">{t('income_name')}</Label>
                  <Input
                    id="incomeName"
                    value={expenseData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="esim. Palkka, Bonus"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <Label htmlFor="incomeAmount" className="text-white">{t('amount')}</Label>
                  <Input
                    id="incomeAmount"
                    type="number"
                    step="0.01"
                    value={expenseData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <Label htmlFor="incomeDate" className="text-white">Päivämäärä</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                          !selectedDate && "text-white/50"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd.MM.yyyy") : <span>{t('select_date')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="submit" className="w-full bg-white text-[#294D73] hover:bg-white/90">
                  {t('add_income')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loan" className="space-y-4">
          <Card className="bg-[#294D73] border-none">
            <CardHeader>
              <CardTitle className="text-white">{t('add_loan_credit')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="loanName" className="text-white">{t('loan_credit_name')}</Label>
                  <Input
                    id="loanName"
                    value={expenseData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="esim. Autolaina, Luottokortti"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalAmount" className="text-white">{t('total_amount')}</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      value={expenseData.totalAmount}
                      onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                      placeholder="25000.00"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyAmount" className="text-white">{t('monthly_payment')}</Label>
                    <Input
                      id="monthlyAmount"
                      type="number"
                      step="0.01"
                      value={expenseData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="425.00"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interestRate" className="text-white">{t('interest_rate')}</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={expenseData.interestRate}
                      onChange={(e) => handleInputChange('interestRate', e.target.value)}
                      placeholder="3.5"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="text-white">{t('due_date')}</Label>
                    <Input
                      id="dueDate"
                      value={expenseData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      placeholder="15."
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentTerm" className="text-white">{t('payment_term')}</Label>
                  <Input
                    id="paymentTerm"
                    value={expenseData.paymentTerm}
                    onChange={(e) => handleInputChange('paymentTerm', e.target.value)}
                    placeholder="24 kuukautta"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <Button type="submit" className="w-full bg-white text-[#294D73] hover:bg-white/90">
                  {t('add_loan_credit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt" className="space-y-4">
          <Card className="bg-[#294D73] border-none">
            <CardHeader>
              <CardTitle className="text-white">{t('receipt_scanner')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                <Camera size={48} className="mx-auto mb-4 text-white/60" />
                <p className="text-white/70 mb-4">{t('take_photo_receipt')}</p>
                <Button onClick={handleCameraCapture} className="mb-2 bg-white text-[#294D73] hover:bg-white/90">
                  <Camera size={16} className="mr-2" />
                  {t('take_photo')}
                </Button>
                <p className="text-sm text-white/50">tai</p>
                <Button onClick={handleFileUpload} variant="outline" className="mt-2 border-white/30 text-white hover:bg-white/10">
                  <Receipt size={16} className="mr-2" />
                  {t('upload_receipt')}
                </Button>
              </div>
              
              <div className="text-sm text-white/70">
                <p>📱 {t('ocr_extract')}</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{t('item_names_prices')}</li>
                  <li>{t('total_tax')}</li>
                  <li>{t('store_date')}</li>
                </ul>
              </div>
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddExpense;
