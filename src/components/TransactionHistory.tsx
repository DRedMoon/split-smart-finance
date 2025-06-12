
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter, Calendar, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock transaction data
  const transactions = [
    { id: 1, name: "Grocery Store", amount: -85.50, date: "2024-01-15",  type: "expense", category: "food" },
    { id: 2, name: "Car Loan Payment", amount: -425.00, date: "2024-01-15", type: "loan", category: "loan" },
    { id: 3, name: "Salary Deposit", amount: 3200.00, date: "2024-01-14", type: "income", category: "salary" },
    { id: 4, name: "Gas Station", amount: -45.20, date: "2024-01-13", type: "expense", category: "transport" },
    { id: 5, name: "Coffee Shop", amount: -12.75, date: "2024-01-13", type: "expense", category: "food" },
    { id: 6, name: "Electric Bill", amount: -120.00, date: "2024-01-12", type: "bill", category: "utilities" },
    { id: 7, name: "Online Purchase", amount: -67.99, date: "2024-01-11", type: "expense", category: "shopping" },
    { id: 8, name: "Restaurant", amount: -89.50, date: "2024-01-10", type: "expense", category: "food" }
  ];

  const upcomingPayments = [
    { id: 1, name: "Credit Card", amount: 250.00, dueDate: "2024-01-20", type: "credit" },
    { id: 2, name: "Phone Bill", amount: 65.00, dueDate: "2024-01-28", type: "utility" },
    { id: 3, name: "Insurance", amount: 120.00, dueDate: "2024-02-05", type: "insurance" }
  ];

  const filteredTransactions = transactions.filter(transaction => {
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
      insurance: '🛡️'
    };
    return emojis[category] || '📝';
  };

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Transactions</h1>
        </div>
        <Button onClick={() => navigate('/add')} size="sm">
          <Plus size={16} />
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="loan">Loans</SelectItem>
              <SelectItem value="bill">Bills</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar size={16} />
          </Button>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Upcoming Payments</h2>
        <div className="space-y-2">
          {upcomingPayments.map(payment => (
            <Card key={payment.id} className="border-orange-200 bg-orange-50">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{payment.name}</div>
                    <div className="text-sm text-gray-600">Due {payment.dueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-700">${payment.amount}</div>
                    <Badge variant="outline" className="text-xs">
                      {payment.type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
        <div className="space-y-2">
          {filteredTransactions.map(transaction => (
            <Card key={transaction.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getCategoryEmoji(transaction.category)}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.name}</div>
                      <div className="text-sm text-gray-600">
                        {transaction.date} • {transaction.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
