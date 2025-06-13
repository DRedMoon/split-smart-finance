
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fi: {
    // Navigation and general
    home: 'Koti',
    upcoming: 'Tulevat',
    add: 'Lisää',
    history: 'Historia',
    settings: 'Asetukset',
    transactions: 'Tapahtumat',
    
    // Dashboard
    balance: 'Saldo',
    monthly_expenses: 'Kuukausittaiset kulut',
    loans_credits: 'Lainat ja luotot',
    recent_transactions: 'Viimeisimmät tapahtumat',
    view_all: 'Näytä kaikki',
    
    // Upcoming page
    upcoming_week: 'Tuleva viikko',
    financial_overview: 'Taloudellinen yleiskatsaus',
    manage_expenses: 'Hallitse kuluja',
    this_month: 'Tämä kuukausi',
    
    // Transaction types
    income: 'Tulo',
    expense: 'Kulu',
    transfer: 'Siirto',
    loan_payment: 'Lainanmaksu',
    credit_payment: 'Luottokorttimaksu',
    
    // Categories
    category: 'Kategoria',
    categories: 'Kategoriat',
    grocery: 'Ruoka',
    food: 'Ruoka',
    transport: 'Liikenne',
    entertainment: 'Viihde',
    bills: 'Laskut',
    bill: 'Lasku',
    insurance: 'Vakuutus',
    subscription: 'Tilaus',
    loan_bill_payment: 'Lainan laskumaksu',
    credit_card_payment: 'Luottokorttimaksu',
    credit_purchase: 'Luotto-osto',
    paycheck: 'Palkka',
    other: 'Muu',
    
    // Add expense
    add_expense: 'Lisää kulu',
    add_income: 'Lisää tulo',
    add_loan: 'Lisää laina',
    quick_add: 'Nopea lisäys',
    manual_entry: 'Käsin syöttö',
    name: 'Nimi',
    amount: 'Määrä',
    sum: 'Summa',
    total: 'Yhteensä',
    type: 'Tyyppi',
    select_category: 'Valitse kategoria',
    expense_name: 'Kulun nimi',
    
    // Loan/Credit specific fields
    loan_name: 'Lainan nimi',
    abbreviation: 'Lyhennys',
    interest: 'Korko',
    management_fee: 'Hallintamaksu',
    total_credit: 'Luottoraja',
    credits_used: 'Käytetty luotto',
    minimum_payment: 'Vähimmäismaksu',
    minimum_payment_percent: 'Vähimmäismaksu %',
    self_payment: 'Oma maksu',
    monthly_payment_checkbox: 'Kuukausimaksu',
    
    // Loan fields
    total_amount: 'Kokonaismäärä',
    current_amount: 'Nykyinen määrä',
    monthly_payment: 'Kuukausimaksu',
    interest_rate: 'Korko-%',
    euribor_rate: 'Euribor',
    personal_margin: 'Oma marginaali',
    remaining_months: 'Kuukausia jäljellä',
    due_date: 'Eräpäivä',
    
    // Messages
    expense_added: 'Kulu lisätty',
    income_added: 'Tulo lisätty',
    loan_added: 'Laina lisätty',
    error: 'Virhe',
    fill_required_fields: 'Täytä pakolliset kentät',
    
    // Settings
    account: 'Tili',
    profile: 'Profiili',
    notifications: 'Ilmoitukset',
    privacy_security: 'Yksityisyys ja turvallisuus',
    appearance_and_features: 'Ulkoasu ja ominaisuudet',
    appearance: 'Ulkoasu',
    backup: 'Varmuuskopiointi',
    create_category: 'Luo kategoria',
    data: 'Tiedot',
    data_management: 'Tietojen hallinta',
    export_data: 'Vie tiedot',
    import_data: 'Tuo tiedot',
    privacy_and_errors: 'Yksityisyys ja virheet',
    automatic_error_reports: 'Automaattiset virhe raportit',
    analytics: 'Analytiikka',
    clear_all_data: 'Tyhjennä kaikki tiedot',
    
    // Notifications
    backup_created: 'Varmuuskopio luotu',
    data_imported: 'Tiedot tuotu',
    data_cleared: 'Tiedot tyhjennetty',
    notifications_enabled: 'Ilmoitukset käytössä',
    will_receive_payment_notifications: 'Saat maksumuistutuksia',
    permission_denied: 'Lupa evätty',
    notifications_require_permission: 'Ilmoitukset vaativat luvan',
    error_reports_enabled: 'Virheraportit käytössä',
    error_reports_disabled: 'Virheraportit pois käytöstä',
    error_reports_saved: 'Virheraportit tallennetaan',
    error_reports_cleared: 'Virheraportit tyhjennetty',
    analytics_enabled: 'Analytiikka käytössä',
    analytics_disabled: 'Analytiikka pois käytöstä',
    analytics_saved: 'Analytiikka-asetukset tallennettu',
    analytics_cleared: 'Analytiikka-tiedot tyhjennetty',
    
    // App info
    financial_management_app: 'Taloudenhallinta sovellus',
    version: 'Versio',
    user: 'Käyttäjä',
    debts: 'Velat',
    security_settings: 'Turvallisuusasetukset',
    
    // Categories
    category_details: 'Kategorian tiedot',
    category_name: 'Kategorian nimi',
    enter_category_name: 'Anna kategorian nimi',
    description: 'Kuvaus',
    optional: 'valinnainen',
    category_description_placeholder: 'Kuvaile kategoriaa...',
    category_color: 'Kategorian väri',
    category_type: 'Kategorian tyyppi',
    maintenance_charge: 'Hoitovastike',
    maintenance_charge_description: 'Taloyhtiön hoitovastike',
    housing_company_expenditure: 'Taloyhtiön kulu',
    housing_company_expenditure_description: 'Taloyhtiöön liittyvä kulu',
    monthly_payment_description: 'Toistuva kuukausimaksu',
    category_created: 'Kategoria luotu',
    created_successfully: 'luotu onnistuneesti',
    category_name_required: 'Kategorian nimi vaaditaan',
    
    // Category editing
    edit_category: 'Muokkaa kategoriaa',
    save_changes: 'Tallenna muutokset',
    delete_category: 'Poista kategoria',
    category_updated: 'Kategoria päivitetty',
    updated_successfully: 'päivitetty onnistuneesti',
    category_deleted: 'Kategoria poistettu',
    deleted_successfully: 'poistettu onnistuneesti',
    
    // Privacy settings
    privacy_policy: 'Tietosuojakäytäntö',
    data_collection: 'Tietojen keruu',
    
    // Appearance settings
    text_settings: 'Tekstiasetukset',
    screen_settings: 'Näyttöasetukset',
    
    // Backup settings
    backup_location: 'Varmuuskopion sijainti',
    choose_backup_folder: 'Valitse varmuuskopiokansio',
    
    // Notification settings specific
    notification_settings: 'Ilmoitusasetukset',
    payment_reminders: 'Maksumuistutukset',
    backup_reminders: 'Varmuuskopiomuistutukset',
    low_balance_alerts: 'Matalan saldon hälytykset',
    monthly_reports: 'Kuukausiraportit',
    days_before_payment: 'Päivää ennen maksua',
    days_before_backup: 'Päivää ennen varmuuskopiota',
    balance_threshold: 'Saldon raja-arvo',
    
    // Password settings
    change_password: 'Vaihda salasana',
    add_password: 'Lisää salasana',
    current_password: 'Nykyinen salasana',
    new_password: 'Uusi salasana',
    confirm_password: 'Vahvista salasana',
    
    // Confirmation dialogs
    confirm_clear_all_data: 'Haluatko varmasti tyhjentää kaikki tiedot?'
  },
  en: {
    // Navigation and general
    home: 'Home',
    upcoming: 'Upcoming',
    add: 'Add',
    history: 'History',
    settings: 'Settings',
    transactions: 'Transactions',
    
    // Dashboard
    balance: 'Balance',
    monthly_expenses: 'Monthly expenses',
    loans_credits: 'Loans & Credits',
    recent_transactions: 'Recent transactions',
    view_all: 'View all',
    
    // Upcoming page
    upcoming_week: 'Upcoming week',
    financial_overview: 'Financial overview',
    manage_expenses: 'Manage expenses',
    this_month: 'This month',
    
    // Transaction types
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
    loan_payment: 'Loan payment',
    credit_payment: 'Credit payment',
    
    // Categories
    category: 'Category',
    categories: 'Categories',
    grocery: 'Grocery',
    food: 'Food',
    transport: 'Transport',
    entertainment: 'Entertainment',
    bills: 'Bills',
    bill: 'Bill',
    insurance: 'Insurance',
    subscription: 'Subscription',
    loan_bill_payment: 'Loan bill payment',
    credit_card_payment: 'Credit card payment',
    credit_purchase: 'Credit purchase',
    paycheck: 'Paycheck',
    other: 'Other',
    
    // Add expense
    add_expense: 'Add expense',
    add_income: 'Add income',
    add_loan: 'Add loan',
    quick_add: 'Quick add',
    manual_entry: 'Manual entry',
    name: 'Name',
    amount: 'Amount',
    sum: 'Sum',
    total: 'Total',
    type: 'Type',
    select_category: 'Select category',
    expense_name: 'Expense name',
    
    // Loan/Credit specific fields
    loan_name: 'Loan name',
    abbreviation: 'Abbreviation',
    interest: 'Interest',
    management_fee: 'Management fee',
    total_credit: 'Total credit',
    credits_used: 'Credits used',
    minimum_payment: 'Minimum payment',
    minimum_payment_percent: 'Minimum payment %',
    self_payment: 'Self payment',
    monthly_payment_checkbox: 'Monthly payment',
    
    // Loan fields
    total_amount: 'Total amount',
    current_amount: 'Current amount',
    monthly_payment: 'Monthly payment',
    interest_rate: 'Interest rate',
    euribor_rate: 'Euribor rate',
    personal_margin: 'Personal margin',
    remaining_months: 'Remaining months',
    due_date: 'Due date',
    
    // Messages
    expense_added: 'Expense added',
    income_added: 'Income added',
    loan_added: 'Loan added',
    error: 'Error',
    fill_required_fields: 'Fill required fields',
    
    // Settings
    account: 'Account',
    profile: 'Profile',
    notifications: 'Notifications',
    privacy_security: 'Privacy & Security',
    appearance_and_features: 'Appearance & Features',
    appearance: 'Appearance',
    backup: 'Backup',
    create_category: 'Create category',
    data: 'Data',
    data_management: 'Data management',
    export_data: 'Export data',
    import_data: 'Import data',
    privacy_and_errors: 'Privacy & Errors',
    automatic_error_reports: 'Automatic error reports',
    analytics: 'Analytics',
    clear_all_data: 'Clear all data',
    
    // Notifications
    backup_created: 'Backup created',
    data_imported: 'Data imported',
    data_cleared: 'Data cleared',
    notifications_enabled: 'Notifications enabled',
    will_receive_payment_notifications: 'You will receive payment notifications',
    permission_denied: 'Permission denied',
    notifications_require_permission: 'Notifications require permission',
    error_reports_enabled: 'Error reports enabled',
    error_reports_disabled: 'Error reports disabled',
    error_reports_saved: 'Error reports will be saved',
    error_reports_cleared: 'Error reports cleared',
    analytics_enabled: 'Analytics enabled',
    analytics_disabled: 'Analytics disabled',
    analytics_saved: 'Analytics settings saved',
    analytics_cleared: 'Analytics data cleared',
    
    // App info
    financial_management_app: 'Financial Management App',
    version: 'Version',
    user: 'User',
    debts: 'Debts',
    security_settings: 'Security settings',
    
    // Categories
    category_details: 'Category details',
    category_name: 'Category name',
    enter_category_name: 'Enter category name',
    description: 'Description',
    optional: 'optional',
    category_description_placeholder: 'Describe the category...',
    category_color: 'Category color',
    category_type: 'Category type',
    maintenance_charge: 'Maintenance charge',
    maintenance_charge_description: 'Housing company maintenance charge',
    housing_company_expenditure: 'Housing company expenditure',
    housing_company_expenditure_description: 'Housing company related expense',
    monthly_payment_description: 'Recurring monthly payment',
    category_created: 'Category created',
    created_successfully: 'created successfully',
    category_name_required: 'Category name is required',
    
    // Category editing
    edit_category: 'Edit category',
    save_changes: 'Save changes',
    delete_category: 'Delete category',
    category_updated: 'Category updated',
    updated_successfully: 'updated successfully',
    category_deleted: 'Category deleted',
    deleted_successfully: 'deleted successfully',
    
    // Privacy settings
    privacy_policy: 'Privacy Policy',
    data_collection: 'Data Collection',
    
    // Appearance settings
    text_settings: 'Text Settings',
    screen_settings: 'Screen Settings',
    
    // Backup settings
    backup_location: 'Backup Location',
    choose_backup_folder: 'Choose backup folder',
    
    // Notification settings specific
    notification_settings: 'Notification Settings',
    payment_reminders: 'Payment Reminders',
    backup_reminders: 'Backup Reminders',
    low_balance_alerts: 'Low Balance Alerts',
    monthly_reports: 'Monthly Reports',
    days_before_payment: 'Days before payment',
    days_before_backup: 'Days before backup',
    balance_threshold: 'Balance threshold',
    
    // Password settings
    change_password: 'Change Password',
    add_password: 'Add Password',
    current_password: 'Current password',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    
    // Confirmation dialogs
    confirm_clear_all_data: 'Are you sure you want to clear all data?'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fi');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'fi' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fi']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
