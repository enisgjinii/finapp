import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Searchbar, FAB, SegmentedButtons, Card } from 'react-native-paper';

const mockTransactions = [
  { id: '1', description: 'Salary Payment', amount: 8500, account: 'TEB', date: '2025-01-15', category: 'Salary' },
  { id: '2', description: 'Grocery Shopping', amount: -245, account: 'Cash', date: '2025-01-14', category: 'Food' },
  { id: '3', description: 'Freelance Payment', amount: 1200, account: 'PayPal', date: '2025-01-13', category: 'Freelance' },
  { id: '4', description: 'Rent Payment', amount: -2500, account: 'TEB', date: '2025-01-12', category: 'Housing' },
  { id: '5', description: 'Coffee Shop', amount: -45, account: 'Cash', date: '2025-01-11', category: 'Food' },
  { id: '6', description: 'Investment Return', amount: 350, account: 'OneFor', date: '2025-01-10', category: 'Investment' },
];

export default function TransactionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'income' && transaction.amount >= 0) ||
                       (filterType === 'expense' && transaction.amount < 0);

    return matchesSearch && matchesType;
  });

  const renderTransaction = ({ item }: { item: any }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionRow}>
          <View style={styles.transactionInfo}>
            <Text variant="titleMedium" style={styles.transactionDescription}>
              {item.description}
            </Text>
            <Text variant="bodySmall" style={styles.transactionMeta}>
              {item.date} • {item.account} • {item.category}
            </Text>
          </View>
          <Text variant="titleMedium" style={[
            styles.transactionAmount,
            { color: item.amount >= 0 ? '#006D77' : '#D32F2F' }
          ]}>
            {item.amount >= 0 ? '+' : ''}{item.amount}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

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
  title: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  transactionCard: {
    marginBottom: 8,
    elevation: 2,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontWeight: '500',
  },
  transactionMeta: {
    opacity: 0.7,
    marginTop: 2,
  },
  transactionAmount: {
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});