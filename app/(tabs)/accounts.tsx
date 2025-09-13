import React, { useMemo, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Platform, Animated, RefreshControl } from 'react-native';
import { Text, Surface, Searchbar, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useTransactions } from '../../src/hooks/useTransactions';
import { AccountCard } from '../../src/components/AccountCard';
import { calculateBalance } from '../../src/utils/money';
import { formatCurrency } from '../../src/utils/money';
import { 
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown,
  CreditCard,
  Building2,
  Target
} from 'lucide-react-native';

// Enhanced filter interface
interface AccountFilters {
  search: string;
  sortBy: 'name' | 'balance' | 'transactions';
  sortOrder: 'asc' | 'desc';
  showEmpty: boolean;
}

export default function AccountsScreen(): React.JSX.Element {
  const { accounts } = useAccounts();
  const { transactions, loading } = useTransactions();

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AccountFilters>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showEmpty: false,
  });

  // Animation refs
  const filterAnimation = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(1)).current;

  // Get all unique sheetName values from transactions with enhanced filtering
  const sheetAccounts = useMemo(() => {
    const sheetMap = new Map<string, {
      name: string;
      balance: number;
      transactionCount: number;
      totalIncome: number;
      totalExpenses: number;
      lastTransactionDate?: Date;
    }>();

    transactions.forEach(tx => {
      const sheetName = (tx as any).sheetName;
      if (!sheetName) return;

      // Skip excluded accounts
      if (sheetName === 'TEB Starkertela' || sheetName === 'TEB STARKARTELA' || sheetName === 'Test Sheet 1') return;

      if (!sheetMap.has(sheetName)) {
        sheetMap.set(sheetName, {
          name: sheetName,
          balance: 0,
          transactionCount: 0,
          totalIncome: 0,
          totalExpenses: 0,
          lastTransactionDate: undefined,
        });
      }

      const sheet = sheetMap.get(sheetName)!;
      sheet.balance += tx.amount;
      sheet.transactionCount += 1;
      
      if (tx.amount > 0) {
        sheet.totalIncome += tx.amount;
      } else {
        sheet.totalExpenses += Math.abs(tx.amount);
      }

      // Track last transaction date
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
      if (!sheet.lastTransactionDate || txDate > sheet.lastTransactionDate) {
        sheet.lastTransactionDate = txDate;
      }
    });

    let filtered = Array.from(sheetMap.values());

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(sheet =>
        sheet.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply empty filter
    if (!filters.showEmpty) {
      filtered = filtered.filter(sheet => sheet.transactionCount > 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'balance':
          aValue = Math.abs(a.balance);
          bValue = Math.abs(b.balance);
          break;
        case 'transactions':
          aValue = a.transactionCount;
          bValue = b.transactionCount;
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
  }, [transactions, filters]);

  // Calculate total balance across all sheets
  const totalBalance = useMemo(() => {
    return sheetAccounts.reduce((sum, sheet) => sum + sheet.balance, 0);
  }, [sheetAccounts]);

  // Calculate total transactions count
  const totalTransactions = useMemo(() => {
    return sheetAccounts.reduce((sum, sheet) => sum + sheet.transactionCount, 0);
  }, [sheetAccounts]);

  // Enhanced statistics
  const accountStats = useMemo(() => {
    const totalIncome = sheetAccounts.reduce((sum, sheet) => sum + sheet.totalIncome, 0);
    const totalExpenses = sheetAccounts.reduce((sum, sheet) => sum + sheet.totalExpenses, 0);
    const netAmount = totalIncome - totalExpenses;
    const activeAccounts = sheetAccounts.filter(sheet => sheet.transactionCount > 0).length;
    const emptyAccounts = sheetAccounts.filter(sheet => sheet.transactionCount === 0).length;

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      activeAccounts,
      emptyAccounts,
      totalAccounts: sheetAccounts.length,
    };
  }, [sheetAccounts]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleFilterChange = useCallback((key: keyof AccountFilters, value: any) => {
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
      sortBy: 'name',
      sortOrder: 'asc',
      showEmpty: false,
    });
  }, []);

  const renderSheetAccount = ({ item }: { item: any }) => {
    const isPositive = item.balance >= 0;
    const isEmpty = item.transactionCount === 0;
    
    const getAccountIcon = () => {
      if (isEmpty) return <Building2 size={20} color="#6b7280" />;
      if (item.name.toLowerCase().includes('savings')) return <Target size={20} color="#6b7280" />;
      if (item.name.toLowerCase().includes('credit')) return <CreditCard size={20} color="#6b7280" />;
      return <Wallet size={20} color="#6b7280" />;
    };

    const formatLastTransaction = () => {
      if (!item.lastTransactionDate) return 'No transactions';
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - item.lastTransactionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} weeks ago`;
    };

    return (
      <TouchableOpacity
        style={[styles.sheetCard, isEmpty && styles.emptyCard]}
        onPress={() => {
          // Navigate to transactions filtered by this sheet
          router.push({
            pathname: '/transactions',
            params: { filterAccount: item.name }
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.sheetHeader}>
          <View style={[styles.sheetIcon, isEmpty && styles.emptyIcon]}>
            {getAccountIcon()}
          </View>
          <View style={styles.sheetInfo}>
            <Text variant="titleMedium" style={[styles.sheetName, isEmpty && styles.emptyText]}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.sheetMeta}>
              {item.transactionCount === 0 
                ? 'No transactions' 
                : `${item.transactionCount} transactions • ${formatLastTransaction()}`
              }
            </Text>
          </View>
          <View style={styles.sheetBalance}>
            <Text 
              variant="titleLarge" 
              style={[
                styles.balanceText, 
                { color: isEmpty ? '#6b7280' : (isPositive ? '#000000' : '#dc2626') }
              ]}
            >
              {formatCurrency(item.balance)}
            </Text>
            {!isEmpty && (
              <Text variant="bodySmall" style={styles.balanceIndicator}>
                {isPositive ? 'Positive' : 'Negative'}
              </Text>
            )}
          </View>
        </View>
        
      </TouchableOpacity>
    );
  };

  const renderAccount = ({ item }: { item: any }) => (
    <AccountCard
      account={item}
      balance={calculateBalance(transactions, item.id)}
      onPress={() => router.push(`/accounts/${item.id}`)}
      onEdit={() => router.push(`/accounts/${item.id}/edit`)}
    />
  );

  // Filter panel component
  const renderFilters = () => (
    <Animated.View 
      style={[
        styles.filtersContainer,
        {
          height: filterAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 300],
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

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Sort By
            </Text>
            <View style={styles.sortRow}>
              <View style={styles.chipRow}>
                {(['name', 'balance', 'transactions'] as const).map((sort) => (
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
                <ArrowUpDown size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Show Empty Accounts */}
          <View style={styles.filterSection}>
            <Text variant="bodyMedium" style={styles.filterLabel}>
              Show Empty Accounts
            </Text>
            <Chip
              selected={filters.showEmpty}
              onPress={() => handleFilterChange('showEmpty', !filters.showEmpty)}
              style={styles.filterChip}
              mode={filters.showEmpty ? 'flat' : 'outlined'}
            >
              {filters.showEmpty ? 'Hide Empty' : 'Show Empty'}
            </Chip>
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
              Accounts
            </Text>
            {sheetAccounts.length > 0 && (
              <View style={styles.headerStats}>
                <Text variant="bodySmall" style={styles.accountsCount}>
                  {accountStats.activeAccounts} active • {accountStats.emptyAccounts} empty
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
              onPress={() => router.push('/accounts/add')}
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
          placeholder="Search accounts..."
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

      {/* Summary Card */}
      <Surface style={styles.summaryCard} elevation={1}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryIcon}>
            <Wallet size={20} color="#000000" />
          </View>
          <View style={styles.summaryText}>
            <Text variant="bodySmall" style={styles.summaryLabel}>
              Total Balance
            </Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(totalBalance)}
            </Text>
            <Text variant="bodySmall" style={styles.summarySubtitle}>
              {accountStats.totalAccounts} accounts • {totalTransactions} transactions
            </Text>
          </View>
        </View>
      </Surface>


      {/* Sheet Accounts Section */}
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Transaction Sheets
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading accounts...
            </Text>
          </View>
        ) : sheetAccounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Wallet size={48} color="#6b7280" />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {filters.search || filters.showEmpty ? 'No accounts match your filters' : 'No accounts yet'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              {filters.search || filters.showEmpty
                ? 'Try adjusting your search or filters'
                : 'Add your first transaction to create an account'
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
          <FlatList
            data={sheetAccounts}
            keyExtractor={(item) => item.name}
            renderItem={renderSheetAccount}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#000000']}
                tintColor="#000000"
              />
            }
          />
        )}

        {/* Regular Accounts Section (if any) */}
        {accounts.length > 0 && (
          <>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Regular Accounts
            </Text>
            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id}
              renderItem={renderAccount}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
      </View>
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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  accountsCount: {
    fontSize: 12,
    opacity: 0.7,
    color: '#6b7280',
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
  activeFilterButton: {
    backgroundColor: '#000000',
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
  },
  applyButton: {
    flex: 1,
  },
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Summary Card Styles
  summaryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 12,
    marginHorizontal: 16,
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
    backgroundColor: '#f9fafb',
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
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 1,
    color: '#000000',
  },
  summarySubtitle: {
    fontSize: 11,
    opacity: 0.7,
    color: '#6b7280',
  },
  // Section Styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  // Sheet Card Styles
  sheetCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  sheetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sheetInfo: {
    flex: 1,
  },
  sheetName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    color: '#000000',
  },
  sheetMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  sheetBalance: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceIndicator: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  // Empty and Loading States
  emptyCard: {
    opacity: 0.6,
  },
  emptyIcon: {
    backgroundColor: '#f3f4f6',
  },
  emptyText: {
    color: '#6b7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6b7280',
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
    color: '#000000',
  },
  emptyDescription: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    lineHeight: 18,
    color: '#6b7280',
  },
  emptyAddButton: {
    marginTop: 4,
  },
});