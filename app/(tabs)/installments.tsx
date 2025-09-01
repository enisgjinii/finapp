import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, Button, FAB, useTheme, ProgressBar } from 'react-native-paper';

const mockInstallments = [
  {
    id: '1',
    title: 'iPhone 15 Pro',
    account: 'TEB',
    monthlyAmount: 850,
    monthsPaid: 3,
    monthsTotal: 12,
    nextDueDate: '2025-02-15',
    principal: 10200,
  },
  {
    id: '2',
    title: 'MacBook Pro',
    account: 'Paysera',
    monthlyAmount: 1200,
    monthsPaid: 8,
    monthsTotal: 24,
    nextDueDate: '2025-02-01',
    principal: 28800,
  },
  {
    id: '3',
    title: 'Car Loan',
    account: 'TEB',
    monthlyAmount: 2200,
    monthsPaid: 15,
    monthsTotal: 60,
    nextDueDate: '2025-02-10',
    principal: 132000,
  },
];

export default function InstallmentsScreen() {
  const theme = useTheme();

  const renderInstallment = ({ item }: { item: any }) => {
    const progress = (item.monthsPaid / item.monthsTotal);
    const progressPercentage = Math.round(progress * 100);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.account}>
              {item.account}
            </Text>
          </View>

          <View style={styles.details}>
            <Text variant="titleMedium" style={styles.amount}>
              ₺{item.monthlyAmount.toLocaleString()} / month
            </Text>
            <Text variant="bodyMedium" style={styles.progress}>
              {item.monthsPaid} of {item.monthsTotal} payments ({progressPercentage}%)
            </Text>
          </View>

          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />

          <View style={styles.footer}>
            <Text variant="bodyMedium">
              Next payment: {item.nextDueDate}
            </Text>
            <Button
              mode="contained"
              compact
              onPress={() => {/* Pay installment */}}
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
        data={mockInstallments}
        keyExtractor={(item) => item.id}
        renderItem={renderInstallment}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Navigate to add installment */}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenTitle: {
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
    marginBottom: 12,
  },
  amount: {
    fontWeight: '600',
    color: '#006D77',
  },
  progress: {
    opacity: 0.7,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
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