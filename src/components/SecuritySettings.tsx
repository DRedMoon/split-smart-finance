
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import PinCodeSection from './security/PinCodeSection';
import BiometricSection from './security/BiometricSection';
import TwoFactorSection from './security/TwoFactorSection';
import SecurityActions from './security/SecurityActions';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  const handleSecretGenerated = (secret: string, qrUrl: string) => {
    setTwoFactorSecret(secret);
    setQrCode(qrUrl);
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

      <PinCodeSection
        pin={pin}
        pinEnabled={pinEnabled}
        onPinChange={setPin}
        onPinToggle={setPinEnabled}
      />

      <BiometricSection
        fingerprintEnabled={fingerprintEnabled}
        onFingerprintToggle={setFingerprintEnabled}
      />

      <TwoFactorSection
        twoFactorEnabled={twoFactorEnabled}
        twoFactorSecret={twoFactorSecret}
        qrCode={qrCode}
        onTwoFactorToggle={setTwoFactorEnabled}
        onSecretGenerated={handleSecretGenerated}
      />

      <SecurityActions />
    </div>
  );
};

export default SecuritySettings;
