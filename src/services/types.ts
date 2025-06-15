
export interface FinancialData {
  balance: number;
  loans: Array<{
    id: number;
    name: string;
    totalAmount: number;
    currentAmount: number;
    monthly: number;
    rate: number;
    euriborRate?: number;
    personalMargin?: number;
    managementFee?: number;
    minimumPercent?: number;
    remaining: string;
    dueDate: string;
    lastPayment: string;
    totalPayback: number;
    yearlyInterestRate: number;
  }>;
  monthlyBills: Array<{
    id: number;
    name: string;
    amount: number;
    dueDate: string;
    type: string;
    paid: boolean;
    isPaid?: boolean;
    category?: string;
  }>;
  transactions: Array<{
    id: number;
    name: string;
    amount: number;
    date: string;
    type: string;
    category: string;
  }>;
  categories?: Array<{
    id: number;
    name: string;
    description: string;
    isMaintenanceCharge: boolean;
    isHousingCompanyExpenditure: boolean;
    isMonthlyPayment: boolean;
    requiresDueDate?: boolean;
    color: string;
    createdAt: string;
  }>;
  profile: {
    name: string;
    email: string;
    profilePicture?: string;
  };
  settings: {
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupPassword?: string;
    errorReporting: boolean;
    analytics: boolean;
    theme: 'light' | 'dark';
    fontSize: 'small' | 'medium' | 'large';
    highContrast?: boolean;
    notifications?: {
      upcomingPayments: boolean;
      backupReminders: boolean;
      lowBalance: boolean;
      monthlyReport: boolean;
      paymentDays: number;
      backupDays: number;
      balanceThreshold: number;
    };
  };
}
