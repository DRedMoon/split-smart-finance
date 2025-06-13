
export interface FinancialData {
  balance: number;
  loans: Array<{
    id: number;
    name: string;
    totalAmount: number;
    currentAmount: number;
    monthly: number;
    rate: number;
    remaining: string;
    dueDate: string;
    lastPayment: string;
  }>;
  monthlyBills: Array<{
    id: number;
    name: string;
    amount: number;
    dueDate: string;
    type: string;
    paid?: boolean;
  }>;
  transactions: Array<{
    id: number;
    name: string;
    amount: number;
    date: string;
    type: string;
    category: string;
  }>;
}

const STORAGE_KEY = 'financial-data';

export const saveFinancialData = (data: FinancialData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving financial data:', error);
  }
};

export const loadFinancialData = (): FinancialData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading financial data:', error);
    return null;
  }
};

export const exportFinancialData = (): void => {
  const data = loadFinancialData();
  if (data) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const getDefaultFinancialData = (): FinancialData => ({
  balance: 2450.75,
  loans: [
    { id: 1, name: 'Autolaina', totalAmount: 25000, currentAmount: 8500, monthly: 425, rate: 3.5, remaining: "24 kuukautta", dueDate: "15.", lastPayment: "2024-01-15" },
    { id: 2, name: 'Opintolaina', totalAmount: 15000, currentAmount: 4000, monthly: 180, rate: 4.2, remaining: "18 kuukautta", dueDate: "1.", lastPayment: "2024-01-01" }
  ],
  monthlyBills: [
    { id: 1, name: "Vuokra", amount: 800, dueDate: "1.", type: "asuminen", paid: true },
    { id: 2, name: "Automaksu", amount: 425, dueDate: "15.", type: "laina", paid: false },
    { id: 3, name: "Luottokortti", amount: 250, dueDate: "20.", type: "luotto", paid: false },
    { id: 4, name: "Puhelin", amount: 65, dueDate: "28.", type: "lasku", paid: true },
    { id: 5, name: "Internet", amount: 50, dueDate: "10.", type: "lasku", paid: true },
    { id: 6, name: "Vakuutus", amount: 120, dueDate: "5.", type: "vakuutus", paid: true }
  ],
  transactions: [
    { id: 1, name: "Ruokakauppa", amount: -85.50, date: "2024-01-15", type: "kulu", category: "ruoka" },
    { id: 2, name: "Autolainan maksu", amount: -425.00, date: "2024-01-15", type: "laina", category: "laina" },
    { id: 3, name: "Palkan talletus", amount: 3200.00, date: "2024-01-14", type: "tulo", category: "palkka" },
    { id: 4, name: "Huoltoasema", amount: -45.20, date: "2024-01-13", type: "kulu", category: "liikenne" }
  ]
});
