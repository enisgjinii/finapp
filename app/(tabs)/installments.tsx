import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, Button, FAB, useTheme, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';
import { useInstallments } from '../../src/hooks/useInstallments';
import { useAccounts } from '../../src/hooks/useAccounts';
import { formatCurrency } from '../../src/utils/money';
import { formatDate } from '../../src/utils/date';

export default function InstallmentsScreen(): JSX.Element {
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
        style={styles.card}
        onPress={() => router.push(`/installments/${item.id}`)}
      >
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.account}>
              {account?.name}
            </Text>
          </View>

          <View style={styles.details}>
            <Text variant="titleMedium" style={styles.amount}>
              {formatCurrency(item.monthlyAmount)} / month
            </Text>
            <Text variant="bodyMedium" style={styles.progress}>
              {item.monthsPaid} of {item.monthsTotal} payments
            </Text>
          </View>

          <ProgressBar
            progress={item.monthsPaid / item.monthsTotal}
            color={theme.colors.primary}
            style={styles.progressBar}
          />

          <View style={styles.footer}>
            <Text variant="bodyMedium">
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
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.screenTitle}>
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

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/installments/add')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenTitle: {
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
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  account: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  details: {
    marginBottom: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progress: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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