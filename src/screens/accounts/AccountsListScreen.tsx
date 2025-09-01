import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useAccounts } from '../../hooks/useAccounts';
import { useTransactions } from '../../hooks/useTransactions';
import { AccountCard } from '../../components/AccountCard';
import { calculateBalance } from '../../utils/money';

export const AccountsListScreen: React.FC = () => {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Accounts
      </Text>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            balance={calculateBalance(transactions, item.id)}
            onPress={() => {/* Navigate to account details */}}
            onEdit={() => {/* Navigate to edit account */}}
          />
        )}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Navigate to add account */}}
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