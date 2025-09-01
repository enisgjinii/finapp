import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, addMonths } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const formatShortDate = (date: Date): string => {
  return format(date, 'MMM dd');
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

export const getNextDueDate = (lastDueDate: Date): Date => {
  return addMonths(lastDueDate, 1);
};