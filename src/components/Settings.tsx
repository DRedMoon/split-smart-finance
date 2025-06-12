
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Download, HelpCircle, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const navigate = useNavigate();

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile", action: () => console.log('Profile') },
        { icon: Bell, label: "Notifications", hasSwitch: true },
        { icon: Shield, label: "Privacy & Security", action: () => console.log('Privacy') }
      ]
    },
    {
      title: "Data",
      items: [
        { icon: Download, label: "Export Data", action: () => console.log('Export') },
        { label: "Backup Settings", hasSwitch: true }
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & FAQ", action: () => console.log('Help') },
        { label: "Contact Support", action: () => console.log('Contact') }
      ]
    }
  ];

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User size={32} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">John Doe</h3>
              <p className="text-muted-foreground">john.doe@example.com</p>
              <div className="flex space-x-4 mt-2 text-sm">
                <span className="text-green-600">Balance: $2,450.75</span>
                <span className="text-red-600">Debts: $12,500</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      {item.icon && <item.icon size={20} className="text-muted-foreground" />}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.hasSwitch ? (
                      <Switch />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.action}
                        className="text-muted-foreground"
                      >
                        →
                      </Button>
                    )}
                  </div>
                  {itemIndex < group.items.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logout Button */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>Bill Splitter Pro</p>
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
