import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { formatCurrency } from '../../src/utils/money';
import { formatDate } from '../../src/utils/date';

export default function TransactionDetailsScreen(): JSX.Element {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  const transaction = transactions.find(t => t.id === id);
  const account = transaction ? accounts.find(a => a.id === transaction.accountId) : null;

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Transaction Not Found
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  const isIncome = transaction.amount > 0;
  const amountColor = isIncome ? '#4CAF50' : '#F44336';

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Transaction Details
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.amountContainer}>
            <Text variant="displaySmall" style={[styles.amount, { color: amountColor }]}>
              {isIncome ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
            </Text>
            <Chip
              mode="outlined"
              style={[styles.typeChip, { borderColor: amountColor }]}
              textStyle={{ color: amountColor }}
            >
              {isIncome ? 'Income' : 'Expense'}
            </Chip>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodyLarge" style={styles.label}>Description:</Text>
            <Text variant="bodyLarge" style={styles.value}>
              {transaction.description || 'No description'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodyLarge" style={styles.label}>Account:</Text>
            <Text variant="bodyLarge" style={styles.value}>
              {account?.name || 'Unknown Account'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodyLarge" style={styles.label}>Date:</Text>
            <Text variant="bodyLarge" style={styles.value}>
              {formatDate(transaction.date)}
            </Text>
          </View>

          {transaction.category && (
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.label}>Category:</Text>
              <Chip mode="outlined" style={styles.categoryChip}>
                {transaction.category}
              </Chip>
            </View>
          )}

          {transaction.tags && transaction.tags.length > 0 && (
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.label}>Tags:</Text>
              <View style={styles.tagsContainer}>
                {transaction.tags.map((tag, index) => (
                  <Chip key={index} mode="outlined" style={styles.tagChip}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {transaction.source && (
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.label}>Source:</Text>
              <Text variant="bodyLarge" style={styles.value}>
                {transaction.source.charAt(0).toUpperCase() + transaction.source.slice(1)}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text variant="bodyLarge" style={styles.label}>Created:</Text>
            <Text variant="bodyLarge" style={styles.value}>
              {formatDate(transaction.createdAt)}
            </Text>
          </View>

          {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.label}>Last Updated:</Text>
              <Text variant="bodyLarge" style={styles.value}>
                {formatDate(transaction.updatedAt)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.button}
        >
          Back to Transactions
        </Button>
        <Button
          mode="contained"
          onPress={() => {/* Navigate to edit transaction */}}
          style={styles.button}
        >
          Edit Transaction
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  card: {
    elevation: 2,
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amount: {
    fontWeight: '700',
    marginBottom: 8,
  },
  typeChip: {
    borderWidth: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  label: {
    fontWeight: '600',
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: 'right',
  },
  categoryChip: {
    marginLeft: 'auto',
  },
  tagsContainer: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  tagChip: {
    marginVertical: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});
