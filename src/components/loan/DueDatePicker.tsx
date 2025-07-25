import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface DueDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const DueDatePicker = ({ value, onChange, label, placeholder }: DueDatePickerProps) => {
  const { t } = useSafeLanguage();
  const [date, setDate] = React.useState<Date | undefined>();

  const displayLabel = label || t('due_date');
  const displayPlaceholder = placeholder || t('select_day');

  // Convert string day to date for display
  React.useEffect(() => {
    if (value && value.match(/\d+/)) {
      const day = parseInt(value.match(/\d+/)?.[0] || '1');
      const today = new Date();
      setDate(new Date(today.getFullYear(), today.getMonth(), day));
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const day = selectedDate.getDate();
      onChange(day.toString());
      setDate(selectedDate);
    }
  };

  return (
    <div>
      <Label className="text-sidebar-foreground">{displayLabel}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent mt-2",
              !value && "text-sidebar-foreground/70"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? `${value}.` : <span>{displayPlaceholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DueDatePicker;