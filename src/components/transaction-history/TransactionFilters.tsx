
import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

const TransactionFilters = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  dateRange,
  onDateRangeChange
}: TransactionFiltersProps) => {
  const { t } = useSafeLanguage();

  const handleQuickDateRange = (range: string) => {
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        return;
    }
    
    onDateRangeChange({
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
        <Input
          placeholder={t('search_transactions')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-[#294D73] border-white/20 text-white placeholder:text-white/50"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="bg-[#294D73] border-white/20 text-white">
            <SelectValue placeholder={t('filter_by_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_transactions')}</SelectItem>
            <SelectItem value="expense">{t('expenses')}</SelectItem>
            <SelectItem value="income">{t('income')}</SelectItem>
            <SelectItem value="loan">{t('loans_credits')}</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleQuickDateRange}>
          <SelectTrigger className="bg-[#294D73] border-white/20 text-white">
            <SelectValue placeholder={t('date_range')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t('last_week')}</SelectItem>
            <SelectItem value="month">{t('last_month')}</SelectItem>
            <SelectItem value="quarter">{t('last_quarter')}</SelectItem>
            <SelectItem value="year">{t('last_year')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-white text-sm mb-1 block">{t('from_date')}</label>
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="bg-[#294D73] border-white/20 text-white"
          />
        </div>
        <div>
          <label className="text-white text-sm mb-1 block">{t('to_date')}</label>
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="bg-[#294D73] border-white/20 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
