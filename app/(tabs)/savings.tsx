import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, ProgressBar, FAB, useTheme } from 'react-native-paper';

const mockSavings = [
  {
    id: '1',
    title: 'Emergency Fund',
    currentAmount: 8500,
    targetAmount: 20000,
    dueDate: '2025-12-31',
    notes: 'For unexpected expenses',
  },
  {
    id: '2',
    title: 'Vacation Fund',
    currentAmount: 2400,
    targetAmount: 5000,
    dueDate: '2025-07-01',
    notes: 'Summer vacation in Europe',
  },
  {
    id: '3',
    title: 'New Laptop',
    currentAmount: 1200,
    targetAmount: 3500,
    dueDate: '2025-06-01',
    notes: 'MacBook Pro upgrade',
  },
];

export default function SavingsScreen() {
  const theme = useTheme();

  const renderSavingsGoal = ({ item }: { item: any }) => {
    const progress = Math.min(item.currentAmount / item.targetAmount, 1);
    const progressPercentage = Math.round(progress * 100);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="headlineSmall" style={[styles.percentage, { color: theme.colors.primary }]}>
              {progressPercentage}%
            </Text>
          </View>

          <View style={styles.amounts}>
            <Text variant="titleMedium" style={styles.currentAmount}>
              ₺{item.currentAmount.toLocaleString()}
            </Text>
            <Text variant="bodyMedium" style={styles.targetAmount}>
              of ₺{item.targetAmount.toLocaleString()}
            </Text>
            {item.dueDate && (
              <Text variant="bodySmall" style={styles.dueDate}>
                Target: {item.dueDate}
              </Text>
            )}
          </View>

          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />

          {item.notes && (
            <Text variant="bodySmall" style={styles.notes}>
              {item.notes}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.screenTitle}>
        Savings Goals
      </Text>

      <FlatList
        data={mockSavings}
        keyExtractor={(item) => item.id}
        renderItem={renderSavingsGoal}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Navigate to add savings goal */}}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
    flex: 1,
  },
  percentage: {
    fontWeight: '700',
  },
  amounts: {
    marginBottom: 12,
  },
  currentAmount: {
    fontWeight: '600',
    color: '#006D77',
  },
  targetAmount: {
    opacity: 0.7,
    marginTop: 2,
  },
  dueDate: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  notes: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});