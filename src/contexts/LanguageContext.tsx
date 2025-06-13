
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fi' | 'en' | 'es' | 'fr' | 'de' | 'sv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fi: {
    // Common
    'save': 'Tallenna',
    'cancel': 'Peruuta',
    'delete': 'Poista',
    'edit': 'Muokkaa',
    'add': 'Lisää',
    'create': 'Luo',
    'update': 'Päivitä',
    'confirm': 'Vahvista',
    'error': 'Virhe',
    'success': 'Onnistui',
    'loading': 'Ladataan...',
    'optional': 'valinnainen',
    'required': 'pakollinen',
    'yes': 'Kyllä',
    'no': 'Ei',
    'enable': 'Käytä',
    'disable': 'Poista käytöstä',
    'show': 'Näytä',
    'hide': 'Piilota',
    'change': 'Vaihda',
    'remove': 'Poista',
    'day': 'päivä',
    'days': 'päivää',
    
    // Navigation & Main
    'dashboard': 'Hallinta',
    'settings': 'Asetukset',
    'profile': 'Profiili',
    'account': 'Tili',
    'data': 'Tiedot',
    'backup': 'Varmuuskopio',
    'security': 'Turvallisuus',
    'privacy': 'Yksityisyys',
    'appearance': 'Ulkoasu',
    'notifications': 'Ilmoitukset',
    'language': 'Kieli',
    'help': 'Ohje',
    'about': 'Tietoja',
    'sign_out': 'Kirjaudu ulos',
    
    // Security
    'security_settings': 'Turvallisuusasetukset',
    'pin_code': 'PIN-koodi',
    'enable_pin': 'Käytä PIN-koodia',
    'fingerprint': 'Sormenjälki',
    'enable_fingerprint': 'Käytä sormenjälkitunnistusta',
    'two_factor': 'Kaksivaiheinen tunnistus',
    'password': 'Salasana',
    'old_password': 'Vanha salasana',
    'new_password': 'Uusi salasana',
    'confirm_password': 'Vahvista salasana',
    'change_password': 'Vaihda salasana',
    'create_password': 'Luo salasana',
    'app_password': 'Sovelluksen salasana',
    'backup_password': 'Varmuuskopion salasana',
    'master_password': 'Pääsalasana',
    'privacy_security': 'Yksityisyys ja turvallisuus',
    
    // Notifications
    'notification_settings': 'Ilmoitusasetukset',
    'notification_preferences': 'Ilmoitusasetukset',
    'upcoming_payments': 'Tulevat maksut',
    'notify_before_payments_due': 'Ilmoita ennen maksujen eräpäivää',
    'backup_reminders': 'Varmuuskopiomuistutukset',
    'remind_to_create_backups': 'Muistuta varmuuskopioiden luomisesta',
    'low_balance_alert': 'Alhaisen saldon hälytys',
    'notify_when_balance_low': 'Ilmoita kun saldo on alhainen',
    'monthly_report': 'Kuukausiraportti',
    'monthly_summary_notification': 'Kuukausittainen yhteenveto-ilmoitus',
    'notify_days_before': 'Ilmoita päivää ennen',
    'threshold_amount': 'Kynnysarvo',
    'important_note': 'Tärkeä huomautus',
    'notification_permission_required': 'Ilmoitukset vaativat käyttöluvan selaimessa',
    'settings_saved': 'Asetukset tallennettu',
    'notification_settings_updated': 'Ilmoitusasetukset päivitetty',
    
    // Categories
    'create_category': 'Luo kategoria',
    'category_details': 'Kategorian tiedot',
    'category_name': 'Kategorian nimi',
    'enter_category_name': 'Syötä kategorian nimi',
    'description': 'Kuvaus',
    'category_description_placeholder': 'Kuvaile kategoria...',
    'category_color': 'Kategorian väri',
    'category_type': 'Kategorian tyyppi',
    'maintenance_charge': 'Hoitovastike',
    'maintenance_charge_description': 'Taloyhtiön hoitovastike',
    'housing_company_expenditure': 'Taloyhtiön kulu',
    'housing_company_expenditure_description': 'Taloyhtiön ylimääräinen kulu',
    'monthly_payment': 'Kuukausimaksu',
    'monthly_payment_description': 'Toistuva kuukausittainen maksu',
    'category_created': 'Kategoria luotu',
    'category': 'Kategoria',
    'created_successfully': 'luotu onnistuneesti',
    'category_name_required': 'Kategorian nimi on pakollinen',
    
    // Data & Backup
    'export_data': 'Vie tiedot',
    'import_data': 'Tuo tiedot',
    'backup_created': 'Varmuuskopio luotu',
    'data_imported': 'Tiedot tuotu',
    
    // Theme
    'theme': 'Teema',
    'light_theme': 'Vaalea teema',
    'dark_theme': 'Tumma teema'
  },
  
  en: {
    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'create': 'Create',
    'update': 'Update',
    'confirm': 'Confirm',
    'error': 'Error',
    'success': 'Success',
    'loading': 'Loading...',
    'optional': 'optional',
    'required': 'required',
    'yes': 'Yes',
    'no': 'No',
    'enable': 'Enable',
    'disable': 'Disable',
    'show': 'Show',
    'hide': 'Hide',
    'change': 'Change',
    'remove': 'Remove',
    'day': 'day',
    'days': 'days',
    
    // Navigation & Main
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'profile': 'Profile',
    'account': 'Account',
    'data': 'Data',
    'backup': 'Backup',
    'security': 'Security',
    'privacy': 'Privacy',
    'appearance': 'Appearance',
    'notifications': 'Notifications',
    'language': 'Language',
    'help': 'Help',
    'about': 'About',
    'sign_out': 'Sign out',
    
    // Security
    'security_settings': 'Security Settings',
    'pin_code': 'PIN Code',
    'enable_pin': 'Enable PIN code',
    'fingerprint': 'Fingerprint',
    'enable_fingerprint': 'Enable fingerprint authentication',
    'two_factor': 'Two-factor authentication',
    'password': 'Password',
    'old_password': 'Old password',
    'new_password': 'New password',
    'confirm_password': 'Confirm password',
    'change_password': 'Change password',
    'create_password': 'Create password',
    'app_password': 'App password',
    'backup_password': 'Backup password',
    'master_password': 'Master password',
    'privacy_security': 'Privacy & Security',
    
    // Notifications
    'notification_settings': 'Notification Settings',
    'notification_preferences': 'Notification Preferences',
    'upcoming_payments': 'Upcoming Payments',
    'notify_before_payments_due': 'Notify before payments are due',
    'backup_reminders': 'Backup Reminders',
    'remind_to_create_backups': 'Remind to create backups',
    'low_balance_alert': 'Low Balance Alert',
    'notify_when_balance_low': 'Notify when balance is low',
    'monthly_report': 'Monthly Report',
    'monthly_summary_notification': 'Monthly summary notification',
    'notify_days_before': 'Notify days before',
    'threshold_amount': 'Threshold amount',
    'important_note': 'Important Note',
    'notification_permission_required': 'Notifications require browser permission',
    'settings_saved': 'Settings saved',
    'notification_settings_updated': 'Notification settings updated',
    
    // Categories
    'create_category': 'Create Category',
    'category_details': 'Category Details',
    'category_name': 'Category name',
    'enter_category_name': 'Enter category name',
    'description': 'Description',
    'category_description_placeholder': 'Describe the category...',
    'category_color': 'Category color',
    'category_type': 'Category Type',
    'maintenance_charge': 'Maintenance Charge',
    'maintenance_charge_description': 'Housing company maintenance charge',
    'housing_company_expenditure': 'Housing Company Expenditure',
    'housing_company_expenditure_description': 'Housing company additional expense',
    'monthly_payment': 'Monthly Payment',
    'monthly_payment_description': 'Recurring monthly payment',
    'category_created': 'Category created',
    'category': 'Category',
    'created_successfully': 'created successfully',
    'category_name_required': 'Category name is required',
    
    // Data & Backup
    'export_data': 'Export Data',
    'import_data': 'Import Data',
    'backup_created': 'Backup created',
    'data_imported': 'Data imported',
    
    // Theme
    'theme': 'Theme',
    'light_theme': 'Light theme',
    'dark_theme': 'Dark theme'
  },
  
  es: {
    // Common
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'add': 'Añadir',
    'create': 'Crear',
    'update': 'Actualizar',
    'confirm': 'Confirmar',
    'error': 'Error',
    'success': 'Éxito',
    'loading': 'Cargando...',
    'optional': 'opcional',
    'required': 'requerido',
    'yes': 'Sí',
    'no': 'No',
    'enable': 'Activar',
    'disable': 'Desactivar',
    'show': 'Mostrar',
    'hide': 'Ocultar',
    'change': 'Cambiar',
    'remove': 'Eliminar',
    'day': 'día',
    'days': 'días',
    
    // Navigation & Main
    'dashboard': 'Panel',
    'settings': 'Configuración',
    'profile': 'Perfil',
    'account': 'Cuenta',
    'data': 'Datos',
    'backup': 'Copia de seguridad',
    'security': 'Seguridad',
    'privacy': 'Privacidad',
    'appearance': 'Apariencia',
    'notifications': 'Notificaciones',
    'language': 'Idioma',
    'help': 'Ayuda',
    'about': 'Acerca de',
    'sign_out': 'Cerrar sesión',
    
    // Security
    'security_settings': 'Configuración de Seguridad',
    'pin_code': 'Código PIN',
    'enable_pin': 'Activar código PIN',
    'fingerprint': 'Huella digital',
    'enable_fingerprint': 'Activar autenticación por huella',
    'two_factor': 'Autenticación de dos factores',
    'password': 'Contraseña',
    'old_password': 'Contraseña anterior',
    'new_password': 'Nueva contraseña',
    'confirm_password': 'Confirmar contraseña',
    'change_password': 'Cambiar contraseña',
    'create_password': 'Crear contraseña',
    'app_password': 'Contraseña de la app',
    'backup_password': 'Contraseña de copia de seguridad',
    'master_password': 'Contraseña maestra',
    'privacy_security': 'Privacidad y Seguridad',
    
    // Notifications
    'notification_settings': 'Configuración de Notificaciones',
    'notification_preferences': 'Preferencias de Notificación',
    'upcoming_payments': 'Próximos Pagos',
    'notify_before_payments_due': 'Notificar antes del vencimiento',
    'backup_reminders': 'Recordatorios de Copia',
    'remind_to_create_backups': 'Recordar crear copias de seguridad',
    'low_balance_alert': 'Alerta de Saldo Bajo',
    'notify_when_balance_low': 'Notificar cuando el saldo sea bajo',
    'monthly_report': 'Informe Mensual',
    'monthly_summary_notification': 'Notificación de resumen mensual',
    'notify_days_before': 'Notificar días antes',
    'threshold_amount': 'Cantidad umbral',
    'important_note': 'Nota Importante',
    'notification_permission_required': 'Las notificaciones requieren permiso del navegador',
    'settings_saved': 'Configuración guardada',
    'notification_settings_updated': 'Configuración de notificaciones actualizada',
    
    // Categories
    'create_category': 'Crear Categoría',
    'category_details': 'Detalles de Categoría',
    'category_name': 'Nombre de categoría',
    'enter_category_name': 'Ingrese el nombre de la categoría',
    'description': 'Descripción',
    'category_description_placeholder': 'Describe la categoría...',
    'category_color': 'Color de categoría',
    'category_type': 'Tipo de Categoría',
    'maintenance_charge': 'Cargo de Mantenimiento',
    'maintenance_charge_description': 'Cargo de mantenimiento del edificio',
    'housing_company_expenditure': 'Gasto de Empresa de Vivienda',
    'housing_company_expenditure_description': 'Gasto adicional de empresa de vivienda',
    'monthly_payment': 'Pago Mensual',
    'monthly_payment_description': 'Pago mensual recurrente',
    'category_created': 'Categoría creada',
    'category': 'Categoría',
    'created_successfully': 'creada exitosamente',
    'category_name_required': 'El nombre de la categoría es requerido',
    
    // Data & Backup
    'export_data': 'Exportar Datos',
    'import_data': 'Importar Datos',
    'backup_created': 'Copia de seguridad creada',
    'data_imported': 'Datos importados',
    
    // Theme
    'theme': 'Tema',
    'light_theme': 'Tema claro',
    'dark_theme': 'Tema oscuro'
  },
  
  fr: {
    // Common
    'save': 'Enregistrer',
    'cancel': 'Annuler',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'add': 'Ajouter',
    'create': 'Créer',
    'update': 'Mettre à jour',
    'confirm': 'Confirmer',
    'error': 'Erreur',
    'success': 'Succès',
    'loading': 'Chargement...',
    'optional': 'optionnel',
    'required': 'requis',
    'yes': 'Oui',
    'no': 'Non',
    'enable': 'Activer',
    'disable': 'Désactiver',
    'show': 'Afficher',
    'hide': 'Masquer',
    'change': 'Changer',
    'remove': 'Retirer',
    'day': 'jour',
    'days': 'jours',
    
    // Navigation & Main
    'dashboard': 'Tableau de bord',
    'settings': 'Paramètres',
    'profile': 'Profil',
    'account': 'Compte',
    'data': 'Données',
    'backup': 'Sauvegarde',
    'security': 'Sécurité',
    'privacy': 'Confidentialité',
    'appearance': 'Apparence',
    'notifications': 'Notifications',
    'language': 'Langue',
    'help': 'Aide',
    'about': 'À propos',
    'sign_out': 'Se déconnecter',
    
    // Security
    'security_settings': 'Paramètres de Sécurité',
    'pin_code': 'Code PIN',
    'enable_pin': 'Activer le code PIN',
    'fingerprint': 'Empreinte digitale',
    'enable_fingerprint': 'Activer l\'authentification par empreinte',
    'two_factor': 'Authentification à deux facteurs',
    'password': 'Mot de passe',
    'old_password': 'Ancien mot de passe',
    'new_password': 'Nouveau mot de passe',
    'confirm_password': 'Confirmer le mot de passe',
    'change_password': 'Changer le mot de passe',
    'create_password': 'Créer un mot de passe',
    'app_password': 'Mot de passe de l\'app',
    'backup_password': 'Mot de passe de sauvegarde',
    'master_password': 'Mot de passe principal',
    'privacy_security': 'Confidentialité et Sécurité',
    
    // Notifications
    'notification_settings': 'Paramètres de Notification',
    'notification_preferences': 'Préférences de Notification',
    'upcoming_payments': 'Paiements à Venir',
    'notify_before_payments_due': 'Notifier avant l\'échéance des paiements',
    'backup_reminders': 'Rappels de Sauvegarde',
    'remind_to_create_backups': 'Rappeler de créer des sauvegardes',
    'low_balance_alert': 'Alerte Solde Faible',
    'notify_when_balance_low': 'Notifier quand le solde est faible',
    'monthly_report': 'Rapport Mensuel',
    'monthly_summary_notification': 'Notification de résumé mensuel',
    'notify_days_before': 'Notifier jours avant',
    'threshold_amount': 'Montant seuil',
    'important_note': 'Note Importante',
    'notification_permission_required': 'Les notifications nécessitent une permission du navigateur',
    'settings_saved': 'Paramètres enregistrés',
    'notification_settings_updated': 'Paramètres de notification mis à jour',
    
    // Categories
    'create_category': 'Créer une Catégorie',
    'category_details': 'Détails de la Catégorie',
    'category_name': 'Nom de la catégorie',
    'enter_category_name': 'Entrez le nom de la catégorie',
    'description': 'Description',
    'category_description_placeholder': 'Décrivez la catégorie...',
    'category_color': 'Couleur de la catégorie',
    'category_type': 'Type de Catégorie',
    'maintenance_charge': 'Frais de Maintenance',
    'maintenance_charge_description': 'Frais de maintenance de l\'immeuble',
    'housing_company_expenditure': 'Dépense de Société Immobilière',
    'housing_company_expenditure_description': 'Dépense supplémentaire de société immobilière',
    'monthly_payment': 'Paiement Mensuel',
    'monthly_payment_description': 'Paiement mensuel récurrent',
    'category_created': 'Catégorie créée',
    'category': 'Catégorie',
    'created_successfully': 'créée avec succès',
    'category_name_required': 'Le nom de la catégorie est requis',
    
    // Data & Backup
    'export_data': 'Exporter les Données',
    'import_data': 'Importer les Données',
    'backup_created': 'Sauvegarde créée',
    'data_imported': 'Données importées',
    
    // Theme
    'theme': 'Thème',
    'light_theme': 'Thème clair',
    'dark_theme': 'Thème sombre'
  },
  
  de: {
    // Common
    'save': 'Speichern',
    'cancel': 'Abbrechen',
    'delete': 'Löschen',
    'edit': 'Bearbeiten',
    'add': 'Hinzufügen',
    'create': 'Erstellen',
    'update': 'Aktualisieren',
    'confirm': 'Bestätigen',
    'error': 'Fehler',
    'success': 'Erfolg',
    'loading': 'Lädt...',
    'optional': 'optional',
    'required': 'erforderlich',
    'yes': 'Ja',
    'no': 'Nein',
    'enable': 'Aktivieren',
    'disable': 'Deaktivieren',
    'show': 'Anzeigen',
    'hide': 'Verbergen',
    'change': 'Ändern',
    'remove': 'Entfernen',
    'day': 'Tag',
    'days': 'Tage',
    
    // Navigation & Main
    'dashboard': 'Dashboard',
    'settings': 'Einstellungen',
    'profile': 'Profil',
    'account': 'Konto',
    'data': 'Daten',
    'backup': 'Sicherung',
    'security': 'Sicherheit',
    'privacy': 'Datenschutz',
    'appearance': 'Erscheinungsbild',
    'notifications': 'Benachrichtigungen',
    'language': 'Sprache',
    'help': 'Hilfe',
    'about': 'Über',
    'sign_out': 'Abmelden',
    
    // Security
    'security_settings': 'Sicherheitseinstellungen',
    'pin_code': 'PIN-Code',
    'enable_pin': 'PIN-Code aktivieren',
    'fingerprint': 'Fingerabdruck',
    'enable_fingerprint': 'Fingerabdruck-Authentifizierung aktivieren',
    'two_factor': 'Zwei-Faktor-Authentifizierung',
    'password': 'Passwort',
    'old_password': 'Altes Passwort',
    'new_password': 'Neues Passwort',
    'confirm_password': 'Passwort bestätigen',
    'change_password': 'Passwort ändern',
    'create_password': 'Passwort erstellen',
    'app_password': 'App-Passwort',
    'backup_password': 'Sicherungs-Passwort',
    'master_password': 'Master-Passwort',
    'privacy_security': 'Datenschutz & Sicherheit',
    
    // Notifications
    'notification_settings': 'Benachrichtigungseinstellungen',
    'notification_preferences': 'Benachrichtigungseinstellungen',
    'upcoming_payments': 'Anstehende Zahlungen',
    'notify_before_payments_due': 'Vor Zahlungsfälligkeit benachrichtigen',
    'backup_reminders': 'Sicherungserinnerungen',
    'remind_to_create_backups': 'An Erstellung von Sicherungen erinnern',
    'low_balance_alert': 'Warnung bei niedrigem Saldo',
    'notify_when_balance_low': 'Benachrichtigen wenn Saldo niedrig ist',
    'monthly_report': 'Monatsbericht',
    'monthly_summary_notification': 'Monatliche Zusammenfassungsbenachrichtigung',
    'notify_days_before': 'Tage vorher benachrichtigen',
    'threshold_amount': 'Schwellenwert',
    'important_note': 'Wichtiger Hinweis',
    'notification_permission_required': 'Benachrichtigungen erfordern Browser-Berechtigung',
    'settings_saved': 'Einstellungen gespeichert',
    'notification_settings_updated': 'Benachrichtigungseinstellungen aktualisiert',
    
    // Categories
    'create_category': 'Kategorie Erstellen',
    'category_details': 'Kategorie-Details',
    'category_name': 'Kategoriename',
    'enter_category_name': 'Kategoriename eingeben',
    'description': 'Beschreibung',
    'category_description_placeholder': 'Kategorie beschreiben...',
    'category_color': 'Kategoriefarbe',
    'category_type': 'Kategorietyp',
    'maintenance_charge': 'Wartungsgebühr',
    'maintenance_charge_description': 'Hausverwaltungs-Wartungsgebühr',
    'housing_company_expenditure': 'Wohnungsunternehmen-Ausgabe',
    'housing_company_expenditure_description': 'Zusätzliche Ausgabe der Wohnungsgesellschaft',
    'monthly_payment': 'Monatliche Zahlung',
    'monthly_payment_description': 'Wiederkehrende monatliche Zahlung',
    'category_created': 'Kategorie erstellt',
    'category': 'Kategorie',
    'created_successfully': 'erfolgreich erstellt',
    'category_name_required': 'Kategoriename ist erforderlich',
    
    // Data & Backup
    'export_data': 'Daten Exportieren',
    'import_data': 'Daten Importieren',
    'backup_created': 'Sicherung erstellt',
    'data_imported': 'Daten importiert',
    
    // Theme
    'theme': 'Design',
    'light_theme': 'Helles Design',
    'dark_theme': 'Dunkles Design'
  },
  
  sv: {
    // Common
    'save': 'Spara',
    'cancel': 'Avbryt',
    'delete': 'Radera',
    'edit': 'Redigera',
    'add': 'Lägg till',
    'create': 'Skapa',
    'update': 'Uppdatera',
    'confirm': 'Bekräfta',
    'error': 'Fel',
    'success': 'Framgång',
    'loading': 'Laddar...',
    'optional': 'valfri',
    'required': 'obligatorisk',
    'yes': 'Ja',
    'no': 'Nej',
    'enable': 'Aktivera',
    'disable': 'Inaktivera',
    'show': 'Visa',
    'hide': 'Dölj',
    'change': 'Ändra',
    'remove': 'Ta bort',
    'day': 'dag',
    'days': 'dagar',
    
    // Navigation & Main
    'dashboard': 'Instrumentpanel',
    'settings': 'Inställningar',
    'profile': 'Profil',
    'account': 'Konto',
    'data': 'Data',
    'backup': 'Säkerhetskopia',
    'security': 'Säkerhet',
    'privacy': 'Integritet',
    'appearance': 'Utseende',
    'notifications': 'Aviseringar',
    'language': 'Språk',
    'help': 'Hjälp',
    'about': 'Om',
    'sign_out': 'Logga ut',
    
    // Security
    'security_settings': 'Säkerhetsinställningar',
    'pin_code': 'PIN-kod',
    'enable_pin': 'Aktivera PIN-kod',
    'fingerprint': 'Fingeravtryck',
    'enable_fingerprint': 'Aktivera fingeravtrycksautentisering',
    'two_factor': 'Tvåfaktorsautentisering',
    'password': 'Lösenord',
    'old_password': 'Gammalt lösenord',
    'new_password': 'Nytt lösenord',
    'confirm_password': 'Bekräfta lösenord',
    'change_password': 'Ändra lösenord',
    'create_password': 'Skapa lösenord',
    'app_password': 'App-lösenord',
    'backup_password': 'Säkerhetskopie-lösenord',
    'master_password': 'Huvudlösenord',
    'privacy_security': 'Integritet & Säkerhet',
    
    // Notifications
    'notification_settings': 'Aviseringsinställningar',
    'notification_preferences': 'Aviseringspreferenser',
    'upcoming_payments': 'Kommande Betalningar',
    'notify_before_payments_due': 'Meddela innan betalningar förfaller',
    'backup_reminders': 'Påminnelser om Säkerhetskopia',
    'remind_to_create_backups': 'Påminn om att skapa säkerhetskopior',
    'low_balance_alert': 'Varning för Lågt Saldo',
    'notify_when_balance_low': 'Meddela när saldot är lågt',
    'monthly_report': 'Månadsrapport',
    'monthly_summary_notification': 'Månatlig sammanfattningsavisering',
    'notify_days_before': 'Meddela dagar innan',
    'threshold_amount': 'Tröskelbelopp',
    'important_note': 'Viktigt Meddelande',
    'notification_permission_required': 'Aviseringar kräver webbläsartillstånd',
    'settings_saved': 'Inställningar sparade',
    'notification_settings_updated': 'Aviseringsinställningar uppdaterade',
    
    // Categories
    'create_category': 'Skapa Kategori',
    'category_details': 'Kategori-detaljer',
    'category_name': 'Kategorinamn',
    'enter_category_name': 'Ange kategorinamn',
    'description': 'Beskrivning',
    'category_description_placeholder': 'Beskriv kategorin...',
    'category_color': 'Kategorifärg',
    'category_type': 'Kategorityp',
    'maintenance_charge': 'Underhållsavgift',
    'maintenance_charge_description': 'Bostadsrättsförenings underhållsavgift',
    'housing_company_expenditure': 'Bostadsföretag Utgift',
    'housing_company_expenditure_description': 'Bostadsföretags extra utgift',
    'monthly_payment': 'Månadsbetalning',
    'monthly_payment_description': 'Återkommande månadsbetalning',
    'category_created': 'Kategori skapad',
    'category': 'Kategori',
    'created_successfully': 'skapad framgångsrikt',
    'category_name_required': 'Kategorinamn krävs',
    
    // Data & Backup
    'export_data': 'Exportera Data',
    'import_data': 'Importera Data',
    'backup_created': 'Säkerhetskopia skapad',
    'data_imported': 'Data importerad',
    
    // Theme
    'theme': 'Tema',
    'light_theme': 'Ljust tema',
    'dark_theme': 'Mörkt tema'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fi');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
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
