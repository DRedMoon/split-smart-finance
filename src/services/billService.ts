
import { FinancialData } from './types';
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';

export const addMonthlyBill = (bill: Omit<FinancialData['monthlyBills'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newBill = {
    ...bill,
    id: Date.now() + Math.random(),
    paid: false // Always start as unpaid
  };
  data.monthlyBills.push(newBill);
  saveFinancialData(data);
};

// Get this week's upcoming payments
export const getThisWeekUpcomingPayments = () => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return data.monthlyBills.filter(bill => {
    if (bill.paid) return false;
    
    // Parse due date (assuming format like "15th", "1st", etc.)
    const dayMatch = bill.dueDate.match(/\d+/);
    if (!dayMatch) return false;
    
    const dueDay = parseInt(dayMatch[0]);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create due date for current month
    const dueDate = new Date(currentYear, currentMonth, dueDay);
    
    // If due date has passed this month, check next month
    if (dueDate < today) {
      dueDate.setMonth(currentMonth + 1);
    }
    
    return dueDate >= today && dueDate <= weekFromNow;
  });
};

// Enhanced function to reset monthly bills for new month
export const resetMonthlyBills = (): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  
  // Reset all monthly bills to unpaid for new month
  data.monthlyBills.forEach(bill => {
    if (bill.type !== 'laina' && 
        bill.type !== 'luottokortti' && 
        bill.type !== 'loan_payment' && 
        bill.type !== 'credit_payment') {
      bill.paid = false;
    }
  });
  
  saveFinancialData(data);
};

// Mark monthly bill as paid
export const markBillAsPaid = (billId: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const billIndex = data.monthlyBills.findIndex(bill => bill.id === billId);
  
  if (billIndex !== -1) {
    data.monthlyBills[billIndex].paid = true;
    saveFinancialData(data);
  }
};

// Mark monthly bill as unpaid
export const markBillAsUnpaid = (billId: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const billIndex = data.monthlyBills.findIndex(bill => bill.id === billId);
  
  if (billIndex !== -1) {
    data.monthlyBills[billIndex].paid = false;
    saveFinancialData(data);
  }
};

// Add new function to handle bill payments with balance and loan reductions
export const payBill = (billId: number, amount: number, billType: string): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  
  // Reduce balance
  data.balance -= amount;
  
  // If it's a loan or credit payment, also reduce the loan amount
  if (billType === 'loan_payment' || billType === 'credit_payment' || billType === 'laina' || billType === 'luottokortti') {
    const bill = data.monthlyBills.find(b => b.id === billId);
    if (bill) {
      const loanIndex = data.loans.findIndex(loan => 
        loan.name.toLowerCase().includes(bill.name.toLowerCase().split(' - ')[0].toLowerCase()) ||
        loan.name.toLowerCase() === bill.name.toLowerCase()
      );
      
      if (loanIndex !== -1) {
        data.loans[loanIndex].currentAmount = Math.max(0, data.loans[loanIndex].currentAmount - amount);
        data.loans[loanIndex].lastPayment = new Date().toISOString().split('T')[0];
      }
    }
  }
  
  // Add transaction record
  const bill = data.monthlyBills.find(b => b.id === billId);
  if (bill) {
    const transaction = {
      id: Date.now() + Math.random(),
      name: `${bill.name} - Maksu`,
      amount: -amount,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: billType === 'loan_payment' || billType === 'laina' ? 'loan_repayment' : 
                billType === 'credit_payment' || billType === 'luottokortti' ? 'credit_repayment' : 
                'bill'
    };
    
    data.transactions.unshift(transaction);
  }
  
  saveFinancialData(data);
};
