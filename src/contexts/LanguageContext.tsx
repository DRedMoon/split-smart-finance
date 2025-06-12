
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
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
    'remaining': 'left'
  },
  es: {
    'financial_overview': 'Resumen Financiero',
    'manage_expenses': 'Gestiona tus gastos y deudas',
    'balance': 'Saldo',
    'current_balance': 'Saldo Actual',
    'this_month': 'Este Mes',
    'loans_credits': 'Préstamos y Créditos',
    'monthly_payments': 'Pagos Mensuales',
    'upcoming_week': 'Próximo Esta Semana',
    'due': 'Vence',
    'home': 'Inicio',
    'expenses': 'Gastos',
    'add': 'Añadir',
    'history': 'Historial',
    'settings': 'Configuración',
    'car_loan': 'Préstamo del Coche',
    'student_loan': 'Préstamo Estudiantil',
    'rent': 'Alquiler',
    'car_payment': 'Pago del Coche',
    'credit_card': 'Tarjeta de Crédito',
    'phone': 'Teléfono',
    'view_all_payments': 'Ver todos los pagos',
    'transactions': 'Transacciones',
    'remaining': 'restantes'
  },
  fr: {
    'financial_overview': 'Aperçu Financier',
    'manage_expenses': 'Gérez vos dépenses et dettes',
    'balance': 'Solde',
    'current_balance': 'Solde Actuel',
    'this_month': 'Ce Mois',
    'loans_credits': 'Prêts et Crédits',
    'monthly_payments': 'Paiements Mensuels',
    'upcoming_week': 'À Venir Cette Semaine',
    'due': 'Échéance',
    'home': 'Accueil',
    'expenses': 'Dépenses',
    'add': 'Ajouter',
    'history': 'Historique',
    'settings': 'Paramètres',
    'car_loan': 'Prêt Auto',
    'student_loan': 'Prêt Étudiant',
    'rent': 'Loyer',
    'car_payment': 'Paiement Auto',
    'credit_card': 'Carte de Crédit',
    'phone': 'Téléphone',
    'view_all_payments': 'Voir tous les paiements',
    'transactions': 'Transactions',
    'remaining': 'restants'
  },
  de: {
    'financial_overview': 'Finanzübersicht',
    'manage_expenses': 'Verwalten Sie Ihre Ausgaben und Schulden',
    'balance': 'Guthaben',
    'current_balance': 'Aktuelles Guthaben',
    'this_month': 'Diesen Monat',
    'loans_credits': 'Kredite und Darlehen',
    'monthly_payments': 'Monatliche Zahlungen',
    'upcoming_week': 'Diese Woche Anstehend',
    'due': 'Fällig',
    'home': 'Start',
    'expenses': 'Ausgaben',
    'add': 'Hinzufügen',
    'history': 'Verlauf',
    'settings': 'Einstellungen',
    'car_loan': 'Autokredit',
    'student_loan': 'Studentendarlehen',
    'rent': 'Miete',
    'car_payment': 'Autozahlung',
    'credit_card': 'Kreditkarte',
    'phone': 'Telefon',
    'view_all_payments': 'Alle Zahlungen anzeigen',
    'transactions': 'Transaktionen',
    'remaining': 'verbleibend'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
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
