import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';

export default function ReportsScreen(): React.JSX.Element {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const theme = useTheme();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  // Filter transactions by period
  const getFilteredTransactions = () => {
    const now = new Date();
    const filtered = transactions.filter(tx => {
      if (!tx.date) return false;
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return txDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return txDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return txDate >= yearAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const spending = filteredTransactions.filter(tx => tx.amount < 0);
    const categoryMap = new Map<string, number>();
    
    spending.forEach(tx => {
      const category = tx.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(tx.amount));
    });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      x: category,
      y: amount,
    }));
  };

  // Calculate spending by account
  const getSpendingByAccount = () => {
    const spending = filteredTransactions.filter(tx => tx.amount < 0);
    const accountMap = new Map<string, number>();
    
    spending.forEach(tx => {
      const account = accounts.find(a => a.id === tx.accountId);
      const accountName = account?.name || 'Unknown Account';
      accountMap.set(accountName, (accountMap.get(accountName) || 0) + Math.abs(tx.amount));
    });

    return Array.from(accountMap.entries()).map(([account, amount]) => ({
      x: account,
      y: amount,
    }));
  };

  const categoryData = getSpendingByCategory();
  const accountData = getSpendingByAccount();

  const totalIncome = filteredTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = Math.abs(filteredTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));

  const netIncome = totalIncome - totalExpenses;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Reports & Analytics
        </Text>

      <SegmentedButtons
        value={selectedPeriod}
        onValueChange={setSelectedPeriod}
        buttons={[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
        style={styles.periodSelector}
      />

      <Card style={[styles.summaryCard, {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.outline
      }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Summary
          </Text>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryItem, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                Income
              </Text>
              <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.primary }]}>
                ₺{totalIncome.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.summaryItem, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                Expenses
              </Text>
              <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.error }]}>
                ₺{totalExpenses.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.summaryItem, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                Net
              </Text>
              <Text variant="titleLarge" style={[styles.amount, { color: netIncome >= 0 ? theme.colors.primary : theme.colors.error }]}>
                ₺{netIncome.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {categoryData.length > 0 && (
        <Card style={[styles.chartCard, {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline
        }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
              Spending by Category
            </Text>
            <View style={[styles.chartContainer, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                Chart visualization coming soon
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                Categories: {categoryData.map(cat => cat.x).join(', ')}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {accountData.length > 0 && (
        <Card style={[styles.chartCard, {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline
        }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.chartTitle, { color: theme.colors.onSurface }]}>
              Spending by Account
            </Text>
            <View style={[styles.chartContainer, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                Bar chart visualization coming soon
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                Accounts: {accountData.map(acc => acc.x).join(', ')}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {filteredTransactions.length === 0 && (
        <Card style={[styles.emptyCard, {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline
        }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No transactions found for the selected period
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 24,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.025,
  },
  periodSelector: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 18,
    fontWeight: '600',
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
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
