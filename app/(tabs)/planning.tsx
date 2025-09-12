import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, SegmentedButtons, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useInstallments } from '../../src/hooks/useInstallments';
import { useSavings } from '../../src/hooks/useSavings';
import { formatCurrency } from '../../src/utils/money';
import { TrendingUp, Target, CreditCard, BarChart3, Plus } from 'lucide-react-native';

export default function InsightsScreen(): React.JSX.Element {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeView, setActiveView] = useState<'reports' | 'planning'>('reports');
  const theme = useTheme();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { installments } = useInstallments();
  const { savings } = useSavings();

  // Calculate analytics for selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    const filtered = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return txDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return txDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return txDate >= yearAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const totalIncome = filteredTransactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = Math.abs(filteredTransactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0));
  const netIncome = totalIncome - totalExpenses;

  // Planning stats
  const activeInstallments = installments.filter(inst => inst.monthsPaid < inst.monthsTotal);
  const activeSavings = savings.filter(saving => saving.currentAmount < saving.targetAmount);
  const totalSavingsTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0);
  const totalSavingsCurrent = savings.reduce((sum, s) => sum + s.currentAmount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.screenTitle, { color: theme.colors.onBackground }]}>
        Insights
      </Text>

      {/* View Switcher */}
      <View style={styles.viewSwitcher}>
        <TouchableOpacity
          style={[styles.viewButton, activeView === 'reports' && { backgroundColor: theme.colors.primaryContainer }]}
          onPress={() => setActiveView('reports')}
        >
          <BarChart3 size={20} color={activeView === 'reports' ? theme.colors.primary : theme.colors.onSurfaceVariant} />
          <Text style={[styles.viewButtonText, { color: activeView === 'reports' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
            Reports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, activeView === 'planning' && { backgroundColor: theme.colors.primaryContainer }]}
          onPress={() => setActiveView('planning')}
        >
          <Target size={20} color={activeView === 'planning' ? theme.colors.primary : theme.colors.onSurfaceVariant} />
          <Text style={[styles.viewButtonText, { color: activeView === 'planning' ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
            Planning
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {activeView === 'reports' ? (
          <>
            {/* Period Selector */}
            <SegmentedButtons
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              buttons={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
              style={styles.periodSelector}
            />

            {/* Financial Summary */}
            <Card style={[styles.summaryCard, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline
            }]}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Summary
                </Text>

                <View style={styles.summaryRow}>
                  <View style={[styles.summaryItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                      Incomes
                    </Text>
                    <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.primary }]}>
                      ₺{totalIncome.toLocaleString()}
                    </Text>
                  </View>

                  <View style={[styles.summaryItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                      Expenses
                    </Text>
                    <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.error }]}>
                      ₺{totalExpenses.toLocaleString()}
                    </Text>
                  </View>

                  <View style={[styles.summaryItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                      Net
                    </Text>
                    <Text variant="titleLarge" style={[styles.amount, { color: netIncome >= 0 ? theme.colors.primary : theme.colors.error }]}>
                      ₺{netIncome.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Top Categories */}
            {filteredTransactions.length > 0 && (
              <Card style={[styles.chartCard, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
              }]}>
                <Card.Content>
                  <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Spending Breakdown
                  </Text>
                  <View style={styles.chartPlaceholder}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                      Detailed analytics coming soon
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                      {filteredTransactions.filter(tx => tx.amount < 0).length} expense transactions this {selectedPeriod}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Planning Overview */}
            <Card style={[styles.planningCard, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline
            }]}>
              <Card.Content>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Planning Overview
                </Text>

                <View style={styles.planningStats}>
                  <View style={styles.planningStat}>
                    <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Active Installments
                    </Text>
                    <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.secondary }]}>
                      {activeInstallments.length}
                    </Text>
                  </View>

                  <View style={styles.planningStat}>
                    <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Savings Goals
                    </Text>
                    <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.tertiary }]}>
                      {activeSavings.length}
                    </Text>
                  </View>

                  <View style={styles.planningStat}>
                    <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Savings Progress
                    </Text>
                    <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.primary }]}>
                      {totalSavingsTarget > 0 ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100) : 0}%
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Quick Actions */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: theme.colors.secondaryContainer }]}
                onPress={() => router.push('/installments/add')}
              >
                <CreditCard size={24} color={theme.colors.secondary} />
                <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.secondary }]}>
                  Add Installment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: theme.colors.tertiaryContainer }]}
                onPress={() => router.push('/savings/add')}
              >
                <Target size={24} color={theme.colors.tertiary} />
                <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.tertiary }]}>
                  Add Savings Goal
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Planning Items */}
            {activeInstallments.length > 0 && (
              <Card style={[styles.sectionCard, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
              }]}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                      Upcoming Payments
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/installments')}>
                      <Text variant="bodyMedium" style={[styles.seeAllText, { color: theme.colors.primary }]}>
                        See All
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {activeInstallments.slice(0, 2).map((installment) => (
                    <View key={installment.id} style={styles.planningItem}>
                      <View style={styles.planningItemLeft}>
                        <View style={[styles.planningIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
                          <CreditCard size={16} color={theme.colors.secondary} />
                        </View>
                        <View>
                          <Text variant="bodyMedium" style={[styles.planningTitle, { color: theme.colors.onSurface }]}>
                            {installment.title}
                          </Text>
                          <Text variant="bodySmall" style={[styles.planningSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                            {installment.monthsPaid} of {installment.monthsTotal} payments
                          </Text>
                        </View>
                      </View>
                      <Text variant="bodyMedium" style={[styles.planningAmount, { color: theme.colors.onSurface }]}>
                        {formatCurrency(installment.monthlyAmount)}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {activeSavings.length > 0 && (
              <Card style={[styles.sectionCard, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
              }]}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                      Savings Goals
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/savings')}>
                      <Text variant="bodyMedium" style={[styles.seeAllText, { color: theme.colors.primary }]}>
                        See All
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {activeSavings.slice(0, 2).map((saving) => {
                    const progress = Math.min(saving.currentAmount / saving.targetAmount, 1);
                    return (
                      <View key={saving.id} style={styles.savingsItem}>
                        <View style={styles.savingsItemLeft}>
                          <View style={[styles.savingsIcon, { backgroundColor: theme.colors.tertiaryContainer }]}>
                            <Target size={16} color={theme.colors.tertiary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text variant="bodyMedium" style={[styles.savingsTitle, { color: theme.colors.onSurface }]}>
                              {saving.title}
                            </Text>
                            <Text variant="bodySmall" style={[styles.savingsSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                              {formatCurrency(saving.currentAmount)} of {formatCurrency(saving.targetAmount)}
                            </Text>
                            <View style={styles.miniProgressBar}>
                              <View
                                style={[styles.miniProgressFill, {
                                  width: `${progress * 100}%`,
                                  backgroundColor: theme.colors.primary
                                }]}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </Card.Content>
              </Card>
            )}
          </>
        )}

      </ScrollView>

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
  viewSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  periodSelector: {
    marginBottom: 20,
  },
  summaryCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  planningCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  planningStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planningStat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  planningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  planningItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planningIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planningTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  planningSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  planningAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  savingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  savingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  savingsTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  savingsSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 8,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
