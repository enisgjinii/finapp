import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Searchbar, FAB, SegmentedButtons } from 'react-native-paper';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccounts } from '../../hooks/useAccounts';
import { TransactionItem } from '../../components/TransactionItem';

export const TransactionsListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const filters = {
    searchQuery: searchQuery || undefined,
    type: filterType === 'all' ? undefined : (filterType as 'income' | 'expense'),
  };

  const { transactions, loading } = useTransactions(filters);
  const { accounts } = useAccounts();

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
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const account = accounts.find(a => a.id === item.accountId);
          return (
            <TransactionItem
              transaction={item}
              account={account}
              onPress={() => {/* Navigate to transaction details */}}
            />
          );
        }}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

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
  title: {
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '600',
  },
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});