
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language / Idioma / Langue / Sprache</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? "default" : "outline"}
            onClick={() => setLanguage(lang.code as any)}
            className="w-full justify-start"
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
