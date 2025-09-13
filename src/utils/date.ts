import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, addMonths } from 'date-fns';

export const formatDate = (date: Date | undefined | null): string => {
  if (!date) return 'Invalid Date';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatShortDate = (date: Date | undefined | null): string => {
  if (!date) return '--';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '--';
  return format(dateObj, 'MMM dd');
};

export const getMonthRange = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const getYearRange = (year: number) => {
  const date = new Date(year, 0, 1);
  return {
    start: startOfYear(date),
    end: endOfYear(date),
  };
};

export const getNextDueDate = (lastDueDate: Date | undefined | null): Date => {
  if (!lastDueDate) return new Date();
  const dateObj = lastDueDate instanceof Date ? lastDueDate : new Date(lastDueDate);
  if (isNaN(dateObj.getTime())) return new Date();
  return addMonths(dateObj, 1);
};