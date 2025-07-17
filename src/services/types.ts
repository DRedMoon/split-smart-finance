
export interface LoanPaymentBreakdown {
  principal: number;  // lyhennys
  interest: number;   // korko
  managementFee: number; // tilinhoitopalkkio
}

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
    totalInterest?: number;
    type?: 'loan' | 'credit';
    categoryId?: number;
  }>;
  monthlyBills: Array<{
    id: number;
    name: string;
    amount: number;
    dueDate: string;
    type: string;
    paid: boolean; // Legacy field for backward compatibility
    isPaid?: boolean;
    category?: string;
    paymentHistory?: {
      [monthYear: string]: {
        paid: boolean;
        paidDate?: string;
      };
    };
  }>;
  transactions: Array<{
    id: number;
    name: string;
    amount: number;
    date: string;
    type: string;
    category: string;
    description?: string;
    paymentMethod?: string;
    loanId?: number;
    principalAmount?: number;
    interestAmount?: number;
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
    hideBalances?: boolean;
    screenshotProtection?: boolean;
    automaticBackup?: boolean;
    cloudBackup?: boolean;
    cloudProvider?: 'google_drive' | 'icloud' | 'dropbox' | 'onedrive';
    compressionEnabled?: boolean;
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
