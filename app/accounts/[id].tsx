import React from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Text, Card, Chip, Button, FAB, useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useTransactions } from '../../src/hooks/useTransactions';
import { formatCurrency } from '../../src/utils/money';
import { formatDate } from '../../src/utils/date';

export default function AccountDetailsScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  const account = accounts.find(a => a.id === id);
  const accountTransactions = transactions.filter(t => t.accountId === id);

  if (!account) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Account Not Found
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  const totalIncome = accountTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = Math.abs(accountTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));

  const renderTransaction = ({ item }: { item: any }) => (
    <Card
      style={styles.transactionCard}
      onPress={() => router.push(`/transactions/${item.id}`)}
    >
      <Card.Content>
        <View style={styles.transactionRow}>
          <View style={styles.transactionInfo}>
            <Text variant="titleMedium">
              {item.description || 'No description'}
            </Text>
            <Text variant="bodySmall" style={styles.transactionMeta}>
              {formatDate(item.date)} • {item.category || 'No category'}
            </Text>
          </View>
          <Text variant="titleMedium" style={[
            styles.transactionAmount,
            { color: item.amount >= 0 ? theme.colors.primary : theme.colors.error }
          ]}>
            {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text variant="headlineMedium" style={styles.title}>
          Account Details
        </Text>

        <Card style={styles.accountCard}>
          <Card.Content>
            <View style={styles.accountHeader}>
              <View style={styles.accountInfo}>
                <Text variant="headlineMedium" style={styles.accountName}>
                  {account.name}
                </Text>
                <Text variant="bodyLarge" style={styles.currency}>
                  {account.currency}
                </Text>
              </View>
              <Chip mode="outlined" style={[styles.accountTypeChip, { borderColor: account.color || '#2196F3' }]}>
                Active
              </Chip>
            </View>

            <Text variant="displaySmall" style={[styles.balance, { color: theme.colors.primary }]}>
              {formatCurrency(accountTransactions.reduce((sum, tx) => sum + tx.amount, 0))}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="bodyMedium" style={styles.statLabel}>Income</Text>
                <Text variant="titleLarge" style={[styles.statValue, { color: theme.colors.primary }]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodyMedium" style={styles.statLabel}>Expenses</Text>
                <Text variant="titleLarge" style={[styles.statValue, { color: theme.colors.error }]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>
            </View>

            <View style={styles.accountDetails}>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Color:</Text>
                <View style={[styles.colorIndicator, { backgroundColor: account.color || '#2196F3' }]} />
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Icon:</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{account.icon || 'wallet'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Created:</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {formatDate(account.createdAt)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Last Updated:</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {formatDate(account.updatedAt)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleLarge" style={styles.transactionsTitle}>
          Recent Transactions ({accountTransactions.length})
        </Text>

        {accountTransactions.length > 0 ? (
          <FlatList
            data={accountTransactions.slice(0, 10)}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            scrollEnabled={false}
            style={styles.transactionsList}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No transactions yet
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="pencil"
        style={styles.fab}
        onPress={() => router.push(`/accounts/${id}/edit`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  accountCard: {
    elevation: 2,
    marginBottom: 24,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  currency: {
    opacity: 0.7,
  },
  accountTypeChip: {
    borderWidth: 2,
  },
  balance: {
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '600',
  },
  accountDetails: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  detailLabel: {
    fontWeight: '500',
  },
  detailValue: {
    opacity: 0.8,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  transactionsTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  transactionsList: {
    marginBottom: 80,
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
  transactionMeta: {
    opacity: 0.7,
    marginTop: 2,
  },
  transactionAmount: {
    fontWeight: '600',
  },
  emptyCard: {
    elevation: 1,
    marginBottom: 80,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
