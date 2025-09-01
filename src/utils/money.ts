export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatAmount = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${formatCurrency(absAmount)}`;
};

export const parseAmount = (value: string): number => {
  // Remove currency symbols and parse
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

export const calculateBalance = (transactions: any[], accountId: string): number => {
  return transactions
    .filter(tx => tx.accountId === accountId)
    .reduce((sum, tx) => sum + tx.amount, 0);
};