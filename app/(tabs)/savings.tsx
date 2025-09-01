import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, ProgressBar, FAB, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useSavings } from '../../src/hooks/useSavings';
import { formatCurrency } from '../../src/utils/money';
import { formatDate } from '../../src/utils/date';

export default function SavingsScreen(): JSX.Element {
  const theme = useTheme();
  const { savings } = useSavings();

  const renderSavingsGoal = ({ item }: { item: any }) => {
    const progress = Math.min(item.currentAmount / item.targetAmount, 1);
    const progressPercentage = Math.round(progress * 100);

    return (
      <Card
        style={styles.card}
        onPress={() => router.push(`/savings/${item.id}`)}
      >
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
              {formatCurrency(item.currentAmount)}
            </Text>
            <Text variant="bodyMedium" style={styles.targetAmount}>
              of {formatCurrency(item.targetAmount)}
            </Text>
            {item.dueDate && (
              <Text variant="bodySmall" style={styles.dueDate}>
                Target: {formatDate(item.dueDate)}
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
        onPress={() => router.push('/savings/add')}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  amounts: {
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  targetAmount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  dueDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
  },
  notes: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
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