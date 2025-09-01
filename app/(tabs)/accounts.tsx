import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, FAB, IconButton, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useTransactions } from '../../src/hooks/useTransactions';
import { AccountCard } from '../../src/components/AccountCard';
import { calculateBalance } from '../../src/utils/money';

export default function AccountsScreen(): JSX.Element {
  const theme = useTheme();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  const renderAccount = ({ item }: { item: any }) => (
    <AccountCard
      account={item}
      balance={calculateBalance(transactions, item.id)}
      onPress={() => router.push(`/accounts/${item.id}`)}
      onEdit={() => router.push(`/accounts/${item.id}/edit`)}
    />
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Accounts
      </Text>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccount}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/accounts/add')}
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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