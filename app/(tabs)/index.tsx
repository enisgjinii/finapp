import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, SegmentedButtons, useTheme as usePaperTheme, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useAuth } from '../../src/providers/AuthProvider';
import { useCurrency } from '../../src/providers/CurrencyProvider';
import { calculateBalance } from '../../src/utils/money';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  Target,
  Calendar,
  MoreHorizontal
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen(): React.JSX.Element {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const theme = usePaperTheme();
  const { user } = useAuth();
  const { formatCurrency, primaryCurrency } = useCurrency();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  const years = Array.from(
    new Set(transactions
      .filter(tx => tx.date)
      .map(tx => (tx.date instanceof Date ? tx.date : new Date(tx.date)).getFullYear()))
  ).sort((a, b) => b - a);

  const currentYearTransactions = transactions.filter(
    tx => tx.date && (tx.date instanceof Date ? tx.date : new Date(tx.date)).getFullYear() === selectedYear
  );

  const totalIncome = currentYearTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = Math.abs(currentYearTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));

  const netIncome = totalIncome - totalExpenses;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + calculateBalance(transactions, account.id);
  }, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Compact Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text variant="titleMedium" style={[styles.greeting, { color: theme.colors.onBackground }]}>
                {getGreeting()}
              </Text>
              <Text variant="headlineSmall" style={[styles.userName, { color: theme.colors.onBackground }]}>
                {user?.displayName || 'User'}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text variant="bodySmall" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              <IconButton
                icon="bell-outline"
                size={20}
                iconColor={theme.colors.onBackground}
                onPress={() => {}}
                style={styles.notificationButton}
              />
            </View>
          </View>
        </View>

        {/* Compact Total Balance Card */}
        <Card style={[styles.balanceCard, { 
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary
        }]}>
          <Card.Content style={styles.balanceContent}>
            <View style={styles.balanceHeader}>
              <Text variant="bodySmall" style={[styles.balanceLabel, { color: theme.colors.onPrimary }]}>
                Total Balance
              </Text>
              <Chip 
                mode="outlined" 
                textStyle={{ color: theme.colors.onPrimary, fontSize: 12 }}
                style={[styles.currencyChip, { borderColor: theme.colors.onPrimary }]}
                compact
              >
                {primaryCurrency}
              </Chip>
            </View>
            <Text variant="headlineLarge" style={[styles.totalBalance, { color: theme.colors.onPrimary }]}>
              {formatCurrency(totalBalance)}
            </Text>
            <View style={styles.balanceChange}>
              <TrendingUp size={12} color={theme.colors.onPrimary} />
              <Text variant="bodySmall" style={[styles.changeText, { color: theme.colors.onPrimary }]}>
                +12.5% from last month
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Compact Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/transactions/add')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryContainer }]}>
              <Plus size={14} color={theme.colors.primary} />
            </View>
            <Text variant="bodySmall" style={[styles.actionText, { color: theme.colors.onSurface }]}>
              Add
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/accounts/add')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
              <CreditCard size={14} color={theme.colors.secondary} />
            </View>
            <Text variant="bodySmall" style={[styles.actionText, { color: theme.colors.onSurface }]}>
              Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/savings/add')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Target size={14} color={theme.colors.tertiary} />
            </View>
            <Text variant="bodySmall" style={[styles.actionText, { color: theme.colors.onSurface }]}>
              Savings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/reports')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
              <TrendingUp size={14} color={theme.colors.onSurfaceVariant} />
            </View>
            <Text variant="bodySmall" style={[styles.actionText, { color: theme.colors.onSurface }]}>
              Reports
            </Text>
          </TouchableOpacity>
        </View>

        {/* Compact Financial Overview */}
        <Card style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.overviewContent}>
            <View style={styles.overviewHeader}>
              <Text variant="titleMedium" style={[styles.overviewTitle, { color: theme.colors.onSurface }]}>
                Overview
              </Text>
              {years.length > 0 && (
                <SegmentedButtons
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                  buttons={years.slice(0, 3).map(year => ({
                    value: year.toString(),
                    label: year.toString(),
                  }))}
                  style={styles.yearSelector}
                />
              )}
            </View>

            <View style={styles.overviewGrid}>
              <View style={[styles.overviewItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.overviewItemHeader}>
                  <ArrowUpRight size={14} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={[styles.overviewLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Income
                  </Text>
                </View>
                <Text variant="titleLarge" style={[styles.overviewAmount, { color: theme.colors.primary }]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>

              <View style={[styles.overviewItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.overviewItemHeader}>
                  <ArrowDownLeft size={14} color={theme.colors.error} />
                  <Text variant="bodySmall" style={[styles.overviewLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Expenses
                  </Text>
                </View>
                <Text variant="titleLarge" style={[styles.overviewAmount, { color: theme.colors.error }]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>

              <View style={[styles.overviewItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.overviewItemHeader}>
                  <TrendingUp size={14} color={netIncome >= 0 ? theme.colors.primary : theme.colors.error} />
                  <Text variant="bodySmall" style={[styles.overviewLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Net
                  </Text>
                </View>
                <Text variant="titleLarge" style={[styles.overviewAmount, { color: netIncome >= 0 ? theme.colors.primary : theme.colors.error }]}>
                  {formatCurrency(netIncome)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Compact Accounts Section */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Accounts
          </Text>
          <TouchableOpacity onPress={() => router.push('/accounts')}>
            <Text variant="bodySmall" style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {accounts.slice(0, 2).map(account => {
          const balance = calculateBalance(transactions, account.id);
          return (
            <Card 
              key={account.id}
              style={[styles.accountCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push(`/accounts/${account.id}`)}
            >
              <Card.Content style={styles.accountContent}>
                <View style={styles.accountInfo}>
                  <View style={[styles.accountIcon, { backgroundColor: account.color || theme.colors.primaryContainer }]}>
                    <Wallet size={14} color={account.color || theme.colors.primary} />
                  </View>
                  <View style={styles.accountDetails}>
                    <Text variant="bodyLarge" style={[styles.accountName, { color: theme.colors.onSurface }]}>
                      {account.name}
                    </Text>
                    <Text variant="bodySmall" style={[styles.accountCurrency, { color: theme.colors.onSurfaceVariant }]}>
                      {account.currency}
                    </Text>
                  </View>
                </View>
                <View style={styles.accountBalance}>
                  <Text variant="titleMedium" style={[styles.balanceAmount, { color: balance >= 0 ? theme.colors.primary : theme.colors.error }]}>
                    {formatCurrency(balance, account.currency as any)}
                  </Text>
                  <MoreHorizontal size={12} color={theme.colors.onSurfaceVariant} />
                </View>
              </Card.Content>
            </Card>
          );
        })}

        {/* Compact Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Recent
          </Text>
          <TouchableOpacity onPress={() => router.push('/transactions')}>
            <Text variant="bodySmall" style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <Card style={[styles.transactionsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.transactionsContent}>
            {transactions.slice(0, 3).map((transaction, index) => {
              const account = accounts.find(a => a.id === transaction.accountId);
              const isLast = index === transactions.slice(0, 3).length - 1;
              
              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={[styles.transactionItem, !isLast && { borderBottomColor: theme.colors.outlineVariant }]}
                  onPress={() => router.push(`/transactions/${transaction.id}`)}
                >
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon, 
                      { backgroundColor: transaction.amount >= 0 ? theme.colors.primaryContainer : theme.colors.errorContainer }
                    ]}>
                      {transaction.amount >= 0 ? (
                        <ArrowUpRight size={12} color={theme.colors.primary} />
                      ) : (
                        <ArrowDownLeft size={12} color={theme.colors.error} />
                      )}
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text variant="bodyMedium" style={[styles.transactionDescription, { color: theme.colors.onSurface }]}>
                        {transaction.description || 'No description'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.transactionMeta, { color: theme.colors.onSurfaceVariant }]}>
                        {transaction.date ? (transaction.date instanceof Date ? transaction.date : new Date(transaction.date)).toLocaleDateString() : 'Invalid Date'} • {account?.name || 'Unknown Account'}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyLarge" style={[
                    styles.transactionAmount,
                    { color: transaction.amount >= 0 ? theme.colors.primary : theme.colors.error }
                  ]}>
                    {transaction.amount >= 0 ? '' : '-'}{formatCurrency(Math.abs(transaction.amount), account?.currency as any)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  
  // Compact Header Styles
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.8,
    marginBottom: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  notificationButton: {
    margin: 0,
  },

  // Compact Balance Card Styles
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  balanceContent: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.9,
  },
  currencyChip: {
    height: 20,
  },
  totalBalance: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Compact Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 6,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Compact Overview Styles
  overviewCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  overviewContent: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  yearSelector: {
    flex: 0.5,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  overviewItem: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  overviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  overviewLabel: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  overviewAmount: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Compact Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Compact Account Cards
  accountCard: {
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  accountContent: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  accountCurrency: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.7,
  },
  accountBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Compact Transactions
  transactionsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  transactionsContent: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  transactionIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 1,
  },
  transactionMeta: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },


  // Compact Bottom Spacer
  bottomSpacer: {
    height: 16,
  },
});