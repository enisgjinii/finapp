import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, SegmentedButtons, FAB, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { YearSummary } from '../../src/components/YearSummary';
import { calculateBalance } from '../../src/utils/money';

export default function DashboardScreen(): JSX.Element {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const theme = useTheme();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  const years = Array.from(
    new Set(transactions.map(tx => tx.date.getFullYear()))
  ).sort((a, b) => b - a);

  const currentYearTransactions = transactions.filter(
    tx => tx.date.getFullYear() === selectedYear
  );

  const totalIncome = currentYearTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = Math.abs(currentYearTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));

  const netIncome = totalIncome - totalExpenses;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={styles.title}>
          Dashboard
        </Text>

        {years.length > 0 && (
          <SegmentedButtons
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
            buttons={years.slice(0, 3).map(year => ({
              value: year.toString(),
              label: year.toString(),
            }))}
            style={styles.yearSelector}
          />
        )}

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              {selectedYear} Financial Summary
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

        <YearSummary
          year={selectedYear}
          transactions={currentYearTransactions}
          currency="USD"
        />

        <Card style={styles.accountsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Account Balances
            </Text>
            
            {accounts.map(account => (
              <Card
                key={account.id}
                style={[styles.accountCard, { backgroundColor: account.color || '#E3F2FD' }]}
                onPress={() => router.push(`/accounts/${account.id}`)}
              >
                <Card.Content>
                  <View style={styles.accountRow}>
                    <View style={styles.accountInfo}>
                      <Text variant="titleMedium" style={styles.accountName}>
                        {account.name}
                      </Text>
                      <Text variant="bodySmall" style={styles.currency}>
                        {account.currency}
                      </Text>
                    </View>
                    <Text variant="titleLarge" style={[styles.balance, { color: calculateBalance(transactions, account.id) >= 0 ? theme.colors.primary : theme.colors.error }]}>
                      ${calculateBalance(transactions, account.id).toLocaleString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.recentCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Transactions
            </Text>
            
            {transactions.slice(0, 5).map(transaction => {
              const account = accounts.find(a => a.id === transaction.accountId);
              return (
                <View
                  key={transaction.id}
                  style={styles.transactionRow}
                  onTouchEnd={() => router.push(`/transactions/${transaction.id}`)}
                >
                  <View style={styles.transactionInfo}>
                    <Text variant="titleMedium">{transaction.description || 'No description'}</Text>
                    <Text variant="bodySmall" style={styles.transactionMeta}>
                      {transaction.date.toLocaleDateString()} • {account?.name || 'Unknown Account'}
                    </Text>
                  </View>
                  <Text variant="titleMedium" style={[
                    styles.transactionAmount,
                    { color: transaction.amount >= 0 ? theme.colors.primary : theme.colors.error }
                  ]}>
                    {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/transactions/add')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 24,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.025,
  },
  yearSelector: {
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
  accountsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  accountCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  currency: {
    fontSize: 12,
    color: '#6b7280',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  recentCard: {
    marginHorizontal: 20,
    marginBottom: 100,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    borderRadius: 12,
    width: 56,
    height: 56,
  },
});