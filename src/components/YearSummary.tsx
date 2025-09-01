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
        <Text style={styles.year}>
          {year} Summary
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>
              Income
            </Text>
            <Text style={[styles.amount, { color: '#000000' }]}>
              {formatCurrency(income, currency)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.label}>
              Expenses
            </Text>
            <Text style={[styles.amount, { color: '#ef4444' }]}>
              {formatCurrency(expenses, currency)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.label}>
              Net
            </Text>
            <Text style={[styles.amount, { color: net >= 0 ? '#000000' : '#ef4444' }]}>
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
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  year: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});