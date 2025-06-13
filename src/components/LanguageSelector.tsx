
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' }
  ];

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white">Kieli / Language / Idioma / Langue / Sprache / Språk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? "default" : "outline"}
            onClick={() => setLanguage(lang.code as any)}
            className={`w-full justify-start ${
              language === lang.code 
                ? "bg-white text-[#192E45] hover:bg-white/90" 
                : "bg-transparent border-white/30 text-white hover:bg-white/10"
            }`}
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
