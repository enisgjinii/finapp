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
    <Card style={[styles.card, { backgroundColor: account.color || theme.colors.surface }]} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.accountInfo}>
            <Text variant="titleMedium" style={styles.accountName}>
              {account.name}
            </Text>
            <Text variant="bodySmall" style={styles.currency}>
              {account.currency}
            </Text>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            onPress={onEdit}
            style={styles.editButton}
          />
        </View>
        <Text variant="headlineSmall" style={[styles.balance, { color: balanceColor }]}>
          {formatCurrency(balance, account.currency)}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
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
});