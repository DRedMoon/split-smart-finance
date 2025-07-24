import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useToast } from '@/hooks/use-toast';

interface PinVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  title: string;
  description: string;
}

const PinVerificationDialog = ({ isOpen, onClose, onVerified, title, description }: PinVerificationDialogProps) => {
  const { t } = useSafeLanguage();
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!pin) {
      toast({
        title: t('error'),
        description: t('please_enter_pin'),
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      const savedPin = localStorage.getItem('app-pin');
      
      if (savedPin === pin) {
        onVerified();
        onClose();
        setPin('');
        toast({
          title: t('verification_successful'),
          description: t('pin_verified_successfully')
        });
      } else {
        toast({
          title: t('verification_failed'),
          description: t('incorrect_pin'),
          variant: 'destructive'
        });
      }
      
      setIsVerifying(false);
    }, 500);
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
          
          <div>
            <Label htmlFor="verification-pin">{t('enter_current_pin')}</Label>
            <Input
              id="verification-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-2"
              placeholder="••••"
              maxLength={4}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isVerifying}>
            {t('cancel')}
          </Button>
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? t('verifying') : t('verify')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PinVerificationDialog;