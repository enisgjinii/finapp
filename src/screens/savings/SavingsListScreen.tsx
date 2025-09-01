import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, ProgressBar, FAB, useTheme } from 'react-native-paper';
import { useSavings } from '../../hooks/useSavings';
import { formatCurrency } from '../../utils/money';
import { formatDate } from '../../utils/date';

export const SavingsListScreen: React.FC = () => {
  const { savings } = useSavings();
  const theme = useTheme();

  const renderSavingsGoal = ({ item }: { item: any }) => {
    const progress = Math.min(item.currentAmount / item.targetAmount, 1);
    const progressPercentage = Math.round(progress * 100);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="headlineSmall" style={styles.percentage}>
              {progressPercentage}%
            </Text>
          </View>

          <View style={styles.amounts}>
            <Text variant="bodyMedium">
              {formatCurrency(item.currentAmount)} of {formatCurrency(item.targetAmount)}
            </Text>
            {item.dueDate && (
              <Text variant="bodySmall" style={styles.dueDate}>
                Due: {formatDate(item.dueDate)}
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
        data={savings}
        keyExtractor={(item) => item.id}
        renderItem={renderSavingsGoal}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Navigate to add savings goal */}}
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
    color: '#2196F3',
  },
  amounts: {
    marginBottom: 12,
  },
  dueDate: {
    opacity: 0.7,
    marginTop: 4,
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