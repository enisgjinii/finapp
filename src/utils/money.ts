import { Currency } from '../providers/CurrencyProvider';

// Legacy functions for backward compatibility
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  const currencyCode = currency as Currency;
  const locale = currencyCode === 'EUR' ? 'de-DE' : 
                 currencyCode === 'USD' ? 'en-US' : 'en-GB';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatAmount = (amount: number, currency: string = 'EUR'): string => {
  const absAmount = Math.abs(amount);
  const sign = amount >= 0 ? '' : '-';
  return `${sign}${formatCurrency(absAmount, currency)}`;
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

// Currency conversion utilities
export const convertCurrency = (
  amount: number, 
  fromCurrency: Currency, 
  toCurrency: Currency
): number => {
  const exchangeRates: Record<Currency, number> = {
    EUR: 1.0,
    USD: 0.85, // 1 USD = 0.85 EUR
    GBP: 1.15, // 1 GBP = 1.15 EUR
  };

  // Convert to EUR first, then to target currency
  const amountInEUR = amount * exchangeRates[fromCurrency];
  return amountInEUR / exchangeRates[toCurrency];
};

// Get currency symbol
export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  };
  return symbols[currency];
};

// Get currency locale
export const getCurrencyLocale = (currency: Currency): string => {
  const locales: Record<Currency, string> = {
    EUR: 'de-DE',
    USD: 'en-US',
    GBP: 'en-GB',
  };
  return locales[currency];
};