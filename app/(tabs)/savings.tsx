import React, { useState, useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Platform, Animated, Dimensions } from 'react-native';
import { Text, Card, ProgressBar, Surface, IconButton, Searchbar, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { useSavings } from '../../src/hooks/useSavings';
import { formatCurrency } from '../../src/utils/money';
import { formatDate } from '../../src/utils/date';
import { Plus, Target, TrendingUp, Filter, Search, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react-native';

// Enhanced filter interface
interface SavingsFilters {
  search: string;
  status: 'all' | 'active' | 'completed' | 'overdue';
  sortBy: 'date' | 'progress' | 'amount' | 'name';
  sortOrder: 'asc' | 'desc';
}

const { width: screenWidth } = Dimensions.get('window');

export default function SavingsScreen(): React.JSX.Element {
  const { savings } = useSavings();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SavingsFilters>({
    search: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Animation refs
  const filterAnimation = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(1)).current;

  // Enhanced filtering and sorting
  const filteredSavings = useMemo(() => {
    let filtered = [...savings];

    // Search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(saving =>
        saving.title?.toLowerCase().includes(searchLower) ||
        saving.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      const now = new Date();
      filtered = filtered.filter(saving => {
        const progress = saving.currentAmount / saving.targetAmount;
        const isCompleted = progress >= 1;

        if (filters.status === 'completed') return isCompleted;
        if (filters.status === 'active') return !isCompleted;
        if (filters.status === 'overdue') {
          return !isCompleted && saving.dueDate && new Date(saving.dueDate) < now;
        }
        return true;
      });
    }

    // Sort savings
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'date':
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case 'progress':
          aValue = Math.min(a.currentAmount / a.targetAmount, 1);
          bValue = Math.min(b.currentAmount / b.targetAmount, 1);
          break;
        case 'amount':
          aValue = a.targetAmount;
          bValue = b.targetAmount;
          break;
        case 'name':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [savings, searchQuery, filters]);

  // Enhanced statistics
  const savingsStats = useMemo(() => {
    const totalGoals = filteredSavings.length;
    const completedGoals = filteredSavings.filter(s => s.currentAmount >= s.targetAmount).length;
    const totalTargetAmount = filteredSavings.reduce((sum, s) => sum + s.targetAmount, 0);
    const totalCurrentAmount = filteredSavings.reduce((sum, s) => sum + s.currentAmount, 0);
    const averageProgress = totalGoals > 0 ? filteredSavings.reduce((sum, s) => sum + Math.min(s.currentAmount / s.targetAmount, 1), 0) / totalGoals : 0;

    const overdueGoals = filteredSavings.filter(s => {
      if (s.currentAmount >= s.targetAmount) return false;
      return s.dueDate && new Date(s.dueDate) < new Date();
    }).length;

    return {
      totalGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      averageProgress,
      overdueGoals,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
    };
  }, [filteredSavings]);

  // Handlers
  const handleFilterChange = useCallback((key: keyof SavingsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleFilters = useCallback(() => {
    const toValue = showFilters ? 0 : 1;
    setShowFilters(!showFilters);

    Animated.timing(filterAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilters, filterAnimation]);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
    });
    setSearchQuery('');
  }, []);

  const renderSavingsGoal = ({ item }: { item: any }) => {
    const progress = Math.min(item.currentAmount / item.targetAmount, 1);
    const progressPercentage = Math.round(progress * 100);
    const isCompleted = progress >= 1;
    const isOverdue = !isCompleted && item.dueDate && new Date(item.dueDate) < new Date();

    const getStatusColor = () => {
      if (isCompleted) return '#10b981'; // green
      if (isOverdue) return '#ef4444'; // red
      return '#000000'; // black
    };

    const getStatusIcon = () => {
      if (isCompleted) return <CheckCircle size={16} color="#10b981" />;
      if (isOverdue) return <AlertCircle size={16} color="#ef4444" />;
      return <Target size={16} color="#000000" />;
    };

    return (
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => router.push(`/savings/add` as any)}
        activeOpacity={0.7}
      >
        <Surface style={[styles.card, isCompleted && styles.completedCard]} elevation={0}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.titleSection}>
                <View style={[styles.iconContainer, { backgroundColor: isCompleted ? '#d1fae5' : '#f9fafb' }]}>
                  {getStatusIcon()}
                </View>
                <View style={styles.titleContent}>
                  <Text variant="titleLarge" style={[styles.title, isCompleted && styles.completedTitle]}>
                    {item.title}
                  </Text>
                  {isOverdue && (
                    <Text variant="bodySmall" style={styles.overdueText}>
                      Overdue
                    </Text>
                  )}
                </View>
              </View>
              <View style={[styles.percentageBadge, { backgroundColor: isCompleted ? '#10b981' : '#f9fafb' }]}>
                <Text style={[styles.percentageText, { color: isCompleted ? '#ffffff' : '#000000' }]}>
                  {progressPercentage}%
                </Text>
              </View>
            </View>

            <View style={styles.amounts}>
              <Text variant="titleMedium" style={[styles.currentAmount, isCompleted && styles.completedAmount]}>
                {formatCurrency(item.currentAmount)}
              </Text>
              <Text variant="bodyMedium" style={styles.targetAmount}>
                of {formatCurrency(item.targetAmount)}
              </Text>
              {item.dueDate && (
                <Text variant="bodySmall" style={[styles.dueDate, isOverdue && styles.overdueDate]}>
                  Target: {formatDate(item.dueDate)}
                </Text>
              )}
            </View>

            <View style={styles.progressSection}>
              <ProgressBar
                progress={progress}
                color={getStatusColor()}
                style={styles.progressBar}
              />
            </View>

            {item.notes && (
              <Text variant="bodySmall" style={styles.notes}>
                {item.notes}
              </Text>
            )}
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  // Filter panel component
  const renderFilters = () => (
    <Animated.View
      style={[
        styles.filtersContainer,
        {
          height: filterAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 350],
          }),
          opacity: filterAnimation,
        }
      ]}
    >
      <Surface style={styles.filtersCard} elevation={2}>
        <View style={styles.filtersContent}>
          <Text variant="titleMedium" style={styles.filtersTitle}>
            Filters & Sorting
          </Text>

          {/* Status Filter */}
          <View style={styles.filterSection}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Status
            </Text>
            <View style={styles.chipRow}>
              {(['all', 'active', 'completed', 'overdue'] as const).map((status) => (
                <Chip
                  key={status}
                  selected={filters.status === status}
                  onPress={() => handleFilterChange('status', status)}
                  style={styles.filterChip}
                  mode={filters.status === status ? 'flat' : 'outlined'}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Sort By
            </Text>
            <View style={styles.sortRow}>
              <View style={styles.chipRow}>
                {(['date', 'progress', 'amount', 'name'] as const).map((sort) => (
                  <Chip
                    key={sort}
                    selected={filters.sortBy === sort}
                    onPress={() => handleFilterChange('sortBy', sort)}
                    style={styles.filterChip}
                    mode={filters.sortBy === sort ? 'flat' : 'outlined'}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Chip>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                style={styles.sortButton}
              >
                <TrendingUp size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Actions */}
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={toggleFilters}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerAnimation }] }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text variant="headlineLarge" style={styles.screenTitle}>
              Savings Goals
            </Text>
            {filteredSavings.length > 0 && (
              <View style={styles.headerStats}>
                <Text variant="bodySmall" style={styles.savingsCount}>
                  {filteredSavings.length} goals
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={toggleFilters}
              style={[styles.filterButton, showFilters && styles.activeFilterButton]}
            >
              <Filter size={20} color={showFilters ? "#ffffff" : "#6b7280"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/savings/add')}
              style={styles.addButton}
            >
              <Plus size={18} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Enhanced Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search savings goals..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ color: '#000000' }}
          placeholderTextColor="#6b7280"
          icon={() => <Search size={20} color="#6b7280" />}
        />
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Statistics Cards */}
      {filteredSavings.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <Surface style={styles.statCard} elevation={1}>
              <View style={styles.statContent}>
                <DollarSign size={20} color="#000000" />
                <Text variant="bodySmall" style={styles.statLabel}>Total Saved</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {formatCurrency(savingsStats.totalCurrentAmount)}
                </Text>
              </View>
            </Surface>

            <Surface style={styles.statCard} elevation={1}>
              <View style={styles.statContent}>
                <Target size={20} color="#000000" />
                <Text variant="bodySmall" style={styles.statLabel}>Target</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {formatCurrency(savingsStats.totalTargetAmount)}
                </Text>
              </View>
            </Surface>
          </View>

          <View style={styles.statsRow}>
            <Surface style={styles.statCard} elevation={1}>
              <View style={styles.statContent}>
                <CheckCircle size={20} color="#10b981" />
                <Text variant="bodySmall" style={styles.statLabel}>Completed</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {savingsStats.completedGoals}/{savingsStats.totalGoals}
                </Text>
              </View>
            </Surface>

            <Surface style={styles.statCard} elevation={1}>
              <View style={styles.statContent}>
                <AlertCircle size={20} color="#ef4444" />
                <Text variant="bodySmall" style={styles.statLabel}>Overdue</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {savingsStats.overdueGoals}
                </Text>
              </View>
            </Surface>
          </View>
        </View>
      )}

      {/* Savings Goals List */}
      <FlatList
        data={filteredSavings}
        keyExtractor={(item) => item.id}
        renderItem={renderSavingsGoal}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Target size={48} color="#6b7280" />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {searchQuery || filters.status !== 'all' ? 'No goals match your filters' : 'No savings goals yet'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery || filters.status !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first savings goal to start tracking your progress'
              }
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => router.push('/savings/add')}
            >
              <Text style={styles.emptyAddButtonText}>Add Savings Goal</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Enhanced Header Styles
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 20 : 15,
    paddingBottom: 12,
    paddingHorizontal: 16,
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
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 0,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  savingsCount: {
    fontSize: 12,
    opacity: 0.7,
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  activeFilterButton: {
    borderRadius: 20,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  // Search Styles
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchbar: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  // Filter Styles
  filtersContainer: {
    overflow: 'hidden',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  filtersContent: {
    padding: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    margin: 0,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortButton: {
    padding: 8,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Statistics Styles
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  statContent: {
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  // List Styles
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  // Card Styles
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  cardTouchable: {
    marginBottom: 8,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContent: {
    flex: 1,
    marginLeft: 12,
  },
  overdueText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '500',
  },
  completedCard: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  completedTitle: {
    color: '#10b981',
  },
  completedAmount: {
    color: '#10b981',
  },
  overdueDate: {
    color: '#ef4444',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    color: '#000000',
  },
  percentageBadge: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  amounts: {
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  targetAmount: {
    fontSize: 13,
    color: '#6b7280',
  },
  dueDate: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  transactionDate: {
    fontSize: 11,
    color: '#6b7280',
  },
  transactionAccount: {
    fontSize: 11,
    color: '#6b7280',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f3f4f6',
  },
  notes: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  summarySubtitle: {
    fontSize: 11,
    color: '#6b7280',
    opacity: 0.7,
  },
  // Empty State Styles
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  emptyAddButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});