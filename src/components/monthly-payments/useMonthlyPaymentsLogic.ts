
import { usePaymentDataProcessor } from './usePaymentDataProcessor';
import { usePaymentToggleHandler } from './usePaymentToggleHandler';

export const useMonthlyPaymentsLogic = (financialData: any, setFinancialData: any, toast: any) => {
  const { processPaymentData } = usePaymentDataProcessor(financialData);
  const { handleTogglePaid } = usePaymentToggleHandler(financialData, setFinancialData, toast);

  return {
    processPaymentData,
    handleTogglePaid
  };
};
