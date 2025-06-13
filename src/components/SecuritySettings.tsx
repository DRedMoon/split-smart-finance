
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
  const [qrCode, setQrCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');

  useEffect(() => {
    // Load existing settings
    const savedPin = localStorage.getItem('app-pin');
    const savedFingerprint = localStorage.getItem('fingerprint-enabled');
    const saved2FA = localStorage.getItem('2fa-enabled');
    
    setPinEnabled(!!savedPin);
    setFingerprintEnabled(savedFingerprint === 'true');
    setTwoFactorEnabled(saved2FA === 'true');
    
    if (savedPin) {
      setPin('••••'); // Hide actual PIN
    }
  }, []);

  const generateTwoFactorSecret = () => {
    // Generate a random base32 secret for 2FA
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const appName = 'Talous App';
    const userEmail = loadFinancialData()?.profile?.email || 'user@example.com';
    const issuer = 'TalousApp';
    
    // Generate QR code URL for authenticator apps
    const qrUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    setTwoFactorSecret(secret);
    setQrCode(qrUrl);
    
    return secret;
  };

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

  const handleFingerprintToggle = async (enabled: boolean) => {
    if (enabled) {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        toast({
          title: "Ei tuettu",
          description: "Sormenjälkitunnistus ei ole tuettu tässä selaimessa",
          variant: "destructive"
        });
        return;
      }
      
      try {
        // Create a simple credential for fingerprint authentication
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "Talous App" },
            user: {
              id: new Uint8Array(16),
              name: "user@example.com",
              displayName: "User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            }
          }
        });
        
        if (credential) {
          localStorage.setItem('fingerprint-enabled', 'true');
          localStorage.setItem('fingerprint-credential', JSON.stringify(credential.id));
          setFingerprintEnabled(true);
          toast({
            title: "Sormenjälki käytössä",
            description: "Sormenjälkitunnistus on aktivoitu",
          });
        }
      } catch (error) {
        toast({
          title: "Virhe",
          description: "Sormenjälkitunnistuksen asetus epäonnistui",
          variant: "destructive"
        });
      }
    } else {
      localStorage.removeItem('fingerprint-enabled');
      localStorage.removeItem('fingerprint-credential');
      setFingerprintEnabled(false);
      toast({
        title: "Sormenjälki pois käytöstä",
        description: "Sormenjälkitunnistus on poistettu käytöstä",
      });
    }
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    if (enabled) {
      const secret = generateTwoFactorSecret();
      localStorage.setItem('2fa-enabled', 'true');
      localStorage.setItem('2fa-secret', secret);
      setTwoFactorEnabled(true);
      toast({
        title: "2FA käytössä",
        description: "Skannaa QR-koodi authenticator-sovelluksella",
      });
    } else {
      localStorage.removeItem('2fa-enabled');
      localStorage.removeItem('2fa-secret');
      setTwoFactorEnabled(false);
      setQrCode('');
      setTwoFactorSecret('');
      toast({
        title: "2FA pois käytöstä",
        description: "Kaksivaiheinen tunnistus on poistettu käytöstä",
      });
    }
  };

  const handlePasswordChange = () => {
    toast({
      title: "Tulossa pian",
      description: "Salasanan vaihto -toiminto tulossa seuraavassa päivityksessä",
    });
  };

  const handleSecurityCheck = () => {
    const checks = [];
    if (pinEnabled) checks.push("PIN-koodi käytössä");
    if (fingerprintEnabled) checks.push("Sormenjälki käytössä");
    if (twoFactorEnabled) checks.push("2FA käytössä");
    
    toast({
      title: "Turvallisuustarkistus",
      description: checks.length > 0 ? checks.join(", ") : "Ei turvallisuustoimia käytössä",
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
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">Kaksivaiheinen tunnistus</div>
              <div className="text-sm text-white/70">Käytä authenticator-sovellusta</div>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
          
          {twoFactorEnabled && twoFactorSecret && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <h4 className="text-white font-semibold mb-2">2FA Asetus:</h4>
              <div className="text-white text-sm space-y-2">
                <p>1. Lataa authenticator-sovellus (esim. Aegis, Google Authenticator)</p>
                <p>2. Skannaa QR-koodi tai syötä avain manuaalisesti:</p>
                <div className="font-mono text-xs bg-black/20 p-2 rounded break-all">
                  {twoFactorSecret}
                </div>
                <p>3. Syötä 6-numeroinen koodi authenticator-sovelluksesta</p>
              </div>
              {qrCode && (
                <div className="mt-2 text-xs text-white/70">
                  QR-koodi URL: <span className="break-all">{qrCode}</span>
                </div>
              )}
            </div>
          )}
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
            onClick={handlePasswordChange}
            className="w-full justify-start text-white border-white/30 hover:bg-white/10"
          >
            Vaihda salasana
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSecurityCheck}
            className="w-full justify-start text-white border-white/30 hover:bg-white/10"
          >
            Tarkista turvallisuus
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/data-management')}
            className="w-full justify-start text-red-400 border-red-400/30 hover:bg-red-500/10"
          >
            Hallitse tietoja
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
