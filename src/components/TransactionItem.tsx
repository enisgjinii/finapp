import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Text, Chip, useTheme } from 'react-native-paper';
import { Transaction, Account } from '../types';
import { formatCurrency, formatAmount } from '../utils/money';
import { formatShortDate } from '../utils/date';

interface TransactionItemProps {
  transaction: Transaction;
  account?: Account;
  onPress: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  account,
  onPress,
}) => {
  const theme = useTheme();

  const isIncome = transaction.amount >= 0;
  const amountColor = isIncome ? theme.colors.primary : theme.colors.error;

  const getIcon = () => {
    if (transaction.source === 'installment') return 'credit-card';
    if (transaction.source === 'transfer') return 'swap-horizontal';
    return isIncome ? 'plus-circle' : 'minus-circle';
  };

  return (
    <List.Item
      title={transaction.description || 'No description'}
      description={() => (
        <View style={styles.description}>
          <Text variant="bodySmall" style={styles.date}>
            {formatShortDate(transaction.date)} • {account?.name}
          </Text>
          {transaction.category && (
            <Chip compact style={styles.categoryChip}>
              {transaction.category}
            </Chip>
          )}
        </View>
      )}
      left={(props) => (
        <List.Icon
          {...props}
          icon={getIcon()}
          color={amountColor}
        />
      )}
      right={() => (
        <View style={styles.amountContainer}>
          <Text variant="titleMedium" style={[styles.amount, { color: amountColor }]}>
            {formatAmount(transaction.amount)}
          </Text>
        </View>
      )}
      onPress={onPress}
      style={styles.item}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: 8,
  },
  description: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    opacity: 0.7,
    marginRight: 8,
  },
  categoryChip: {
    height: 24,
  },
  amountContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '600',
  },
});