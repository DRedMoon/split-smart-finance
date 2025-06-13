
import React from 'react';
import { Fingerprint } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface BiometricSectionProps {
  fingerprintEnabled: boolean;
  onFingerprintToggle: (enabled: boolean) => void;
}

const BiometricSection: React.FC<BiometricSectionProps> = ({
  fingerprintEnabled,
  onFingerprintToggle
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleFingerprintToggle = async (enabled: boolean) => {
    if (enabled) {
      if (!window.PublicKeyCredential) {
        toast({
          title: "Ei tuettu",
          description: "Sormenjälkitunnistus ei ole tuettu tässä selaimessa",
          variant: "destructive"
        });
        return;
      }
      
      try {
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
          onFingerprintToggle(true);
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
      onFingerprintToggle(false);
      toast({
        title: "Sormenjälki pois käytöstä",
        description: "Sormenjälkitunnistus on poistettu käytöstä",
      });
    }
  };

  return (
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
  );
};

export default BiometricSection;
