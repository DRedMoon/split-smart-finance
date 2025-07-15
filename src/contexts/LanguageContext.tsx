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
    
    // Notification settings
    notification_settings: 'Ilmoitusasetukset',
    notification_preferences: 'Ilmoitusasetukset',
    upcoming_payments: 'Tulevat maksut',
    backup_reminders: 'Varmuuskopiomuistutukset',
    low_balance_alert: 'Alhaisen saldon hälytys',
    monthly_report: 'Kuukausiraportti',
    notify_before_payments_due: 'Ilmoita ennen maksuja',
    remind_to_create_backups: 'Muistuta varmuuskopioiden luomisesta',
    notify_when_balance_low: 'Ilmoita kun saldo on alhainen',
    monthly_summary_notification: 'Kuukausittainen yhteenveto',
    notify_days_before: 'Ilmoita päiviä ennen',
    day: 'päivä',
    days: 'päivää',
    threshold_amount: 'Kynnysarvo',
    important_note: 'Tärkeä huomautus',
    notification_permission_required: 'Ilmoitusoikeudet vaaditaan',
    save_settings: 'Tallenna asetukset',
    settings_saved: 'Asetukset tallennettu',
    notification_settings_updated: 'Ilmoitusasetukset päivitetty',
    
    // Appearance settings
    text_settings: 'Tekstiasetukset',
    screen_settings: 'Näyttöasetukset',
    
    // Backup settings
    backup_location: 'Varmuuskopion sijainti',
    choose_backup_folder: 'Valitse varmuuskopiokansio',
    
    // New missing translations
    home: 'Koti',
    back: 'Takaisin',
    cancel: 'Peruuta',
    save: 'Tallenna',
    delete: 'Poista',
    edit: 'Muokkaa',
    add: 'Lisää',
    remove: 'Poista',
    loading: 'Ladataan...',
    no_data: 'Ei tietoja',
    success: 'Onnistui',
    failed: 'Epäonnistui',
    
    // New translations for enhanced features
    search_transactions: 'Hae tapahtumia...',
    filter_by_type: 'Suodata tyypillä',
    date_range: 'Aikaväli',
    last_week: 'Viime viikko',
    last_month: 'Viime kuukausi', 
    last_quarter: 'Viime neljännes',
    last_year: 'Viime vuosi',
    from_date: 'Alkaen',
    to_date: 'Päättyen',
    showing_transactions: 'Näytetään {count} / {total} tapahtumaa',
    no_transactions_found: 'Ei tapahtumia löytynyt',
    transaction_updated: 'Tapahtuma päivitetty',
    transaction_deleted: 'Tapahtuma poistettu',
    failed_to_update_transaction: 'Tapahtuman päivittäminen epäonnistui',
    failed_to_delete_transaction: 'Tapahtuman poistaminen epäonnistui',
    confirm_delete_transaction: 'Haluatko varmasti poistaa tämän tapahtuman?',
    transactions_exported: 'Tapahtumat viety',
    edit_transaction: 'Muokkaa tapahtumaa',
    expense: 'Kulu',
    expenses: 'Kulut',
    
    // Category management
    edit_category: 'Muokkaa kategoriaa',
    category_details: 'Kategorian tiedot',
    category_name: 'Kategorian nimi',
    enter_category_name: 'Syötä kategorian nimi',
    category_description_placeholder: 'Kuvaus kategorialle...',
    category_color: 'Kategorian väri',
    maintenance_charge: 'Hoitovastike',
    maintenance_charge_description: 'Taloyhtiön hoitovastike',
    housing_company_expenditure: 'Taloyhtiön meno',
    housing_company_expenditure_description: 'Taloyhtiön yhteinen meno',
    monthly_payment_description: 'Kuukausittain toistuva maksu',
    save_changes: 'Tallenna muutokset',
    delete_category: 'Poista kategoria',
    category_updated: 'Kategoria päivitetty',
    category_deleted: 'Kategoria poistettu',
    updated_successfully: 'päivitetty onnistuneesti',
    deleted_successfully: 'poistettu onnistuneesti',
    category_name_required: 'Kategorian nimi vaaditaan',
    confirm_delete_category: 'Haluatko varmasti poistaa kategorian',
    
    // Category creator additions
    create_edit_category: 'Luo/muokkaa kategoriaa',
    existing_categories: 'Olemassa olevat kategoriat',
    no_categories: 'Ei kategorioita',
    create_new_category: 'Luo uusi kategoria',
    create_category: 'Luo kategoria',
    category_created: 'Kategoria luotu',
    created_successfully: 'luotu onnistuneesti',
    optional: 'valinnainen',
    
    // Settings and forms
    fill_required_fields: 'Täytä vaaditut kentät',
    credit_card_added: 'Luottokortti lisätty',
    calculated_values: 'Lasketut arvot',
    minimum_monthly_payment: 'Vähimmäiskuukausimaksu',
    estimated_total_with_interest: 'Arvioitu kokonaismäärä korkoineen',
    credit_card_name: 'Luottokortin nimi',
    credit_limit: 'Luottoraja',
    used_credit: 'Käytetty luotto',
    management_fee: 'Hallinnointipalkkio',
    minimum_payment_percent: 'Vähimmäismaksun prosentti',
    
    // Additional settings translations
    data_exported_successfully: 'Tiedot on viety onnistuneesti',
    data_imported_successfully: 'Tiedot on tuotu onnistuneesti',
    error_importing_data: 'Virhe tietojen tuonnissa',
    all_data_deleted: 'Kaikki tiedot on poistettu',
    confirm_clear_all: 'Haluatko varmasti tyhjentää kaikki tiedot?',
    notifications_enabled: 'Ilmoitukset käytössä',
    you_will_receive_notifications: 'Saat nyt ilmoituksia maksuista',
    permission_denied: 'Käyttöoikeus evätty',
    notifications_need_permission: 'Ilmoitukset tarvitsevat käyttöoikeuden',
    privacy_policy: 'Tietosuojakäytäntö',
    app_stores_data_locally: 'Tämä sovellus tallentaa tietosi paikallisesti laitteellesi. Mitään tietoja ei lähetetä ulkoisille palvelimille.',
    only_essential_cookies: 'Käytämme vain välttämättömiä evästeitä sovelluksen toiminnallisuuden varmistamiseksi.',
    analytics: 'Analytiikka',
    usage_data_collection: 'Käyttötietojen kerääminen',
    error_reports: 'Virheraportit',
    automatic_error_reports: 'Automaattiset virheraportti',
    visibility_settings: 'Näkyvyysasetukset',
    hide_balances: 'Piilota saldot',
    hide_balances_background: 'Piilota saldot taustasovelluksessa',
    screenshot_protection: 'Näyttökuvasuojaus',
    prevent_screenshots: 'Estä näyttökuvien ottaminen',
    appearance_features: 'Ulkoasu ja ominaisuudet',
    security_passwords: 'Turvallisuus ja salasanat',
    security_settings: 'Turvallisuusasetukset',
    financial_app: 'Taloudenhallinta-sovellus',
    due_date: 'Eräpäivä',
    add_credit_card: 'Lisää luottokortti',
    yearly_interest: 'Vuosikorko'
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
    
    // Notification settings 
    notification_settings: 'Notification Settings',
    notification_preferences: 'Notification Preferences',
    upcoming_payments: 'Upcoming Payments',
    backup_reminders: 'Backup Reminders',
    low_balance_alert: 'Low Balance Alert',
    monthly_report: 'Monthly Report',
    notify_before_payments_due: 'Notify before payments are due',
    remind_to_create_backups: 'Remind to create backups',
    notify_when_balance_low: 'Notify when balance is low',
    monthly_summary_notification: 'Monthly summary notification',
    notify_days_before: 'Notify days before',
    day: 'day',
    days: 'days',
    threshold_amount: 'Threshold Amount',
    important_note: 'Important Note',
    notification_permission_required: 'Notification permissions required',
    save_settings: 'Save Settings',
    settings_saved: 'Settings Saved',
    notification_settings_updated: 'Notification settings updated',
    
    // Appearance settings
    text_settings: 'Text Settings',
    screen_settings: 'Screen Settings',
    
    // Backup settings
    backup_location: 'Backup Location',
    choose_backup_folder: 'Choose Backup Folder',
    
    // New missing translations
    home: 'Home',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    loading: 'Loading...',
    no_data: 'No data',
    success: 'Success',
    failed: 'Failed',
    
    // New translations for enhanced features
    search_transactions: 'Search transactions...',
    filter_by_type: 'Filter by type',
    date_range: 'Date Range',
    last_week: 'Last Week',
    last_month: 'Last Month',
    last_quarter: 'Last Quarter', 
    last_year: 'Last Year',
    from_date: 'From',
    to_date: 'To',
    showing_transactions: 'Showing {count} of {total} transactions',
    no_transactions_found: 'No transactions found',
    transaction_updated: 'Transaction Updated',
    transaction_deleted: 'Transaction Deleted',
    failed_to_update_transaction: 'Failed to update transaction',
    failed_to_delete_transaction: 'Failed to delete transaction',
    confirm_delete_transaction: 'Are you sure you want to delete this transaction?',
    transactions_exported: 'Transactions Exported',
    edit_transaction: 'Edit Transaction',
    expense: 'Expense',
    expenses: 'Expenses',
    
    // Category management
    edit_category: 'Edit Category',
    category_details: 'Category Details',
    category_name: 'Category Name',
    enter_category_name: 'Enter category name',
    category_description_placeholder: 'Description for category...',
    category_color: 'Category Color',
    maintenance_charge: 'Maintenance Charge',
    maintenance_charge_description: 'Housing company maintenance charge',
    housing_company_expenditure: 'Housing Company Expenditure',
    housing_company_expenditure_description: 'Housing company shared expense',
    monthly_payment_description: 'Monthly recurring payment', 
    save_changes: 'Save Changes',
    delete_category: 'Delete Category',
    category_updated: 'Category Updated',
    category_deleted: 'Category Deleted',
    updated_successfully: 'updated successfully',
    deleted_successfully: 'deleted successfully',
    category_name_required: 'Category name is required',
    confirm_delete_category: 'Are you sure you want to delete category',
    
    // Category creator additions
    create_edit_category: 'Create/Edit Category',
    existing_categories: 'Existing Categories',
    no_categories: 'No categories',
    create_new_category: 'Create New Category',
    create_category: 'Create Category',
    category_created: 'Category Created',
    created_successfully: 'created successfully',
    optional: 'optional',
    
    // Settings and forms
    fill_required_fields: 'Fill required fields',
    credit_card_added: 'Credit card added',
    calculated_values: 'Calculated values',
    minimum_monthly_payment: 'Minimum monthly payment',
    estimated_total_with_interest: 'Estimated total with interest',
    credit_card_name: 'Credit card name',
    credit_limit: 'Credit limit',
    used_credit: 'Used credit',
    management_fee: 'Management fee',
    minimum_payment_percent: 'Minimum payment percent',
    
    // Additional settings translations
    data_exported_successfully: 'Data exported successfully',
    data_imported_successfully: 'Data imported successfully',
    error_importing_data: 'Error importing data',
    all_data_deleted: 'All data deleted',
    confirm_clear_all: 'Are you sure you want to clear all data?',
    notifications_enabled: 'Notifications enabled',
    you_will_receive_notifications: 'You will now receive payment notifications',
    permission_denied: 'Permission denied',
    notifications_need_permission: 'Notifications require permission',
    privacy_policy: 'Privacy Policy',
    app_stores_data_locally: 'This app stores your data locally on your device. No data is sent to external servers.',
    only_essential_cookies: 'We only use essential cookies to ensure app functionality.',
    analytics: 'Analytics',
    usage_data_collection: 'Usage data collection',
    error_reports: 'Error reports',
    automatic_error_reports: 'Automatic error reports',
    visibility_settings: 'Visibility settings',
    hide_balances: 'Hide balances',
    hide_balances_background: 'Hide balances in background app',
    screenshot_protection: 'Screenshot protection',
    prevent_screenshots: 'Prevent taking screenshots',
    appearance_features: 'Appearance & Features',
    security_passwords: 'Security & Passwords',
    security_settings: 'Security Settings',
    financial_app: 'Financial Management App',
    due_date: 'Due Date',
    add_credit_card: 'Add Credit Card',
    yearly_interest: 'Yearly Interest'
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
