
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ExpenseDetails = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  // Mock data - would come from state management
  const data = {
    loans: [
      { 
        id: 1, 
        name: "Car Loan", 
        totalAmount: 25000,
        currentAmount: 8500, 
        monthly: 425, 
        rate: 3.5, 
        remaining: "24 months",
        dueDate: "15th",
        lastPayment: "2024-01-15"
      },
      { 
        id: 2, 
        name: "Student Loan", 
        totalAmount: 15000,
        currentAmount: 4000, 
        monthly: 180, 
        rate: 4.2, 
        remaining: "18 months",
        dueDate: "1st",
        lastPayment: "2024-01-01"
      }
    ],
    monthly: [
      { id: 1, name: "Rent", amount: 800, dueDate: "1st", type: "housing", paid: true },
      { id: 2, name: "Car Payment", amount: 425, dueDate: "15th", type: "loan", paid: false },
      { id: 3, name: "Credit Card", amount: 250, dueDate: "20th", type: "credit", paid: false },
      { id: 4, name: "Phone", amount: 65, dueDate: "28th", type: "utility", paid: true },
      { id: 5, name: "Internet", amount: 50, dueDate: "10th", type: "utility", paid: true },
      { id: 6, name: "Insurance", amount: 120, dueDate: "5th", type: "insurance", paid: true }
    ]
  };

  const getTitle = () => {
    switch (type) {
      case 'loans': return 'Loans & Credits';
      case 'monthly': return 'Monthly Payments';
      default: return 'Expenses';
    }
  };

  const renderLoans = () => (
    <div className="space-y-4">
      {data.loans.map(loan => (
        <Card key={loan.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{loan.name}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="text-xl font-bold text-red-600">
                  ${loan.currentAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Monthly Payment</div>
                <div className="text-xl font-bold">
                  ${loan.monthly.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Interest Rate: </span>
                <span className="font-medium">{loan.rate}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Due Date: </span>
                <span className="font-medium">{loan.dueDate}</span>
              </div>
            </div>
            
            <div className="text-sm">
              <span className="text-muted-foreground">Time Remaining: </span>
              <span className="font-medium">{loan.remaining}</span>
            </div>
            
            <div className="text-sm">
              <span className="text-muted-foreground">Last Payment: </span>
              <span className="font-medium">{loan.lastPayment}</span>
            </div>
            
            <div className="pt-2">
              <Button className="w-full" variant="outline">
                Mark This Month as Paid
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMonthlyPayments = () => (
    <div className="space-y-3">
      {data.monthly.map(payment => (
        <Card key={payment.id} className={payment.paid ? 'bg-green-50 border-green-200' : ''}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{payment.name}</span>
                  <Badge variant={payment.paid ? 'default' : 'secondary'}>
                    {payment.paid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Due {payment.dueDate} • {payment.type}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">${payment.amount}</div>
                <div className="flex space-x-1 mt-1">
                  <Button variant="ghost" size="sm">
                    <Edit size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
        </div>
        <Button onClick={() => navigate('/add')} size="sm">
          <Plus size={16} className="mr-2" />
          Add
        </Button>
      </div>

      {/* Content */}
      {type === 'loans' && renderLoans()}
      {type === 'monthly' && renderMonthlyPayments()}
    </div>
  );
};

export default ExpenseDetails;
