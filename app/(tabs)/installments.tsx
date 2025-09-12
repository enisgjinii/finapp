import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, Button, useTheme, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';
import { useInstallments } from '../../src/hooks/useInstallments';
import { useAccounts } from '../../src/hooks/useAccounts';
import { formatCurrency } from '../../src/utils/money';
import { formatDate } from '../../src/utils/date';

export default function InstallmentsScreen(): React.JSX.Element {
  const theme = useTheme();
  const { installments, payInstallment } = useInstallments();
  const { accounts } = useAccounts();

  const handlePayInstallment = async (installmentId: string) => {
    try {
      await payInstallment.mutateAsync(installmentId);
    } catch (error) {
      console.error('Error paying installment:', error);
    }
  };

  const renderInstallment = ({ item }: { item: any }) => {
    const account = accounts.find(a => a.id === item.accountId);
    const progress = (item.monthsPaid / item.monthsTotal) * 100;

    return (
      <Card
        style={[styles.card, {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline
        }]}
      >
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={[styles.account, { color: theme.colors.onSurfaceVariant }]}>
              {account?.name}
            </Text>
          </View>

          <View style={styles.details}>
            <Text variant="titleMedium" style={[styles.amount, { color: theme.colors.onSurface }]}>
              {formatCurrency(item.monthlyAmount)} / month
            </Text>
            <Text variant="bodyMedium" style={[styles.progress, { color: theme.colors.onSurfaceVariant }]}>
              {item.monthsPaid} of {item.monthsTotal} payments
            </Text>
          </View>

          <ProgressBar
            progress={item.monthsPaid / item.monthsTotal}
            color={theme.colors.primary}
            style={styles.progressBar}
          />

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Next: {formatDate(item.nextDueDate)}
            </Text>
            <Button
              mode="contained"
              compact
              onPress={() => handlePayInstallment(item.id)}
              disabled={payInstallment.isPending}
            >
              Pay Now
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.screenTitle, { color: theme.colors.onBackground }]}>
        Installments
      </Text>

      <FlatList
        data={installments}
        keyExtractor={(item) => item.id}
        renderItem={renderInstallment}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenTitle: {
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 24,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.025,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Space for tab bar
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  account: {
    fontSize: 14,
    marginTop: 2,
  },
  details: {
    marginBottom: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  progress: {
    fontSize: 12,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});