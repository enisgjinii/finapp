import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, Button, FAB, useTheme } from 'react-native-paper';
import { useInstallments } from '../../hooks/useInstallments';
import { useAccounts } from '../../hooks/useAccounts';
import { formatCurrency } from '../../utils/money';
import { formatDate } from '../../utils/date';

export const InstallmentsListScreen: React.FC = () => {
  const { installments, payInstallment } = useInstallments();
  const { accounts } = useAccounts();
  const theme = useTheme();

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
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.account}>
              {account?.name}
            </Text>
          </View>

          <View style={styles.details}>
            <Text variant="bodyMedium">
              {formatCurrency(item.monthlyAmount)} / month
            </Text>
            <Text variant="bodySmall" style={styles.progress}>
              {item.monthsPaid} of {item.monthsTotal} payments
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: theme.colors.primary }
              ]}
            />
          </View>

          <View style={styles.footer}>
            <Text variant="bodySmall">
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
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Navigate to add installment */}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenTitle: {
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
  },
  account: {
    opacity: 0.7,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progress: {
    opacity: 0.7,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});