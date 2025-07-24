
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fi: {
    // Dashboard
    balance: 'Saldo',
    monthly_payments: 'Kuukausimaksut',
    loans_credits: 'Lainat ja luotot',
    upcoming: 'Tulevat',
    transactions: 'Tapahtumat',
    recent_transactions: 'Viimeisimmät tapahtumat',
    no_transactions: 'Ei tapahtumia',
    all_transactions: 'Kaikki tapahtumat',
    upcoming_week: 'Tuleva viikko',
    payments: 'Maksut',
    
    // Payment status
    paid: 'Maksettu',
    unpaid: 'Maksamaton',
    paid_off: 'Maksettu pois',
    remaining: 'Jäljellä',
    total_debt: 'Velka yhteensä',
    original_amount: 'Alkuperäinen summa',
    current_amount: 'Nykyinen summa',
    
    // Categories
    food: 'Ruoka',
    food_dining: 'Ruoka ja ravintolat',
    transport: 'Liikenne',
    transportation: 'Liikenne',
    utilities: 'Laskut',
    shopping: 'Ostokset',
    loan: 'Laina',
    salary: 'Palkka',
    insurance: 'Vakuutus',
    subscriptions: 'Tilaukset',
    entertainment: 'Viihde',
    income: 'Tulo',
    other: 'Muu',
    
    // General
    total_bills: 'Laskut yhteensä',
    total_monthly: 'Yhteensä kuukausittain',
    show_less: 'Näytä vähemmän',
    more: 'lisää',
    view_all_payments: 'Näytä kaikki maksut',
    manage_loans_credits: 'Hallitse lainoja ja luottoja',
    no_monthly_payments: 'Ei kuukausimaksuja',
    due: 'Eräpäivä',
    
    // Notifications
    payment_processed: 'Maksu käsitelty',
    marked_as_paid: 'merkitty maksetuksi',
    payment_reversed: 'Maksu peruutettu',
    marked_as_unpaid: 'merkitty maksamattomaksi',
    insufficient_funds: 'Riittämätön saldo',
    required: 'vaaditaan',
    
    // Quick Payment Entry - NEW
    quick_payment_entry: 'Pikamaksun kirjaus',
    loan_credit_payment: 'Laina- ja luottomaksu',
    select_loan_credit: 'Valitse laina tai luotto',
    payment_date: 'Maksupäivä',
    payment_breakdown: 'Maksun erittely',
    principal_euro: 'Pääoma (€)',
    interest_euro: 'Korko (€)',
    total_euro: 'Yhteensä (€)',
    selected_loan: 'Valittu laina',
    current_balance: 'Nykyinen saldo',
    record_payment: 'Kirjaa maksu',
    select_loan_enter_amounts: 'Valitse laina ja syötä maksusummat',
    loan_not_found: 'Lainaa ei löydy',
    payment_recording_failed: 'Maksun kirjaaminen epäonnistui',
    remaining_interest: 'Jäljellä olevat korot',
    
    // Additional Payment Terms - NEW
    no_payments_this_week: 'Ei maksuja tällä viikolla',
    more_this_week: 'lisää tällä viikolla',
    no_bills: 'Ei laskuja',
    total: 'Yhteensä',
    
    // Loan and Credit terms - NEW
    loans_and_credits: 'Lainat ja luotot',
    credit: 'Luotto',
    monthly: 'kuukausittain',
    used: 'käytetty',
    loans_summary: 'Lainojen yhteenveto',
    no_loans_credits: 'Ei lainoja tai luottoja',
    calculated_values: 'Lasketut arvot',
    monthly_payment: 'Kuukausimaksu',
    total_payback: 'Kokonaismaksu',
    
    // Time-related terms - NEW
    today: 'Tänään',
    days_short: 'pv',
    days_until: '{days} päivää',
    loading: 'Ladataan...',
    
    // Settings
    settings: 'Asetukset',
    account: 'Tili',
    profile: 'Profiili',
    notifications: 'Ilmoitukset',
    privacy_security: 'Yksityisyys ja turvallisuus',
    appearance_and_features: 'Ulkoasu ja ominaisuudet',
    appearance: 'Ulkoasu',
    backup: 'Varmuuskopiot',
    data: 'Tiedot',
    data_management: 'Tietojen hallinta',
    export_data: 'Vie tiedot',
    import_data: 'Tuo tiedot',
    clear_all_data: 'Tyhjennä kaikki tiedot',
    confirm_clear_all_data: 'Haluatko varmasti tyhjentää kaikki tiedot?',
    data_cleared: 'Tiedot tyhjennetty',
    backup_created: 'Varmuuskopio luotu',
    data_imported: 'Tiedot tuotu',
    error: 'Virhe',
    user: 'Käyttäjä',
    debts: 'Velat',
    financial_management_app: 'Taloudenhallintasovellus',
    version: 'Versio',
    change_password: 'Vaihda salasana',
    add_password: 'Lisää salasana',
    
    // Forms and Input
    fill_required_fields: 'Täytä kaikki pakolliset kentät',
    due_date_required: 'Eräpäivä on pakollinen',
    expense_added: 'Kulu lisätty',
    income_added: 'Tulo lisätty',
    quick_add: 'Pikalisäys',
    expense_name: 'Kulun nimi',
    income_name: 'Tulon nimi',
    sum: 'Summa',
    select_category: 'Valitse kategoria',
    recurring_payment: 'Toistuva maksu',
    add_expense: 'Lisää kulu',
    add_income: 'Lisää tulo',
    create_edit_category: 'Luo/muokkaa kategoria',
    select_day: 'Valitse päivä',
    select_loan: 'Valitse laina',
    principal_amount: 'Pääoma',
    interest_amount: 'Korko',
    principal: 'Pääoma',
    interest: 'Korko',
    
    // Loans and Credits - Extended
    add_credit_card: 'Lisää luottokortti',
    credit_card_added: 'Luottokortti lisätty',
    credit_card_name: 'Luottokortin nimi',
    credit_limit: 'Luottoraja',
    used_credit: 'Käytetty luotto',
    yearly_interest: 'Vuosikorko',
    minimum_payment_percent: 'Vähimmäismaksu-%',
    management_fee: 'Hoitokulu',
    loan_added: 'Laina lisätty',
    add_loan: 'Lisää laina',
    minimum_monthly_payment: 'Vähimmäiskuukausimaksu',
    estimated_total_with_interest: 'Arvioitu kokonaissumma korkojen kanssa',
    
    // Analytics
    back_to_home: 'Takaisin kotiin',
    select_time_period: 'Valitse aikajakso',
    months: 'kuukautta',
    
    // Transaction Filters
    search_transactions: 'Hae tapahtumia',
    filter_by_type: 'Suodata tyypin mukaan',
    expenses: 'Kulut',
    date_range: 'Aikajakso',
    last_week: 'Viime viikko',
    last_month: 'Viime kuukausi',
    last_quarter: 'Viime neljännes',
    last_year: 'Viime vuosi',
    from_date: 'Alkaen',
    to_date: 'Päättyen',
    
    // General Actions
    edit: 'Muokkaa',
    delete: 'Poista',
    save: 'Tallenna',
    cancel: 'Peruuta',
    confirm: 'Vahvista',
    close: 'Sulje',
    
    // Security
    enable_biometric: 'Ota biometrinen tunnistus käyttöön',
    biometric_authentication: 'Biometrinen tunnistus',
    pin_code: 'PIN-koodi',
    two_factor: 'Kaksivaiheinen tunnistus',
    security_actions: 'Turvallisuustoimet',
    
    // Navigation
    home: 'Koti',
    add: 'Lisää',
    analytics: 'Analytiikka',
    main_navigation: 'Päänavigaatio',
  },
  en: {
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
    
    // General
    total_bills: 'Total Bills',
    total_monthly: 'Total Monthly',
    show_less: 'Show Less',
    more: 'more',
    view_all_payments: 'View All Payments',
    manage_loans_credits: 'Manage Loans & Credits',
    no_monthly_payments: 'No monthly payments',
    due: 'Due',
    
    // Notifications
    payment_processed: 'Payment Processed',
    marked_as_paid: 'marked as paid',
    payment_reversed: 'Payment Reversed',
    marked_as_unpaid: 'marked as unpaid',
    insufficient_funds: 'Insufficient Funds',
    required: 'required',
    
    // Quick Payment Entry - NEW
    quick_payment_entry: 'Quick Payment Entry',
    loan_credit_payment: 'Loan & Credit Payment',
    select_loan_credit: 'Select Loan or Credit',
    payment_date: 'Payment Date',
    payment_breakdown: 'Payment Breakdown',
    principal_euro: 'Principal (€)',
    interest_euro: 'Interest (€)',
    total_euro: 'Total (€)',
    selected_loan: 'Selected Loan',
    current_balance: 'Current Balance',
    record_payment: 'Record Payment',
    select_loan_enter_amounts: 'Select loan and enter payment amounts',
    loan_not_found: 'Loan not found',
    payment_recording_failed: 'Payment recording failed',
    remaining_interest: 'Remaining Interest',
    
    // Additional Payment Terms - NEW
    no_payments_this_week: 'No payments this week',
    more_this_week: 'more this week',
    no_bills: 'No bills',
    total: 'Total',
    
    // Loan and Credit terms - NEW
    loans_and_credits: 'Loans and Credits',
    credit: 'Credit',
    monthly: 'monthly',
    used: 'used',
    loans_summary: 'Loans Summary',
    no_loans_credits: 'No loans or credits',
    calculated_values: 'Calculated Values',
    monthly_payment: 'Monthly Payment',
    total_payback: 'Total Payback',
    
    // Time-related terms - NEW
    today: 'Today',
    days_short: 'd',
    days_until: '{days} days',
    loading: 'Loading...',
    
    // Settings
    settings: 'Settings',
    account: 'Account',
    profile: 'Profile',
    notifications: 'Notifications',
    privacy_security: 'Privacy & Security',
    appearance_and_features: 'Appearance & Features',
    appearance: 'Appearance',
    backup: 'Backup',
    data: 'Data',
    data_management: 'Data Management',
    export_data: 'Export Data',
    import_data: 'Import Data',
    clear_all_data: 'Clear All Data',
    confirm_clear_all_data: 'Are you sure you want to clear all data?',
    data_cleared: 'Data Cleared',
    backup_created: 'Backup Created',
    data_imported: 'Data Imported',
    error: 'Error',
    user: 'User',
    debts: 'Debts',
    financial_management_app: 'Financial Management App',
    version: 'Version',
    change_password: 'Change Password',
    add_password: 'Add Password',
    
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
    select_day: 'Select Day',
    select_loan: 'Select Loan',
    principal_amount: 'Principal Amount',
    interest_amount: 'Interest Amount',
    principal: 'Principal',
    interest: 'Interest',
    
    // Loans and Credits - Extended
    add_credit_card: 'Add Credit Card',
    credit_card_added: 'Credit Card Added',
    credit_card_name: 'Credit Card Name',
    credit_limit: 'Credit Limit',
    used_credit: 'Used Credit',
    yearly_interest: 'Annual Interest',
    minimum_payment_percent: 'Minimum Payment %',
    management_fee: 'Management Fee',
    loan_added: 'Loan Added',
    add_loan: 'Add Loan',
    minimum_monthly_payment: 'Minimum Monthly Payment',
    estimated_total_with_interest: 'Estimated Total with Interest',
    
    // Analytics
    back_to_home: 'Back to Home',
    select_time_period: 'Select Time Period',
    months: 'months',
    
    // Transaction Filters
    search_transactions: 'Search Transactions',
    filter_by_type: 'Filter by Type',
    expenses: 'Expenses',
    date_range: 'Date Range',
    last_week: 'Last Week',
    last_month: 'Last Month',
    last_quarter: 'Last Quarter',
    last_year: 'Last Year',
    from_date: 'From Date',
    to_date: 'To Date',
    
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
  }
} as const;

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fi');
  const [isReady, setIsReady] = useState(false);

  // Use useEffect to ensure provider is ready before rendering children
  React.useEffect(() => {
    setIsReady(true);
  }, []);

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    return translation || key;
  };

  // Show loading state until context is ready
  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#192E45] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // More informative error with fallback
    console.error('useLanguage must be used within a LanguageProvider. Check your component tree.');
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
