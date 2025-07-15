
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Cookie } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('privacy_security')}</h1>
      </div>

      {/* Privacy Policy */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield size={20} />
            <span>{t('privacy_policy')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white/80 space-y-3">
          <p>{t('app_stores_data_locally')}</p>
          <p>{t('only_essential_cookies')}</p>
        </CardContent>
      </Card>

      {/* Data Collection */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Database size={20} />
            <span>{t('data_collection')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('analytics')}</div>
              <div className="text-sm text-white/70">{t('usage_data_collection')}</div>
            </div>
            <Switch defaultChecked={false} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('error_reports')}</div>
              <div className="text-sm text-white/70">{t('automatic_error_reports')}</div>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
      </Card>

      {/* Visibility Settings */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Eye size={20} />
            <span>{t('visibility_settings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('hide_balances')}</div>
              <div className="text-sm text-white/70">{t('hide_balances_background')}</div>
            </div>
            <Switch defaultChecked={false} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('screenshot_protection')}</div>
              <div className="text-sm text-white/70">{t('prevent_screenshots')}</div>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
