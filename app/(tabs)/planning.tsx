import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useInstallments } from '../../src/hooks/useInstallments';
import { useSavings } from '../../src/hooks/useSavings';
import { formatCurrency } from '../../src/utils/money';
import { TrendingUp, Target, CreditCard, BarChart3, Plus, MoreHorizontal } from 'lucide-react-native';
import {
  BarChart,
  PieChart,
  LineChart
} from 'react-native-chart-kit';

// Screen dimensions for charts
const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding

// Helper function to get category colors
const getCategoryColor = (index: number): string => {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
  ];
  return colors[index % colors.length];
};

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
      if (!tx.date) return false;
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text variant="headlineLarge" style={styles.screenTitle}>
              Insights
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, activeView === 'reports' && styles.headerButtonActive]}
              onPress={() => setActiveView('reports')}
              activeOpacity={0.7}
            >
              <BarChart3 size={16} color={activeView === 'reports' ? '#000000' : '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, activeView === 'planning' && styles.headerButtonActive]}
              onPress={() => setActiveView('planning')}
              activeOpacity={0.7}
            >
              <Target size={16} color={activeView === 'planning' ? '#000000' : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {activeView === 'reports' ? (
          <>
            {/* Period Selector */}
            <Surface style={styles.periodSelectorCard}>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
                  onPress={() => setSelectedPeriod('week')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
                    Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
                  onPress={() => setSelectedPeriod('month')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
                    Month
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]}
                  onPress={() => setSelectedPeriod('year')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.periodButtonText, selectedPeriod === 'year' && styles.periodButtonTextActive]}>
                    Year
                  </Text>
                </TouchableOpacity>
              </View>
            </Surface>

            {/* Financial Summary */}
            <Surface style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Summary
                </Text>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Incomes
                    </Text>
                    <Text variant="headlineSmall" style={styles.summaryAmount}>
                      €{totalIncome.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Expenses
                    </Text>
                    <Text variant="headlineSmall" style={[styles.summaryAmount, { color: '#dc2626' }]}>
                      €{totalExpenses.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text variant="bodySmall" style={styles.summaryLabel}>
                      Net
                    </Text>
                    <Text variant="headlineSmall" style={[styles.summaryAmount, { color: netIncome >= 0 ? '#000000' : '#dc2626' }]}>
                      €{netIncome.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </Surface>

            {/* Spending Analytics */}
            {filteredTransactions.length > 0 && (
              <View style={styles.analyticsContainer}>
                {/* Key Metrics */}
                <Surface style={styles.metricsCard}>
                  <View style={styles.metricsContent}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Key Metrics
                    </Text>
                    <View style={styles.metricsGrid}>
                      <View style={styles.metricCard}>
                        <Text variant="bodySmall" style={styles.metricLabel}>
                          Avg Transaction
                        </Text>
                        <Text variant="headlineSmall" style={styles.metricValue}>
                          €{Math.abs(filteredTransactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0) / filteredTransactions.filter(tx => tx.amount < 0).length || 0).toFixed(0)}
                        </Text>
                      </View>

                      <View style={styles.metricCard}>
                        <Text variant="bodySmall" style={styles.metricLabel}>
                          Transactions
                        </Text>
                        <Text variant="headlineSmall" style={styles.metricValue}>
                          {filteredTransactions.filter(tx => tx.amount < 0).length}
                        </Text>
                      </View>

                      <View style={styles.metricCard}>
                        <Text variant="bodySmall" style={styles.metricLabel}>
                          Largest Expense
                        </Text>
                        <Text variant="headlineSmall" style={styles.metricValue}>
                          €{Math.abs(Math.min(...filteredTransactions.filter(tx => tx.amount < 0).map(tx => tx.amount))).toLocaleString()}
                        </Text>
                      </View>

                      <View style={styles.metricCard}>
                        <Text variant="bodySmall" style={styles.metricLabel}>
                          Active Days
                        </Text>
                        <Text variant="headlineSmall" style={styles.metricValue}>
                          {new Set(filteredTransactions.map(tx => {
                            const date = tx.date instanceof Date ? tx.date : new Date(tx.date);
                            return date.toDateString();
                          })).size}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Surface>

                {/* Spending Trend Chart */}
                <Surface style={styles.chartCard}>
                  <View style={styles.chartContent}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Spending Trend
                    </Text>
                    {(() => {
                      const expenseTransactions = filteredTransactions.filter(tx => tx.amount < 0);
                      const weeklyData = [];

                      // Group by weeks for the last 7 weeks
                      for (let i = 6; i >= 0; i--) {
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - (i * 7));

                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);

                        const weekExpenses = expenseTransactions.filter(tx => {
                          const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
                          return txDate >= weekStart && txDate <= weekEnd;
                        }).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

                        weeklyData.push({
                          week: `Week ${7-i}`,
                          amount: weekExpenses,
                          x: `W${7-i}`,
                          y: weekExpenses
                        });
                      }

                      const barData = {
                        labels: weeklyData.map(d => d.x),
                        datasets: [{
                          data: weeklyData.map(d => d.y),
                        }],
                      };

                      const barChartConfig = {
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                        style: {
                          borderRadius: 8,
                        },
                        propsForLabels: {
                          fontSize: 10,
                          fontWeight: '500',
                        },
                      };

                      return (
                        <View style={styles.chartWrapper}>
                          <BarChart
                            data={barData}
                            width={chartWidth}
                            height={140}
                            chartConfig={barChartConfig}
                            showValuesOnTopOfBars={false}
                            fromZero={true}
                            style={{
                              marginVertical: 4,
                              borderRadius: 6,
                            }}
                            withInnerLines={false}
                            showBarTops={false}
                          />
                        </View>
                      );
                    })()}
                  </View>
                </Surface>

                {/* Category Breakdown with Pie Chart */}
                {(() => {
                  const expenseTransactions = filteredTransactions.filter(tx => tx.amount < 0);
                  const totalExpenses = Math.abs(expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0));

                  // Group by category (using description as category for now)
                  const categoryMap = new Map<string, number>();
                  expenseTransactions.forEach(tx => {
                    const category = tx.category || tx.description?.split(' ')[0] || 'Other';
                    categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(tx.amount));
                  });

                  const topCategories = Array.from(categoryMap.entries())
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5);

                  const pieData = topCategories.map(([category, amount], index) => ({
                    x: category.length > 10 ? category.substring(0, 10) + '...' : category,
                    y: amount,
                    percentage: ((amount / totalExpenses) * 100).toFixed(1),
                    color: getCategoryColor(index)
                  }));

                  return (
                    <Surface style={styles.pieChartCard}>
                      <View style={styles.pieChartContent}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                          Category Breakdown
                        </Text>

                        <View style={styles.pieChartWrapper}>
                          <PieChart
                            data={pieData.map(item => ({
                              name: item.x,
                              population: item.y,
                              color: item.color,
                              legendFontColor: '#000000',
                              legendFontSize: 11,
                            }))}
                            width={120}
                            height={120}
                            chartConfig={{
                              backgroundColor: '#ffffff',
                              backgroundGradientFrom: '#ffffff',
                              backgroundGradientTo: '#ffffff',
                              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="10"
                            absolute={false}
                            hasLegend={false}
                          />

                          <View style={styles.pieLegend}>
                            {pieData.map((item, index) => (
                              <View key={index} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                <View style={styles.legendText}>
                                  <Text variant="bodySmall" style={styles.legendCategory} numberOfLines={1}>
                                    {item.x}
                                  </Text>
                                  <Text variant="bodySmall" style={styles.legendAmount}>
                                    €{item.y.toLocaleString()} ({item.percentage}%)
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    </Surface>
                  );
                })()}
              </View>
            )}
          </>
        ) : (
          <>
            {/* Planning Overview */}
            <Surface style={styles.planningCard}>
              <View style={styles.planningContent}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Planning Overview
                </Text>

                <View style={styles.planningStats}>
                  <View style={styles.planningStat}>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Active Installments
                    </Text>
                    <Text variant="headlineSmall" style={styles.statValue}>
                      {activeInstallments.length}
                    </Text>
                  </View>

                  <View style={styles.planningStat}>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Savings Goals
                    </Text>
                    <Text variant="headlineSmall" style={styles.statValue}>
                      {activeSavings.length}
                    </Text>
                  </View>

                  <View style={styles.planningStat}>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Savings Progress
                    </Text>
                    <Text variant="headlineSmall" style={styles.statValue}>
                      {totalSavingsTarget > 0 ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100) : 0}%
                    </Text>
                  </View>
                </View>
              </View>
            </Surface>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/installments/add')}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>
                  <CreditCard size={14} color="#000000" />
                </View>
                <Text variant="bodySmall" style={styles.actionText}>
                  Add Installment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/savings/add')}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>
                  <Target size={14} color="#000000" />
                </View>
                <Text variant="bodySmall" style={styles.actionText}>
                  Add Savings Goal
                </Text>
              </TouchableOpacity>
            </View>

            {/* Upcoming Payments */}
            {activeInstallments.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Upcoming Payments
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/installments')} activeOpacity={0.7}>
                    <Text variant="bodySmall" style={styles.seeAllText}>
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>

                <Surface style={styles.sectionCard}>
                  <View style={styles.sectionContent}>
                    {activeInstallments.slice(0, 2).map((installment, index) => {
                      const isLast = index === activeInstallments.slice(0, 2).length - 1;
                      return (
                        <TouchableOpacity
                          key={installment.id}
                          style={[styles.planningItem, !isLast && styles.planningItemBorder]}
                          onPress={() => router.push('/installments')}
                          activeOpacity={0.7}
                        >
                          <View style={styles.planningItemLeft}>
                            <View style={styles.planningIcon}>
                              <CreditCard size={14} color="#6b7280" />
                            </View>
                            <View style={styles.planningItemDetails}>
                              <Text variant="bodyMedium" style={styles.planningTitle}>
                                {installment.title}
                              </Text>
                              <Text variant="bodySmall" style={styles.planningSubtitle}>
                                {installment.monthsPaid} of {installment.monthsTotal} payments
                              </Text>
                            </View>
                          </View>
                          <View style={styles.planningItemRight}>
                            <Text variant="bodyMedium" style={styles.planningAmount}>
                              {formatCurrency(installment.monthlyAmount)}
                            </Text>
                            <MoreHorizontal size={12} color="#6b7280" />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Surface>
              </>
            )}

            {activeSavings.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Savings Goals
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/savings')} activeOpacity={0.7}>
                    <Text variant="bodySmall" style={styles.seeAllText}>
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>

                <Surface style={styles.sectionCard}>
                  <View style={styles.sectionContent}>
                    {activeSavings.slice(0, 2).map((saving, index) => {
                      const progress = Math.min(saving.currentAmount / saving.targetAmount, 1);
                      const isLast = index === activeSavings.slice(0, 2).length - 1;
                      return (
                        <TouchableOpacity
                          key={saving.id}
                          style={[styles.savingsItem, !isLast && styles.savingsItemBorder]}
                          onPress={() => router.push('/savings')}
                          activeOpacity={0.7}
                        >
                          <View style={styles.savingsItemLeft}>
                            <View style={styles.savingsIcon}>
                              <Target size={14} color="#6b7280" />
                            </View>
                            <View style={styles.savingsItemDetails}>
                              <Text variant="bodyMedium" style={styles.savingsTitle}>
                                {saving.title}
                              </Text>
                              <Text variant="bodySmall" style={styles.savingsSubtitle}>
                                {formatCurrency(saving.currentAmount)} of {formatCurrency(saving.targetAmount)}
                              </Text>
                              <View style={styles.miniProgressBar}>
                                <View
                                  style={[styles.miniProgressFill, {
                                    width: `${progress * 100}%`
                                  }]}
                                />
                              </View>
                            </View>
                          </View>
                          <MoreHorizontal size={12} color="#6b7280" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Surface>
              </>
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Header Styles
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 15 : 10,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 0,
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonActive: {
    backgroundColor: '#e5e7eb',
  },
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  // Period Selector Styles
  periodSelectorCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#000000',
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  // Summary Card Styles
  summaryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  summaryContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  // Chart Card Styles
  chartCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  chartContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },

  // Pie Chart Styles
  pieChartCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  pieChartContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  pieChartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pieLegend: {
    flex: 1,
    marginLeft: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    flex: 1,
  },
  legendCategory: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000000',
  },
  legendAmount: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 1,
  },
  // Planning Card Styles
  planningCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  planningContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
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
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 0,
    shadowOpacity: 0,
  },
  actionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    backgroundColor: '#f9fafb',
  },
  actionText: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000000',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  // Section Card Styles
  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  sectionContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  // Planning Item Styles
  planningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  planningItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  planningItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  planningIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  planningItemDetails: {
    flex: 1,
  },
  planningTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 1,
    color: '#000000',
  },
  planningSubtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  planningItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planningAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  // Savings Item Styles
  savingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  savingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  savingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  savingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  savingsItemDetails: {
    flex: 1,
  },
  savingsTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 1,
    color: '#000000',
  },
  savingsSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 6,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#000000',
  },
  // Analytics Container
  analyticsContainer: {
    marginBottom: 12,
  },
  // Metrics Card Styles
  metricsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  metricsContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  // Metrics Grid Styles
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 12,
  },
});
