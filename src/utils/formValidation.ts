
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateForm = (data: any, schema: ValidationSchema, t: (key: string) => string): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = t('field_required');
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return;

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = t('min_length_error').replace('{min}', rules.minLength.toString());
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = t('max_length_error').replace('{max}', rules.maxLength.toString());
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = t('invalid_format');
      }
    }

    // Number validations
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
      const numValue = Number(value);
      
      if (rules.min !== undefined && numValue < rules.min) {
        errors[field] = t('min_value_error').replace('{min}', rules.min.toString());
      }
      
      if (rules.max !== undefined && numValue > rules.max) {
        errors[field] = t('max_value_error').replace('{max}', rules.max.toString());
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return errors;
};

export const validateField = (value: any, rules: ValidationRule, t: (key: string) => string): string | null => {
  const errors = validateForm({ field: value }, { field: rules }, t);
  return errors.field || null;
};

// Common validation schemas
export const categorySchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  description: {
    maxLength: 200
  }
};

export const transactionSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  amount: {
    required: true,
    min: 0.01,
    max: 999999.99
  },
  category: {
    required: true
  }
};

export const loanSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  originalAmount: {
    required: true,
    min: 1,
    max: 9999999.99
  },
  currentAmount: {
    required: true,
    min: 0,
    max: 9999999.99
  },
  monthly: {
    required: true,
    min: 0.01,
    max: 99999.99
  }
};
