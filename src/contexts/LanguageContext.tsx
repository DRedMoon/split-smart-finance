
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
    
    // Payment status
    paid: 'Maksettu',
    unpaid: 'Maksamaton',
    paid_off: 'Maksettu pois',
    remaining: 'Jäljellä',
    total_debt: 'Velka yhteensä',
    original_amount: 'Alkuperäinen summa',
    current_amount: 'Nykyinen summa',
    
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
    choose_backup_folder: 'Valitse varmuuskopiokansio'
  },
  en: {
    // Dashboard
    balance: 'Balance',
    monthly_payments: 'Monthly Payments',
    loans_credits: 'Loans & Credits',
    upcoming: 'Upcoming',
    transactions: 'Transactions',
    
    // Payment status
    paid: 'Paid',
    unpaid: 'Unpaid',
    paid_off: 'Paid Off',
    remaining: 'Remaining',
    total_debt: 'Total Debt',
    original_amount: 'Original Amount',
    current_amount: 'Current Amount',
    
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
    choose_backup_folder: 'Choose Backup Folder'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fi');

  const t = (key: string): string => {
    return translations[language][key] || key;
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
