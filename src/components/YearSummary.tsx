import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/money';

interface YearSummaryProps {
  year: number;
  transactions: Transaction[];
  currency?: string;
}

export const YearSummary: React.FC<YearSummaryProps> = ({
  year,
  transactions,
  currency = 'USD',
}) => {
  const theme = useTheme();

  const yearTransactions = transactions.filter(
    tx => tx.date.getFullYear() === year
  );

  const income = yearTransactions
    .filter(tx => tx.amount >= 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = yearTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const net = income - expenses;
  const netColor = net >= 0 ? theme.colors.primary : theme.colors.error;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.year}>
          {year} Summary
        </Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text variant="bodyMedium" style={styles.label}>
              Income
            </Text>
            <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.primary }]}>
              {formatCurrency(income, currency)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text variant="bodyMedium" style={styles.label}>
              Expenses
            </Text>
            <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.error }]}>
              {formatCurrency(expenses, currency)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text variant="bodyMedium" style={styles.label}>
              Net
            </Text>
            <Text variant="titleLarge" style={[styles.amount, { color: netColor }]}>
              {formatCurrency(net, currency)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  year: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    opacity: 0.7,
    marginBottom: 4,
  },
  amount: {
    fontWeight: '700',
  },
});