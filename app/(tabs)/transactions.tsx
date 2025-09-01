import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Searchbar, FAB, SegmentedButtons, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';

export default function TransactionsScreen(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filters = {
    searchQuery: searchQuery || undefined,
    type: filterType === 'all' ? undefined : (filterType as 'income' | 'expense'),
  };

  const { transactions, loading } = useTransactions(filters);
  const { accounts } = useAccounts();

  const renderTransaction = ({ item }: { item: any }) => {
    const account = accounts.find(a => a.id === item.accountId);
    return (
      <Card
        style={styles.transactionCard}
        onPress={() => router.push(`/transactions/${item.id}`)}
      >
        <Card.Content>
          <View style={styles.transactionRow}>
            <View style={styles.transactionInfo}>
              <Text variant="titleMedium" style={styles.transactionDescription}>
                {item.description || 'No description'}
              </Text>
              <Text variant="bodySmall" style={styles.transactionMeta}>
                {item.date.toLocaleDateString()} • {account?.name || 'Unknown Account'} • {item.category || 'No category'}
              </Text>
            </View>
            <Text variant="titleMedium" style={[
              styles.transactionAmount,
              { color: item.amount >= 0 ? '#006D77' : '#D32F2F' }
            ]}>
              {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Transactions
      </Text>

      <Searchbar
        placeholder="Search transactions..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <SegmentedButtons
        value={filterType}
        onValueChange={setFilterType}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
        ]}
        style={styles.filterButtons}
      />

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

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
  title: {
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 24,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.025,
  },
  searchbar: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  filterButtons: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  transactionCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 12,
    color: '#6b7280',
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