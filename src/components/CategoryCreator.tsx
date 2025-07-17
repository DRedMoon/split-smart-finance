import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getAllCategories, 
  addCategory, 
  deleteCategory as deleteCategoryService, 
  Category 
} from '@/services/categoryService';

const CategoryCreator = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isMaintenanceCharge: false,
    isHousingCompanyExpenditure: false,
    isMonthlyPayment: false,
    requiresDueDate: false,
    color: '#294D73'
  });

  // Load existing categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const allCategories = getAllCategories();
    setCategories(allCategories);
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: t('error'),
        description: t('category_name_required'),
        variant: "destructive"
      });
      return;
    }

    const categoryToAdd = {
      ...newCategory,
      englishKey: newCategory.name.toLowerCase().replace(/\s+/g, '_')
    };

    addCategory(categoryToAdd);
    loadCategories();
    
    setNewCategory({
      name: '',
      description: '',
      isMaintenanceCharge: false,
      isHousingCompanyExpenditure: false,
      isMonthlyPayment: false,
      requiresDueDate: false,
      color: '#294D73'
    });

    toast({
      title: t('category_created'),
      description: `${t('category')} "${categoryToAdd.name}" ${t('created_successfully')}`,
    });
  };

  const handleDeleteCategory = (categoryId: number, categoryName: string) => {
    if (confirm(`${t('confirm_delete_category')} "${categoryName}"?`)) {
      deleteCategoryService(categoryId);
      loadCategories();
      
      toast({
        title: t('category_deleted'),
        description: `${t('category')} "${categoryName}" ${t('deleted_successfully')}`,
      });
    }
  };

  const colorOptions = [
    '#294D73', '#2563eb', '#dc2626', '#16a34a', 
    '#ca8a04', '#9333ea', '#c2410c', '#0891b2'
  ];

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/add')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('create_edit_category')}</h1>
      </div>

      {/* Existing Categories */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('existing_categories')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-white/70 text-center py-4">{t('no_categories')}</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="text-white font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-white/70 text-sm">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/edit-category/${category.id}`)}
                      className="text-white hover:bg-white/10"
                    >
                      <Edit size={16} />
                    </Button>
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Category flags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {category.isMaintenanceCharge && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {t('maintenance_charge')}
                    </span>
                  )}
                  {category.isHousingCompanyExpenditure && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {t('housing_company_expenditure')}
                    </span>
                  )}
                  {category.isMonthlyPayment && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      {t('monthly_payment')}
                    </span>
                  )}
                  {category.requiresDueDate && (
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                      {t('due_date_required_short')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Create New Category */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('create_new_category')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">{t('category_name')}</Label>
            <Input
              id="name"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder={t('enter_category_name')}
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white">{t('description')} ({t('optional')})</Label>
            <Textarea
              id="description"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
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
                    newCategory.color === color ? 'border-white' : 'border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewCategory(prev => ({ ...prev, color }))}
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
                checked={newCategory.isMaintenanceCharge}
                onCheckedChange={(checked) => 
                  setNewCategory(prev => ({ ...prev, isMaintenanceCharge: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="font-medium">{t('housing_company_expenditure')}</div>
                <div className="text-sm text-white/70">{t('housing_company_expenditure_description')}</div>
              </div>
              <Switch 
                checked={newCategory.isHousingCompanyExpenditure}
                onCheckedChange={(checked) => 
                  setNewCategory(prev => ({ ...prev, isHousingCompanyExpenditure: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="font-medium">{t('monthly_payment')}</div>
                <div className="text-sm text-white/70">{t('monthly_payment_description')}</div>
              </div>
              <Switch 
                checked={newCategory.isMonthlyPayment}
                onCheckedChange={(checked) => 
                  setNewCategory(prev => ({ ...prev, isMonthlyPayment: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="font-medium">{t('due_date_required_short')}</div>
                <div className="text-sm text-white/70">{t('show_due_date_picker')}</div>
              </div>
              <Switch 
                checked={newCategory.requiresDueDate}
                onCheckedChange={(checked) => 
                  setNewCategory(prev => ({ ...prev, requiresDueDate: checked }))
                }
              />
            </div>
          </div>
          
          <Button onClick={handleCreateCategory} className="w-full bg-white text-[#294D73]">
            <Plus size={16} className="mr-2" />
            {t('create_category')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryCreator;
