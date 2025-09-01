import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons, useTheme } from 'react-native-paper';
import { VictoryPie, VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';

export default function ReportsScreen(): JSX.Element {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const theme = useTheme();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  // Filter transactions by period
  const getFilteredTransactions = () => {
    const now = new Date();
    const filtered = transactions.filter(tx => {
      const txDate = new Date(tx.date);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text variant="headlineMedium" style={styles.title}>
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

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.summaryTitle}>
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="bodyMedium" style={styles.label}>
                Income
              </Text>
              <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.primary }]}>
                ₺{totalIncome.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text variant="bodyMedium" style={styles.label}>
                Expenses
              </Text>
              <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.error }]}>
                ₺{totalExpenses.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text variant="bodyMedium" style={styles.label}>
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
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Spending by Category
            </Text>
            <View style={styles.chartContainer}>
              <VictoryPie
                data={categoryData}
                colorScale="qualitative"
                width={300}
                height={300}
                innerRadius={50}
                labelRadius={({ innerRadius }) => innerRadius + 35}
                style={{
                  labels: {
                    fill: theme.colors.onSurface,
                    fontSize: 12,
                    fontWeight: 'bold',
                  },
                }}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {accountData.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Spending by Account
            </Text>
            <View style={styles.chartContainer}>
              <VictoryChart
                theme={VictoryTheme.material}
                width={350}
                height={250}
                domainPadding={20}
              >
                <VictoryAxis
                  tickFormat={(t) => t.length > 10 ? t.substring(0, 10) + '...' : t}
                  style={{
                    tickLabels: { fontSize: 10, angle: -45 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t) => `₺${t.toLocaleString()}`}
                  style={{
                    tickLabels: { fontSize: 10 },
                  }}
                />
                <VictoryBar
                  data={accountData}
                  style={{
                    data: {
                      fill: theme.colors.primary,
                    },
                  }}
                />
              </VictoryChart>
            </View>
          </Card.Content>
        </Card>
      )}

      {filteredTransactions.length === 0 && (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.emptyText}>
              No transactions found for the selected period
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 24,
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
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
