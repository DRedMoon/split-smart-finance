// Utility functions for month-specific payment tracking

export const getCurrentMonthYear = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthYear = (year: number, month: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

export const isPaymentPaidForMonth = (bill: any, year: number, month: number): boolean => {
  if (!bill) return false;
  
  const monthYear = getMonthYear(year, month);
  
  // Check new payment history format
  if (bill.paymentHistory && bill.paymentHistory[monthYear]) {
    return bill.paymentHistory[monthYear].paid;
  }
  
  // Fallback to legacy format for current month only
  const currentMonthYear = getCurrentMonthYear();
  if (monthYear === currentMonthYear) {
    return bill.paid || false;
  }
  
  return false;
};

export const setPaymentStatusForMonth = (bill: any, year: number, month: number, paid: boolean): void => {
  if (!bill) return;
  
  const monthYear = getMonthYear(year, month);
  
  // Initialize paymentHistory if it doesn't exist
  if (!bill.paymentHistory) {
    bill.paymentHistory = {};
  }
  
  // Set the payment status for this specific month
  bill.paymentHistory[monthYear] = {
    paid: paid,
    paidDate: paid ? new Date().toISOString().split('T')[0] : undefined
  };
  
  // Update legacy field for current month
  const currentMonthYear = getCurrentMonthYear();
  if (monthYear === currentMonthYear) {
    bill.paid = paid;
  }
};

export const migratePaymentDataToMonthSpecific = (data: any): any => {
  if (!data || !data.monthlyBills) return data;
  
  const currentMonthYear = getCurrentMonthYear();
  
  // Migrate existing paid status to payment history
  data.monthlyBills.forEach((bill: any) => {
    if (bill.paid && !bill.paymentHistory) {
      bill.paymentHistory = {
        [currentMonthYear]: {
          paid: true,
          paidDate: new Date().toISOString().split('T')[0]
        }
      };
    }
  });
  
  return data;
};