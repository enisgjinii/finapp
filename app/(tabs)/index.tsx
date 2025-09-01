import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, SegmentedButtons, FAB, useTheme } from 'react-native-paper';

const mockAccounts = [
  { id: '1', name: 'TEB', currency: 'TRY', color: '#E3F2FD', balance: 15420.50 },
  { id: '2', name: 'Paysera', currency: 'EUR', color: '#E8F5E8', balance: 2845.30 },
  { id: '3', name: 'OneFor', currency: 'USD', color: '#FFF3E0', balance: 1250.00 },
  { id: '4', name: 'PayPal', currency: 'USD', color: '#E1F5FE', balance: 840.20 },
  { id: '5', name: 'Cash', currency: 'TRY', color: '#F3E5F5', balance: 560.00 },
];

const mockTransactions = [
  { id: '1', description: 'Salary Payment', amount: 8500, account: 'TEB', date: '2025-01-15' },
  { id: '2', description: 'Grocery Shopping', amount: -245, account: 'Cash', date: '2025-01-14' },
  { id: '3', description: 'Freelance Payment', amount: 1200, account: 'PayPal', date: '2025-01-13' },
  { id: '4', description: 'Rent Payment', amount: -2500, account: 'TEB', date: '2025-01-12' },
];

export default function DashboardScreen() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const theme = useTheme();

  const totalIncome = 9700;
  const totalExpenses = 2745;
  const netIncome = totalIncome - totalExpenses;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={styles.title}>
          Dashboard
        </Text>

        <SegmentedButtons
          value={selectedYear}
          onValueChange={setSelectedYear}
          buttons={[
            { value: '2023', label: '2023' },
            { value: '2024', label: '2024' },
            { value: '2025', label: '2025' },
          ]}
          style={styles.yearSelector}
        />

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

        <Card style={styles.accountsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Account Balances
            </Text>
            
            {mockAccounts.map(account => (
              <Card key={account.id} style={[styles.accountCard, { backgroundColor: account.color }]}>
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
                    <Text variant="titleLarge" style={[styles.balance, { color: account.balance >= 0 ? theme.colors.primary : theme.colors.error }]}>
                      {account.currency === 'TRY' ? '₺' : account.currency === 'EUR' ? '€' : '$'}{account.balance.toLocaleString()}
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
            
            {mockTransactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={styles.transactionInfo}>
                  <Text variant="titleMedium">{transaction.description}</Text>
                  <Text variant="bodySmall" style={styles.transactionMeta}>
                    {transaction.date} • {transaction.account}
                  </Text>
                </View>
                <Text variant="titleMedium" style={[
                  styles.transactionAmount,
                  { color: transaction.amount >= 0 ? theme.colors.primary : theme.colors.error }
                ]}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Navigate to add transaction */}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    fontWeight: '600',
  },
  yearSelector: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    margin: 16,
    elevation: 2,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 20,
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
  accountsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  accountCard: {
    marginBottom: 12,
    elevation: 1,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontWeight: '600',
  },
  currency: {
    opacity: 0.7,
    marginTop: 2,
  },
  balance: {
    fontWeight: '700',
  },
  recentCard: {
    marginHorizontal: 16,
    marginBottom: 80,
    elevation: 2,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMeta: {
    opacity: 0.7,
    marginTop: 2,
  },
  transactionAmount: {
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});