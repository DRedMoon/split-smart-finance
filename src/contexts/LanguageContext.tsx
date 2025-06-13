
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fi: {
    'financial_overview': 'Taloustilanteen yleiskatsaus',
    'manage_expenses': 'Hallitse kulujasi ja velkojasi',
    'balance': 'Saldo',
    'current_balance': 'Nykyinen Saldo',
    'this_month': 'Tässä Kuussa',
    'loans_credits': 'Lainat ja Luotot',
    'monthly_payments': 'Kuukausimaksut',
    'upcoming_week': 'Tuleva Viikko',
    'due': 'Eräpäivä',
    'home': 'Koti',
    'expenses': 'Kulut',
    'add': 'Lisää',
    'history': 'Historia',
    'settings': 'Asetukset',
    'car_loan': 'Autolaina',
    'student_loan': 'Opintolaina',
    'rent': 'Vuokra',
    'car_payment': 'Automaksu',
    'credit_card': 'Luottokortti',
    'phone': 'Puhelin',
    'view_all_payments': 'Näytä kaikki maksut',
    'transactions': 'Tapahtumat',
    'remaining': 'jäljellä',
    'notifications': 'Ilmoitukset',
    'backup_settings': 'Varmuuskopiointi',
    'export_data': 'Vie Tiedot',
    'profile': 'Profiili',
    'privacy_security': 'Yksityisyys ja Turvallisuus',
    'sign_out': 'Kirjaudu Ulos',
    'account': 'Tili',
    'data': 'Tiedot',
    'support': 'Tuki',
    'add_expense': 'Lisää Kulu',
    'quick_add': 'Pikalisäys',
    'loan_credit': 'Laina/Luotto',
    'receipt': 'Kuitti',
    'quick_expense': 'Pikakulu',
    'expense_name': 'Kulun Nimi',
    'amount': 'Summa',
    'category': 'Kategoria',
    'food_dining': 'Ruoka ja Ravintolat',
    'transportation': 'Kuljetut',
    'utilities': 'Sähkö/Vesi/Kaasu',
    'entertainment': 'Viihde',
    'shopping': 'Ostokset',
    'insurance': 'Vakuutus',
    'subscriptions': 'Tilaukset',
    'other': 'Muu',
    'add_loan_credit': 'Lisää Laina tai Luotto',
    'loan_credit_name': 'Lainan/Luoton Nimi',
    'total_amount': 'Kokonaissumma',
    'monthly_payment': 'Kuukausimaksu',
    'interest_rate': 'Korko (%)',
    'due_date': 'Eräpäivä',
    'payment_term': 'Maksuaika',
    'receipt_scanner': 'Kuitinlukija',
    'take_photo': 'Ota Kuva',
    'upload_receipt': 'Lataa Kuitti',
    'take_photo_receipt': 'Ota kuva kuitistasi',
    'ocr_extract': 'OCR poimii:',
    'item_names_prices': 'Tuotteiden nimet ja hinnat',
    'total_tax': 'Loppusumma ja verot',
    'store_date': 'Kaupan nimi ja päivämäärä',
    'select_category': 'Valitse kategoria',
    'expense_added': 'Kulu Lisätty',
    'expense_added_desc': 'Kulusi on lisätty onnistuneesti.',
    'loan_added': 'Laina Lisätty',
    'loan_added_desc': 'Lainasi on lisätty onnistuneesti.',
    'select_date': 'Valitse päivämäärä',
    'add_income': 'Lisää Tulo',
    'income_name': 'Tulon Nimi',
    'income_added': 'Tulo Lisätty',
    'income_added_desc': 'Tulosi on lisätty onnistuneesti.',
    'all_transactions': 'Kaikki Tapahtumat',
    'edit': 'Muokkaa',
    'delete': 'Poista',
    'mark_paid': 'Merkitse Maksetuksi',
    'paid': 'Maksettu',
    'pending': 'Odottaa'
  },
  en: {
    'financial_overview': 'Financial Overview',
    'manage_expenses': 'Manage your expenses and debts',
    'balance': 'Balance',
    'current_balance': 'Current Balance',
    'this_month': 'This Month',
    'loans_credits': 'Loans & Credits',
    'monthly_payments': 'Monthly Payments',
    'upcoming_week': 'Upcoming This Week',
    'due': 'Due',
    'home': 'Home',
    'expenses': 'Expenses',
    'add': 'Add',
    'history': 'History',
    'settings': 'Settings',
    'car_loan': 'Car Loan',
    'student_loan': 'Student Loan',
    'rent': 'Rent',
    'car_payment': 'Car Payment',
    'credit_card': 'Credit Card',
    'phone': 'Phone',
    'view_all_payments': 'View all payments',
    'transactions': 'Transactions',
    'remaining': 'left',
    'notifications': 'Notifications',
    'backup_settings': 'Backup Settings',
    'export_data': 'Export Data',
    'profile': 'Profile',
    'privacy_security': 'Privacy & Security',
    'sign_out': 'Sign Out',
    'account': 'Account',
    'data': 'Data',
    'support': 'Support',
    'add_expense': 'Add Expense',
    'quick_add': 'Quick Add',
    'loan_credit': 'Loan/Credit',
    'receipt': 'Receipt',
    'quick_expense': 'Quick Expense',
    'expense_name': 'Expense Name',
    'amount': 'Amount',
    'category': 'Category',
    'food_dining': 'Food & Dining',
    'transportation': 'Transportation',
    'utilities': 'Utilities',
    'entertainment': 'Entertainment',
    'shopping': 'Shopping',
    'insurance': 'Insurance',
    'subscriptions': 'Subscriptions',
    'other': 'Other',
    'add_loan_credit': 'Add Loan or Credit',
    'loan_credit_name': 'Loan/Credit Name',
    'total_amount': 'Total Amount',
    'monthly_payment': 'Monthly Payment',
    'interest_rate': 'Interest Rate (%)',
    'due_date': 'Due Date',
    'payment_term': 'Payment Term',
    'receipt_scanner': 'Receipt Scanner',
    'take_photo': 'Take Photo',
    'upload_receipt': 'Upload Receipt',
    'take_photo_receipt': 'Take a photo of your receipt',
    'ocr_extract': 'OCR will extract:',
    'item_names_prices': 'Item names and prices',
    'total_tax': 'Total amount and tax',
    'store_date': 'Store name and date',
    'select_category': 'Select category',
    'expense_added': 'Expense Added',
    'expense_added_desc': 'Your expense has been successfully added.',
    'loan_added': 'Loan Added',
    'loan_added_desc': 'Your loan has been successfully added.',
    'select_date': 'Select date',
    'add_income': 'Add Income',
    'income_name': 'Income Name',
    'income_added': 'Income Added',
    'income_added_desc': 'Your income has been successfully added.',
    'all_transactions': 'All Transactions',
    'edit': 'Edit',
    'delete': 'Delete',
    'mark_paid': 'Mark Paid',
    'paid': 'Paid',
    'pending': 'Pending'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'fi';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
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
