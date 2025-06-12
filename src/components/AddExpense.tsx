
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const AddExpense = () => {
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState({
    name: '',
    amount: '',
    type: '',
    dueDate: '',
    interestRate: '',
    totalAmount: '',
    paymentTerm: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding expense:', expenseData);
    toast({
      title: "Expense Added",
      description: "Your expense has been successfully added.",
    });
    navigate('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setExpenseData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Add Expense</h1>
      </div>

      <Tabs defaultValue="quick" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick">Quick Add</TabsTrigger>
          <TabsTrigger value="loan">Loan/Credit</TabsTrigger>
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Expense Name</Label>
                  <Input
                    id="name"
                    value={expenseData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Groceries, Gas"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={expenseData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Category</Label>
                  <Select value={expenseData.type} onValueChange={(value) => handleInputChange('type', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="transport">Transportation</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Add Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Loan or Credit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="loanName">Loan/Credit Name</Label>
                  <Input
                    id="loanName"
                    value={expenseData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Car Loan, Credit Card"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalAmount">Total Amount</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      value={expenseData.totalAmount}
                      onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                      placeholder="25000.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyAmount">Monthly Payment</Label>
                    <Input
                      id="monthlyAmount"
                      type="number"
                      step="0.01"
                      value={expenseData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="425.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={expenseData.interestRate}
                      onChange={(e) => handleInputChange('interestRate', e.target.value)}
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      value={expenseData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      placeholder="15th"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentTerm">Payment Term</Label>
                  <Input
                    id="paymentTerm"
                    value={expenseData.paymentTerm}
                    onChange={(e) => handleInputChange('paymentTerm', e.target.value)}
                    placeholder="24 months"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Loan/Credit
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Take a photo of your receipt</p>
                <Button className="mb-2">
                  <Camera size={16} className="mr-2" />
                  Take Photo
                </Button>
                <p className="text-sm text-gray-500">or</p>
                <Button variant="outline" className="mt-2">
                  <Receipt size={16} className="mr-2" />
                  Upload Receipt
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>📱 OCR will extract:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Item names and prices</li>
                  <li>Total amount and tax</li>
                  <li>Store name and date</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddExpense;
