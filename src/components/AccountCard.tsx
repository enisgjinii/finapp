import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { Account } from '../types';
import { formatCurrency } from '../utils/money';

interface AccountCardProps {
  account: Account;
  balance: number;
  onPress: () => void;
  onEdit: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  balance,
  onPress,
  onEdit,
}) => {
  const theme = useTheme();

  const balanceColor = balance >= 0 ? theme.colors.primary : theme.colors.error;

  return (
    <Card style={[styles.card, { backgroundColor: '#f9fafb', borderColor: account.color || '#e5e7eb' }]} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>
              {account.name}
            </Text>
            <Text style={styles.currency}>
              {account.currency}
            </Text>
          </View>
          <IconButton
            icon="pencil"
            size={18}
            onPress={onEdit}
            style={styles.editButton}
            iconColor="#6b7280"
          />
        </View>
        <Text style={[styles.balance, { color: balanceColor }]}>
          {formatCurrency(balance, account.currency)}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  currency: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  editButton: {
    margin: 0,
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
});