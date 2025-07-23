import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onHome?: () => void;
  showHomeButton?: boolean;
}

const ErrorState = ({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred. Please try again.", 
  onRetry,
  onHome,
  showHomeButton = true
}: ErrorStateProps) => {
  const { t } = useSafeLanguage();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="bg-[#294D73] border-none max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-white/70">{message}</p>
          
          <div className="flex flex-col space-y-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('retry')}
              </Button>
            )}
            
            {showHomeButton && onHome && (
              <Button
                onClick={onHome}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Home className="mr-2 h-4 w-4" />
                {t('home')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;