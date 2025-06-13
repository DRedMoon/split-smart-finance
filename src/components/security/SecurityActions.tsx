
import React from 'react';
import { Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SecurityActions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordChange = () => {
    toast({
      title: "Tulossa pian",
      description: "Salasanan vaihto -toiminto tulossa seuraavassa päivityksessä",
    });
  };

  const handleSecurityCheck = () => {
    const checks = [];
    if (localStorage.getItem('app-pin')) checks.push("PIN-koodi käytössä");
    if (localStorage.getItem('fingerprint-enabled') === 'true') checks.push("Sormenjälki käytössä");
    if (localStorage.getItem('2fa-enabled') === 'true') checks.push("2FA käytössä");
    
    toast({
      title: "Turvallisuustarkistus",
      description: checks.length > 0 ? checks.join(", ") : "Ei turvallisuustoimia käytössä",
    });
  };

  return (
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
  );
};

export default SecurityActions;
