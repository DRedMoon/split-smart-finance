
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: ''
  });

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.profile) {
      setProfile(data.profile);
    }
  }, []);

  const handleSave = () => {
    const data = loadFinancialData();
    if (data) {
      data.profile = profile;
      saveFinancialData(data);
      toast({
        title: "Profiili päivitetty",
        description: "Profiilitiedot on tallennettu onnistuneesti",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfile(prev => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Profiiliasetukset</h1>
      </div>

      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">Profiilitiedot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-white" />
              )}
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Camera size={16} className="mr-2" />
              Vaihda kuva
            </Button>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-white">Nimi</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="Syötä nimesi"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-white">Sähköposti</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="Syötä sähköpostiosoitteesi"
            />
          </div>

          <Button onClick={handleSave} className="w-full bg-white text-[#294D73]">
            Tallenna muutokset
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
