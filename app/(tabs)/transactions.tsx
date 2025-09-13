import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { 
  Text, 
  Card, 
  useTheme, 
  IconButton, 
  FAB, 
  Chip, 
  Searchbar, 
  ActivityIndicator, 
  Button,
  Surface,
  Divider,
  Badge
} from 'react-native-paper';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useInstallments } from '../../src/hooks/useInstallments';
import { useSavings } from '../../src/hooks/useSavings';
import { formatCurrency } from '../../src/utils/money';
import { 
  Receipt, 
  Plus, 
  Building2, 
  Target, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Upload, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  ArrowUpDown, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wallet,
  PieChart,
  BarChart3
} from 'lucide-react-native';
import { Transaction } from '../../src/types';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced transaction filters interface
interface TransactionFilters {
  search: string;
  type: 'all' | 'income' | 'expense';
  account: string;
  dateRange: 'all' | 'week' | 'month' | 'year' | 'custom';
  sortBy: 'date' | 'amount' | 'description' | 'category';
  sortOrder: 'asc' | 'desc';
  category?: string;
}

// Performance optimized transaction item component
const TransactionItem = React.memo<{
  transaction: Transaction;
  account: any;
  onPress: () => void;
  theme: any;
}>(({ transaction, account, onPress, theme }) => {
  const isIncome = transaction.amount > 0;
  const amountColor = isIncome ? '#000000' : '#dc2626'; // Black for income, red for expenses
  
  const getTransactionIcon = () => {
    if (transaction.source === 'installment') return 'credit-card';
    if (transaction.source === 'transfer') return 'swap-horizontal';
    return isIncome ? 'trending-up' : 'trending-down';
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.transactionContent}>
        <View style={[styles.transactionIcon, {
          backgroundColor: '#f9fafb'
        }]}>
          {isIncome ? (
            <TrendingUp size={18} color="#000000" />
          ) : (
            <TrendingDown size={18} color="#dc2626" />
          )}
        </View>

        <View style={styles.transactionDetails}>
          <Text
            variant="bodyMedium"
            style={styles.transactionTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {transaction.description || transaction.category || 'Transaction'}
          </Text>

          <View style={styles.transactionMeta}>
            <Text
              variant="bodySmall"
              style={styles.transactionDate}
            >
              {formatDate(transaction.date)}
            </Text>
            {account && (
              <Text
                variant="bodySmall"
                style={styles.transactionAccount}
              >
                • {account.name}
              </Text>
            )}
          </View>

          {transaction.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {transaction.category}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.transactionAmount}>
          <Text
            variant="titleMedium"
            style={[styles.amountText, { color: amountColor }]}
          >
            {isIncome ? '' : '-'}{formatCurrency(Math.abs(transaction.amount))}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Enhanced summary card component
const SummaryCard = React.memo<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  theme: any;
  subtitle?: string;
}>(({ title, value, icon, color, theme, subtitle }) => (
  <Surface style={styles.summaryCard} elevation={1}>
    <View style={styles.summaryContent}>
      <View style={styles.summaryIcon}>
        {icon}
      </View>
      <View style={styles.summaryText}>
        <Text variant="bodySmall" style={styles.summaryLabel}>
          {title}
        </Text>
        <Text variant="headlineSmall" style={styles.summaryValue}>
          {value}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={styles.summarySubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  </Surface>
));

export default function TransactionsScreen(): React.JSX.Element {
  const theme = useTheme();
  const { transactions: allTransactions, loading } = useTransactions();
  const { accounts } = useAccounts();
  const { installments } = useInstallments();
  const { savings } = useSavings();

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'all',
    account: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    category: undefined
  });

  // Animation refs
  const filterAnimation = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(1)).current;

  // Calculate total balance with memoization
  const totalBalance = useMemo(() =>
    accounts.reduce((sum, account) => sum + (account.balanceComputed || 0), 0),
    [accounts]
  );

  // Enhanced filtering and sorting with performance optimization
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(tx => {
        const sheetName = (tx as any).sheetName;
        const accountName = accounts.find(a => a.id === tx.accountId)?.name;
        
        return tx.description?.toLowerCase().includes(searchLower) ||
        tx.category?.toLowerCase().includes(searchLower) ||
               tx.amount.toString().includes(searchLower) ||
               sheetName?.toLowerCase().includes(searchLower) ||
               accountName?.toLowerCase().includes(searchLower);
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(tx =>
        filters.type === 'income' ? tx.amount > 0 : tx.amount < 0
      );
    }

    // Account filter
    if (filters.account !== 'all') {
      filtered = filtered.filter(tx => {
        const sheetName = (tx as any).sheetName;
        const accountName = accounts.find(a => a.id === tx.accountId)?.name;
        return sheetName === filters.account || accountName === filters.account;
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(tx => tx.category === filters.category);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(tx => {
        const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
        return !isNaN(txDate.getTime()) && txDate >= filterDate;
      });
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'date':
          aValue = a.date instanceof Date ? a.date : new Date(a.date);
          bValue = b.date instanceof Date ? b.date : new Date(b.date);
          // Handle invalid dates by putting them at the end
          if (isNaN(aValue.getTime())) aValue = new Date(0);
          if (isNaN(bValue.getTime())) bValue = new Date(0);
          break;
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
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
  }, [allTransactions, filters, accounts]);

  // Paginated transactions
  const displayedTransactions = useMemo(() =>
    filteredTransactions.slice(0, displayCount),
    [filteredTransactions, displayCount]
  );

  // Enhanced summary stats
  const summaryStats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpenses = Math.abs(filteredTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0));

    const netAmount = totalIncome - totalExpenses;
    const transactionCount = filteredTransactions.length;

    // Calculate average transaction amount
    const avgAmount = transactionCount > 0 ? Math.abs(netAmount) / transactionCount : 0;

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount,
      avgAmount
    };
  }, [filteredTransactions]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    allTransactions.forEach(tx => {
      if (tx.category) categorySet.add(tx.category);
    });
    return Array.from(categorySet).sort();
  }, [allTransactions]);

  // Get unique account names (sheetName + account names) for filtering
  const accountNames = useMemo(() => {
    const accountSet = new Set<string>();
    
    // Add sheetName values from transactions
    allTransactions.forEach(tx => {
      const sheetName = (tx as any).sheetName;
      if (sheetName) accountSet.add(sheetName);
    });
    
    // Add account names from accounts
    accounts.forEach(account => {
      if (account.name) accountSet.add(account.name);
    });
    
    return Array.from(accountSet).sort();
  }, [allTransactions, accounts]);

  // Handlers with performance optimization
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + 50, filteredTransactions.length));
  }, [filteredTransactions.length]);

  const handleFilterChange = useCallback((key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setDisplayCount(50);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      account: 'all',
      dateRange: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      category: undefined
    });
    setDisplayCount(50);
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

  // Render transaction item with memoization
  const renderTransactionItem = useCallback(({ item: transaction }: { item: Transaction }) => {
    // Use sheetName as account name, fallback to accountId lookup
    const accountName = (transaction as any).sheetName || 
                       accounts.find(a => a.id === transaction.accountId)?.name || 
                       'Unknown Account';

  return (
      <TransactionItem
        transaction={transaction}
        account={{ name: accountName }}
        onPress={() => router.push(`/transactions/${transaction.id}`)}
        theme={theme}
      />
    );
  }, [accounts, theme]);

  // Render filter section
  const renderFilters = () => (
    <Animated.View 
      style={[
        styles.filtersContainer,
        {
          height: filterAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 400],
          }),
          opacity: filterAnimation,
        }
      ]}
    >
      <Surface style={styles.filtersCard} elevation={2}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.filtersContent}>
              <Text variant="titleMedium" style={styles.filtersTitle}>
              Filters & Sorting
              </Text>

            {/* Type Filter */}
            <View style={styles.filterSection}>
                <Text variant="bodyMedium" style={styles.filterLabel}>
                Transaction Type
                </Text>
              <View style={styles.chipRow}>
                  {(['all', 'income', 'expense'] as const).map((type) => (
                    <Chip
                      key={type}
                      selected={filters.type === type}
                      onPress={() => handleFilterChange('type', type)}
                      style={styles.filterChip}
                    mode={filters.type === type ? 'flat' : 'outlined'}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Chip>
                  ))}
                </View>
              </View>

            {/* Account Filter */}
            <View style={styles.filterSection}>
                <Text variant="bodyMedium" style={styles.filterLabel}>
                Account
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountScroll}>
                  <Chip
                    selected={filters.account === 'all'}
                    onPress={() => handleFilterChange('account', 'all')}
                    style={styles.filterChip}
                  mode={filters.account === 'all' ? 'flat' : 'outlined'}
                  >
                    All Accounts
                  </Chip>
                {accountNames.map((accountName) => (
                    <Chip
                    key={accountName}
                    selected={filters.account === accountName}
                    onPress={() => handleFilterChange('account', accountName)}
                      style={styles.filterChip}
                    mode={filters.account === accountName ? 'flat' : 'outlined'}
                    >
                    {accountName}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
                <Text variant="bodyMedium" style={styles.filterLabel}>
                Date Range
                </Text>
              <View style={styles.chipRow}>
                  {(['all', 'week', 'month', 'year'] as const).map((range) => (
                    <Chip
                      key={range}
                      selected={filters.dateRange === range}
                      onPress={() => handleFilterChange('dateRange', range)}
                      style={styles.filterChip}
                    mode={filters.dateRange === range ? 'flat' : 'outlined'}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Chip>
                  ))}
                </View>
              </View>

            {/* Category Filter */}
            {categories.length > 0 && (
              <View style={styles.filterSection}>
                <Text variant="bodyMedium" style={styles.filterLabel}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  <Chip
                    selected={!filters.category}
                    onPress={() => handleFilterChange('category', undefined)}
                    style={styles.filterChip}
                    mode={!filters.category ? 'flat' : 'outlined'}
                  >
                    All Categories
                  </Chip>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      selected={filters.category === category}
                      onPress={() => handleFilterChange('category', category)}
                      style={styles.filterChip}
                      mode={filters.category === category ? 'flat' : 'outlined'}
                    >
                      {category}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text variant="bodyMedium" style={styles.filterLabel}>
                Sort By
              </Text>
              <View style={styles.sortRow}>
                <View style={styles.chipRow}>
                  {(['date', 'amount', 'description', 'category'] as const).map((sort) => (
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
                <IconButton
                  icon={filters.sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                  size={20}
                  onPress={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                />
              </View>
            </View>

            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <Button 
                mode="outlined" 
                onPress={resetFilters} 
                style={styles.resetButton}
                icon="refresh"
              >
                Reset
                </Button>
              <Button 
                mode="contained" 
                onPress={toggleFilters}
                style={styles.applyButton}
              >
                  Apply
                </Button>
              </View>
      </View>
        </ScrollView>
      </Surface>
    </Animated.View>
  );

  // Error state - removed since error is not available from useTransactions hook

  return (
    <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
      {/* Enhanced Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerAnimation }] }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text variant="headlineLarge" style={styles.screenTitle}>
              Transactions
                </Text>
          </View>

          <View style={styles.headerActions}>
            <IconButton
              icon={() => <Filter size={24} color="#6b7280" />}
              size={24}
              onPress={toggleFilters}
              style={[showFilters && styles.activeFilterButton, { backgroundColor: showFilters ? '#f9fafb' : 'transparent' }]}
            />
              </View>
        </View>
      </Animated.View>

      {/* Enhanced Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search transactions, accounts, categories..."
          onChangeText={(text) => handleFilterChange('search', text)}
          value={filters.search}
          style={styles.searchbar}
          inputStyle={{ color: '#000000' }}
          placeholderTextColor="#6b7280"
          icon={() => <Search size={20} color="#6b7280" />}
        />
      </View>

      {/* Filters */}
      {renderFilters()}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
      >
        {/* Enhanced Summary Cards */}
        <View style={styles.summarySection}>
          <SummaryCard
            title="Total Balance"
            value={formatCurrency(totalBalance)}
            icon={<Wallet size={20} color="#000000" />}
            color="#000000"
            theme={theme}
            subtitle={`${accounts.length} accounts`}
          />

          <SummaryCard
            title="Net This Period"
            value={formatCurrency(summaryStats.netAmount)}
            icon={summaryStats.netAmount >= 0 ?
              <TrendingUp size={20} color="#000000" /> :
              <TrendingDown size={20} color="#dc2626" />
            }
            color={summaryStats.netAmount >= 0 ? '#000000' : '#dc2626'}
            theme={theme}
            subtitle={`${summaryStats.transactionCount} transactions`}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Surface style={styles.statCard} elevation={1}>
            <View style={styles.statContent}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Income
                </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: '#000000' }]}>
                {formatCurrency(summaryStats.totalIncome)}
                </Text>
              </View>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <View style={styles.statContent}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Expenses
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: '#dc2626' }]}>
                {formatCurrency(summaryStats.totalExpenses)}
              </Text>
            </View>
          </Surface>
        </View>

        {/* Transactions List */}
        <Surface style={styles.transactionsCard} elevation={1}>
            <View style={styles.transactionsHeader}>
              <Text variant="titleLarge" style={styles.transactionsTitle}>
              Recent Transactions
              </Text>
              <TouchableOpacity
              onPress={() => router.push('/transactions/add')}
              style={styles.addButton}
            >
              <Plus size={18} color="#000000" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Loading transactions...
                </Text>
              </View>
            ) : displayedTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Receipt size={48} color="#6b7280" />
                <Text variant="headlineSmall" style={styles.emptyTitle}>
                  No transactions found
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {filteredTransactions.length === 0 && allTransactions.length > 0
                  ? 'Try adjusting your filters to see more results'
                    : 'Add your first transaction to get started'
                  }
                </Text>
                <Button
                  mode="contained"
                  onPress={() => router.push('/transactions/add')}
                style={styles.emptyAddButton}
                icon="plus"
                >
                  Add Transaction
                </Button>
              </View>
            ) : (
            <View style={styles.transactionsList}>
              {displayedTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  account={accounts.find(a => a.id === transaction.accountId)}
                  onPress={() => router.push(`/transactions/${transaction.id}`)}
                  theme={theme}
                />
              ))}
              
              {displayedTransactions.length < filteredTransactions.length && (
                    <View style={styles.loadMoreContainer}>
                      <Button
                        mode="outlined"
                        onPress={handleLoadMore}
                        style={styles.loadMoreButton}
                    icon="chevron-down"
                      >
                        Load More ({filteredTransactions.length - displayedTransactions.length} remaining)
                      </Button>
                    </View>
            )}
      </View>
          )}
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  activeFilterButton: {
    borderRadius: 20,
  },
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
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
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
  accountScroll: {
    marginHorizontal: -4,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summarySection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 1,
  },
  summarySubtitle: {
    fontSize: 11,
    opacity: 0.7,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
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
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 16,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  transactionsList: {
    padding: 16,
    paddingTop: 0,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    marginBottom: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
  },
  transactionAccount: {
    fontSize: 11,
  },
  categoryBadge: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    minWidth: 180,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    lineHeight: 18,
  },
  emptyAddButton: {
    marginTop: 4,
  },
});