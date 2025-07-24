
import React from 'react';
import { Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

const SecurityActions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useSafeLanguage();

  const handlePasswordChange = () => {
    toast({
      title: t('coming_soon'),
      description: t('password_change_coming'),
    });
  };

  const handleSecurityCheck = () => {
    const checks = [];
    if (localStorage.getItem('app-pin')) checks.push(t('pin_active'));
    if (localStorage.getItem('fingerprint-enabled') === 'true') checks.push(t('fingerprint_active'));
    if (localStorage.getItem('2fa-enabled') === 'true') checks.push(t('two_factor_active'));
    
    toast({
      title: t('security_check'),
      description: checks.length > 0 ? checks.join(", ") : t('no_security_features'),
    });
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Key size={20} />
          <span>{t('security_actions')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          onClick={handlePasswordChange}
          className="w-full justify-start text-white border-white/30 hover:bg-white/10"
        >
          {t('change_password')}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleSecurityCheck}
          className="w-full justify-start text-white border-white/30 hover:bg-white/10"
        >
          {t('check_security')}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/data-management')}
          className="w-full justify-start text-red-400 border-red-400/30 hover:bg-red-500/10"
        >
          {t('manage_data')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecurityActions;
