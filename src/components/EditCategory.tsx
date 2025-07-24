
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, updateCategory, deleteCategory } from '@/services/storageService';

const EditCategory = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useSafeLanguage();
  const { toast } = useToast();
  
  const [category, setCategory] = useState({
    id: 0,
    name: '',
    description: '',
    isMaintenanceCharge: false,
    isHousingCompanyExpenditure: false,
    isMonthlyPayment: false,
    requiresDueDate: false,
    color: '#294D73',
    createdAt: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (categoryId) {
      const data = loadFinancialData();
      if (data?.categories) {
        const existingCategory = data.categories.find(cat => cat.id === parseInt(categoryId));
        if (existingCategory) {
          setCategory({
            ...existingCategory,
            requiresDueDate: existingCategory.requiresDueDate || false
          });
        } else {
          toast({
            title: t('error'),
            description: 'Category not found',
            variant: "destructive"
          });
          navigate('/categories');
        }
      }
    }
  }, [categoryId, navigate, t, toast]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!category.name.trim()) {
      newErrors.name = t('category_name_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    try {
      updateCategory(category.id, category);
      
      toast({
        title: t('success'),
        description: `${t('category')} "${category.name}" ${t('updated_successfully')}`,
      });
      
      navigate('/categories');
    } catch (error) {
      toast({
        title: t('error'),
        description: 'Failed to update category',
        variant: "destructive"
      });
    }
  };

  const handleDelete = () => {
    if (confirm(`${t('confirm_delete_category')} "${category.name}"?`)) {
      try {
        deleteCategory(category.id);
        
        toast({
          title: t('success'),
          description: `${t('category')} "${category.name}" ${t('deleted_successfully')}`,
        });
        
        navigate('/categories');
      } catch (error) {
        toast({
          title: t('error'),
          description: 'Failed to delete category',
          variant: "destructive"
        });
      }
    }
  };

  const colorOptions = [
    '#294D73', '#2563eb', '#dc2626', '#16a34a', 
    '#ca8a04', '#9333ea', '#c2410c', '#0891b2'
  ];

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/categories')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('edit_category')}</h1>
      </div>

      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('category_details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">{t('category_name')}</Label>
            <Input
              id="name"
              value={category.name}
              onChange={(e) => {
                setCategory(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              className={`bg-white/10 border-white/20 text-white mt-2 ${errors.name ? 'border-red-500' : ''}`}
              placeholder={t('enter_category_name')}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white">{t('description')} ({t('optional')})</Label>
            <Textarea
              id="description"
              value={category.description}
              onChange={(e) => setCategory(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder={t('category_description_placeholder')}
            />
          </div>
          
          <div>
            <Label className="text-white">{t('category_color')}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    category.color === color ? 'border-white' : 'border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCategory(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="font-medium">{t('maintenance_charge')}</div>
                <div className="text-sm text-white/70">{t('maintenance_charge_description')}</div>
              </div>
              <Switch 
                checked={category.isMaintenanceCharge}
                onCheckedChange={(checked) => 
                  setCategory(prev => ({ ...prev, isMaintenanceCharge: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="font-medium">{t('housing_company_expenditure')}</div>
                <div className="text-sm text-white/70">{t('housing_company_expenditure_description')}</div>
              </div>
              <Switch 
                checked={category.isHousingCompanyExpenditure}
                onCheckedChange={(checked) => 
                  setCategory(prev => ({ ...prev, isHousingCompanyExpenditure: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="font-medium">{t('monthly_payment')}</div>
                <div className="text-sm text-white/70">{t('monthly_payment_description')}</div>
              </div>
              <Switch 
                checked={category.isMonthlyPayment}
                onCheckedChange={(checked) => 
                  setCategory(prev => ({ ...prev, isMonthlyPayment: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="font-medium">Requires Due Date</div>
                <div className="text-sm text-white/70">Show due date picker when using this category</div>
              </div>
              <Switch 
                checked={category.requiresDueDate}
                onCheckedChange={(checked) => 
                  setCategory(prev => ({ ...prev, requiresDueDate: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1 bg-white text-[#294D73]">
          <Save size={16} className="mr-2" />
          {t('save_changes')}
        </Button>
        <Button onClick={handleDelete} variant="destructive" className="flex-1">
          <Trash2 size={16} className="mr-2" />
          {t('delete_category')}
        </Button>
      </div>
    </div>
  );
};

export default EditCategory;
