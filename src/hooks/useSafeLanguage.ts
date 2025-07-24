import { useLanguage } from '@/contexts/LanguageContext';

// Safe language hook with fallback translations
export const useSafeLanguage = () => {
  try {
    return useLanguage();
  } catch (error) {
    console.error('LanguageContext error, using fallback:', error);
    
    // Comprehensive fallback translations
    const fallbackTranslations: Record<string, string> = {
      // Dashboard
      balance: 'Balance',
      monthly_payments: 'Monthly Payments',
      loans_credits: 'Loans & Credits',
      upcoming: 'Upcoming',
      transactions: 'Transactions',
      recent_transactions: 'Recent Transactions',
      no_transactions: 'No transactions',
      all_transactions: 'All Transactions',
      upcoming_week: 'Upcoming Week',
      payments: 'Payments',
      
      // Payment status
      paid: 'Paid',
      unpaid: 'Unpaid',
      paid_off: 'Paid Off',
      remaining: 'Remaining',
      total_debt: 'Total Debt',
      original_amount: 'Original Amount',
      current_amount: 'Current Amount',
      
      // Categories
      food: 'Food',
      food_dining: 'Food & Dining',
      transport: 'Transport',
      transportation: 'Transportation',
      utilities: 'Utilities',
      shopping: 'Shopping',
      loan: 'Loan',
      salary: 'Salary',
      insurance: 'Insurance',
      subscriptions: 'Subscriptions',
      entertainment: 'Entertainment',
      income: 'Income',
      other: 'Other',
      
      // Forms and Input
      fill_required_fields: 'Fill all required fields',
      due_date_required: 'Due date is required',
      expense_added: 'Expense Added',
      income_added: 'Income Added',
      quick_add: 'Quick Add',
      expense_name: 'Expense Name',
      income_name: 'Income Name',
      sum: 'Amount',
      select_category: 'Select Category',
      recurring_payment: 'Recurring Payment',
      add_expense: 'Add Expense',
      add_income: 'Add Income',
      create_edit_category: 'Create/Edit Category',
      
      // Loans and Credits
      add_credit_card: 'Add Credit Card',
      credit_card_added: 'Credit Card Added',
      loan_added: 'Loan Added',
      add_loan: 'Add Loan',
      
      // Analytics
      back_to_home: 'Back to Home',
      select_time_period: 'Select Time Period',
      months: 'months',
      
      // Transaction Filters
      search_transactions: 'Search Transactions',
      filter_by_type: 'Filter by Type',
      expenses: 'Expenses',
      
      // General
      total_bills: 'Total Bills',
      total_monthly: 'Total Monthly',
      show_less: 'Show Less',
      more: 'more',
      view_all_payments: 'View All Payments',
      manage_loans_credits: 'Manage Loans & Credits',
      no_monthly_payments: 'No monthly payments',
      due: 'Due',
      
      // General Actions
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      
      // Security
      enable_biometric: 'Enable Biometric Authentication',
      biometric_authentication: 'Biometric Authentication',
      pin_code: 'PIN Code',
      two_factor: 'Two-Factor Authentication',
      security_actions: 'Security Actions',
      
      // Navigation
      home: 'Home',
      add: 'Add',
      analytics: 'Analytics',
      main_navigation: 'Main Navigation',
      settings: 'Settings',
      
      // Time-related
      today: 'Today',
      days_short: 'd',
      days_until: '{days} days',
      loading: 'Loading...',
      
      // Common actions
      total: 'Total',
      error: 'Error',
      user: 'User',
      debts: 'Debts',
      version: 'Version'
    };
    
    return {
      language: 'en' as const,
      setLanguage: () => console.warn('Language switching unavailable in fallback mode'),
      t: (key: string) => fallbackTranslations[key] || key
    };
  }
};