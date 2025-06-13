
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Fingerprint, Shield, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [pin, setPin] = useState('');

  const handlePinToggle = (enabled: boolean) => {
    if (enabled && pin.length !== 4) {
      toast({
        title: "Virhe",
        description: "PIN-koodin tulee olla 4 numeroa",
        variant: "destructive"
      });
      return;
    }
    
    setPinEnabled(enabled);
    if (enabled) {
      localStorage.setItem('app-pin', pin);
      toast({
        title: "PIN käytössä",
        description: "PIN-koodi on asetettu onnistuneesti",
      });
    } else {
      localStorage.removeItem('app-pin');
      toast({
        title: "PIN poistettu",
        description: "PIN-koodi on poistettu käytöstä",
      });
    }
  };

  const handleFingerprintToggle = (enabled: boolean) => {
    if (enabled && !navigator.credentials) {
      toast({
        title: "Ei tuettu",
        description: "Sormenjälkitunnistus ei ole tuettu tässä laitteessa",
        variant: "destructive"
      });
      return;
    }
    
    setFingerprintEnabled(enabled);
    toast({
      title: enabled ? "Sormenjälki käytössä" : "Sormenjälki pois käytöstä",
      description: enabled ? "Sormenjälkitunnistus on aktivoitu" : "Sormenjälkitunnistus on poistettu käytöstä",
    });
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('security_settings')}</h1>
      </div>

      {/* PIN Code Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Lock size={20} />
            <span>{t('pin_code')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pin" className="text-white">PIN-koodi (4 numeroa)</Label>
            <Input
              id="pin"
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="••••"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('enable_pin')}</div>
              <div className="text-sm text-white/70">Suojaa sovellus PIN-koodilla</div>
            </div>
            <Switch 
              checked={pinEnabled} 
              onCheckedChange={handlePinToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Biometric Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Fingerprint size={20} />
            <span>{t('fingerprint')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('enable_fingerprint')}</div>
              <div className="text-sm text-white/70">Käytä sormenjälkeä kirjautumiseen</div>
            </div>
            <Switch 
              checked={fingerprintEnabled} 
              onCheckedChange={handleFingerprintToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Two Factor Authentication */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield size={20} />
            <span>{t('two_factor')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">Kaksivaiheinen tunnistus</div>
              <div className="text-sm text-white/70">Lisäturvallisuus SMS:llä</div>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Key size={20} />
            <span>Turvatoiminnot</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-white/30 hover:bg-white/10"
          >
            Vaihda salasana
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-white/30 hover:bg-white/10"
          >
            Tarkista turvallisuus
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-400 border-red-400/30 hover:bg-red-500/10"
          >
            Tyhjennä kaikki tiedot
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
