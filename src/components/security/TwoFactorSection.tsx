
import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData } from '@/services/storageService';

interface TwoFactorSectionProps {
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  qrCode: string;
  onTwoFactorToggle: (enabled: boolean) => void;
  onSecretGenerated: (secret: string, qrCode: string) => void;
}

const TwoFactorSection: React.FC<TwoFactorSectionProps> = ({
  twoFactorEnabled,
  twoFactorSecret,
  qrCode,
  onTwoFactorToggle,
  onSecretGenerated
}) => {
  const { t } = useSafeLanguage();
  const { toast } = useToast();

  const generateTwoFactorSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const appName = 'Talous App';
    const userEmail = loadFinancialData()?.profile?.email || 'user@example.com';
    const issuer = 'TalousApp';
    
    const qrUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    onSecretGenerated(secret, qrUrl);
    return secret;
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    if (enabled) {
      const secret = generateTwoFactorSecret();
      localStorage.setItem('2fa-enabled', 'true');
      localStorage.setItem('2fa-secret', secret);
      onTwoFactorToggle(true);
      toast({
        title: t('two_factor_enabled'),
        description: t('scan_qr_code'),
      });
    } else {
      localStorage.removeItem('2fa-enabled');
      localStorage.removeItem('2fa-secret');
      onTwoFactorToggle(false);
      onSecretGenerated('', '');
      toast({
        title: t('two_factor_disabled'),
        description: t('two_factor_disabled_description'),
      });
    }
  };

  return (
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
            <div className="font-medium">{t('two_factor_auth')}</div>
            <div className="text-sm text-white/70">{t('use_authenticator')}</div>
          </div>
          <Switch 
            checked={twoFactorEnabled} 
            onCheckedChange={handleTwoFactorToggle}
          />
        </div>
        
        {twoFactorEnabled && twoFactorSecret && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <h4 className="text-white font-semibold mb-2">{t('two_factor_setup')}</h4>
            <div className="text-white text-sm space-y-2">
              <p>1. {t('download_authenticator')}</p>
              <p>2. {t('scan_or_enter_key')}</p>
              <div className="font-mono text-xs bg-black/20 p-2 rounded break-all">
                {twoFactorSecret}
              </div>
              <p>3. {t('enter_6_digit_code')}</p>
            </div>
            {qrCode && (
              <div className="mt-2 text-xs text-white/70">
                {t('qr_code_url')} <span className="break-all">{qrCode}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSection;
