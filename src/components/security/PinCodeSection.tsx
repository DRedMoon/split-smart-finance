
import React from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface PinCodeSectionProps {
  pin: string;
  pinEnabled: boolean;
  onPinChange: (pin: string) => void;
  onPinToggle: (enabled: boolean) => void;
}

const PinCodeSection: React.FC<PinCodeSectionProps> = ({
  pin,
  pinEnabled,
  onPinChange,
  onPinToggle
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handlePinToggle = (enabled: boolean) => {
    if (enabled && pin.length !== 4) {
      toast({
        title: "Virhe",
        description: "PIN-koodin tulee olla 4 numeroa",
        variant: "destructive"
      });
      return;
    }
    
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
    
    onPinToggle(enabled);
  };

  return (
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
            onChange={(e) => onPinChange(e.target.value.replace(/\D/g, ''))}
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
  );
};

export default PinCodeSection;
