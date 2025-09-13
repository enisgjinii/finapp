import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'EUR' | 'USD' | 'GBP';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  exchangeRate: number; // Rate to EUR (base currency)
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    exchangeRate: 1.0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    exchangeRate: 0.85, // Example rate: 1 USD = 0.85 EUR
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    exchangeRate: 1.15, // Example rate: 1 GBP = 1.15 EUR
  },
};

interface CurrencyContextType {
  primaryCurrency: Currency;
  setPrimaryCurrency: (currency: Currency) => void;
  getCurrencyInfo: (currency: Currency) => CurrencyInfo;
  convertToPrimary: (amount: number, fromCurrency: Currency) => number;
  convertFromPrimary: (amount: number, toCurrency: Currency) => number;
  formatCurrency: (amount: number, currency?: Currency) => string;
  formatAmount: (amount: number, currency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  primaryCurrency: 'EUR',
  setPrimaryCurrency: () => {},
  getCurrencyInfo: () => CURRENCIES.EUR,
  convertToPrimary: () => 0,
  convertFromPrimary: () => 0,
  formatCurrency: () => '',
  formatAmount: () => '',
});

export const useCurrency = () => useContext(CurrencyContext);

interface CurrencyProviderProps {
  children: React.ReactNode;
}

const CURRENCY_STORAGE_KEY = '@primary_currency';

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [primaryCurrency, setPrimaryCurrencyState] = useState<Currency>('EUR');

  // Load saved currency on app start
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        if (savedCurrency && ['EUR', 'USD', 'GBP'].includes(savedCurrency)) {
          setPrimaryCurrencyState(savedCurrency as Currency);
        }
      } catch (error) {
        console.error('Error loading currency:', error);
      }
    };
    loadCurrency();
  }, []);

  const setPrimaryCurrency = async (currency: Currency) => {
    try {
      setPrimaryCurrencyState(currency);
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const getCurrencyInfo = (currency: Currency): CurrencyInfo => {
    return CURRENCIES[currency];
  };

  const convertToPrimary = (amount: number, fromCurrency: Currency): number => {
    if (fromCurrency === primaryCurrency) return amount;
    const fromInfo = CURRENCIES[fromCurrency];
    const primaryInfo = CURRENCIES[primaryCurrency];
    
    // Convert to EUR first, then to primary currency
    const amountInEUR = amount * fromInfo.exchangeRate;
    return amountInEUR / primaryInfo.exchangeRate;
  };

  const convertFromPrimary = (amount: number, toCurrency: Currency): number => {
    if (toCurrency === primaryCurrency) return amount;
    const primaryInfo = CURRENCIES[primaryCurrency];
    const toInfo = CURRENCIES[toCurrency];
    
    // Convert to EUR first, then to target currency
    const amountInEUR = amount * primaryInfo.exchangeRate;
    return amountInEUR / toInfo.exchangeRate;
  };

  const formatCurrency = (amount: number, currency: Currency = primaryCurrency): string => {
    const currencyInfo = CURRENCIES[currency];
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatAmount = (amount: number, currency: Currency = primaryCurrency): string => {
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? '' : '-';
    return `${sign}${formatCurrency(absAmount, currency)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        primaryCurrency,
        setPrimaryCurrency,
        getCurrencyInfo,
        convertToPrimary,
        convertFromPrimary,
        formatCurrency,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
