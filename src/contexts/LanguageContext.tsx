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

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
