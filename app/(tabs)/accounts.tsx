import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, FAB, IconButton, useTheme } from 'react-native-paper';

const mockAccounts = [
  { id: '1', name: 'TEB', currency: 'TRY', color: '#E3F2FD', balance: 15420.50 },
  { id: '2', name: 'Paysera', currency: 'EUR', color: '#E8F5E8', balance: 2845.30 },
  { id: '3', name: 'OneFor', currency: 'USD', color: '#FFF3E0', balance: 1250.00 },
  { id: '4', name: 'PayPal', currency: 'USD', color: '#E1F5FE', balance: 840.20 },
  { id: '5', name: 'Cash', currency: 'TRY', color: '#F3E5F5', balance: 560.00 },
];

export default function AccountsScreen() {
  const theme = useTheme();

  const renderAccount = ({ item }: { item: any }) => (
    <Card style={[styles.accountCard, { backgroundColor: item.color }]}>
      <Card.Content>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <Text variant="titleLarge" style={styles.accountName}>
              {item.name}
            </Text>
            <Text variant="bodyMedium" style={styles.currency}>
              {item.currency}
            </Text>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => {/* Edit account */}}
            style={styles.editButton}
          />
        </View>
        <Text variant="headlineSmall" style={[
          styles.balance,
          { color: item.balance >= 0 ? theme.colors.primary : theme.colors.error }
        ]}>
          {item.currency === 'TRY' ? '₺' : item.currency === 'EUR' ? '€' : '$'}{item.balance.toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Accounts
      </Text>

      <FlatList
        data={mockAccounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccount}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Navigate to add account */}}
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  accountCard: {
    marginBottom: 12,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  editButton: {
    margin: 0,
  },
  balance: {
    fontWeight: '700',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});