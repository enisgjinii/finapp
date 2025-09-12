import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, ProgressBar, FAB, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useSavings } from '../../src/hooks/useSavings';
import { formatCurrency } from '../../src/utils/money';
import { formatDate } from '../../src/utils/date';

export default function SavingsScreen(): React.JSX.Element {
  const theme = useTheme();
  const { savings } = useSavings();

  const renderSavingsGoal = ({ item }: { item: any }) => {
    const progress = Math.min(item.currentAmount / item.targetAmount, 1);
    const progressPercentage = Math.round(progress * 100);

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
            <Text variant="headlineSmall" style={[styles.percentage, { color: theme.colors.primary }]}>
              {progressPercentage}%
            </Text>
          </View>

          <View style={styles.amounts}>
            <Text variant="titleMedium" style={[styles.currentAmount, { color: theme.colors.onSurface }]}>
              {formatCurrency(item.currentAmount)}
            </Text>
            <Text variant="bodyMedium" style={[styles.targetAmount, { color: theme.colors.onSurfaceVariant }]}>
              of {formatCurrency(item.targetAmount)}
            </Text>
            {item.dueDate && (
              <Text variant="bodySmall" style={[styles.dueDate, { color: theme.colors.onSurfaceVariant }]}>
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
            <Text variant="bodySmall" style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
              {item.notes}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.screenTitle, { color: theme.colors.onBackground }]}>
        Savings Goals
      </Text>

      <FlatList
        data={savings}
        keyExtractor={(item) => item.id}
        renderItem={renderSavingsGoal}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/savings/add')}
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
    paddingBottom: 120, // Increased for tab bar + FAB
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  amounts: {
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  targetAmount: {
    fontSize: 14,
    marginTop: 2,
  },
  dueDate: {
    fontSize: 12,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 80, // Position above tab bar
    borderRadius: 12,
    width: 56,
    height: 56,
  },
});