import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, SegmentedButtons, FAB } from 'react-native-paper';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccounts } from '../../hooks/useAccounts';
import { YearSummary } from '../../components/YearSummary';
import { AccountCard } from '../../components/AccountCard';
import { calculateBalance } from '../../utils/money';

export const DashboardScreen: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  const years = Array.from(
    new Set(transactions.map(tx => tx.date.getFullYear()))
  ).sort((a, b) => b - a);

  const currentYearTransactions = transactions.filter(
    tx => tx.date.getFullYear() === selectedYear
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
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
              <AccountCard
                key={account.id}
                account={account}
                balance={calculateBalance(transactions, account.id)}
                onPress={() => {/* Navigate to account details */}}
                onEdit={() => {/* Navigate to edit account */}}
              />
            ))}
          </Card.Content>
        </Card>

        <View style={styles.recentTransactions}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Transactions
          </Text>
          {transactions.slice(0, 5).map(transaction => {
            const account = accounts.find(a => a.id === transaction.accountId);
            return (
              <Card key={transaction.id} style={styles.transactionCard}>
                <Card.Content>
                  <View style={styles.transactionRow}>
                    <View style={styles.transactionInfo}>
                      <Text variant="titleMedium">{transaction.description}</Text>
                      <Text variant="bodySmall">{account?.name}</Text>
                    </View>
                    <Text variant="titleMedium" style={styles.transactionAmount}>
                      {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Navigate to add transaction */}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '600',
  },
  yearSelector: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  accountsCard: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  recentTransactions: {
    margin: 16,
  },
  transactionCard: {
    marginBottom: 8,
    elevation: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
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