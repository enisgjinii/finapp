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
    new Set(transactions.map(tx => tx.date.getFullYear()))
  ).sort((a, b) => b - a);

  const currentYearTransactions = transactions.filter(
    tx => tx.date.getFullYear() === selectedYear
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
              <TrendingUp size={14} color={theme.colors.onPrimary} />
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
              <Plus size={16} color={theme.colors.primary} />
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
              <CreditCard size={16} color={theme.colors.secondary} />
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
              <Target size={16} color={theme.colors.tertiary} />
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
              <TrendingUp size={16} color={theme.colors.onSurfaceVariant} />
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
                  <ArrowUpRight size={16} color={theme.colors.primary} />
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
                  <ArrowDownLeft size={16} color={theme.colors.error} />
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
                  <TrendingUp size={16} color={netIncome >= 0 ? theme.colors.primary : theme.colors.error} />
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
                    <Wallet size={16} color={account.color || theme.colors.primary} />
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
                  <MoreHorizontal size={14} color={theme.colors.onSurfaceVariant} />
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
                        <ArrowUpRight size={14} color={theme.colors.primary} />
                      ) : (
                        <ArrowDownLeft size={14} color={theme.colors.error} />
                      )}
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text variant="bodyMedium" style={[styles.transactionDescription, { color: theme.colors.onSurface }]}>
                        {transaction.description || 'No description'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.transactionMeta, { color: theme.colors.onSurfaceVariant }]}>
                        {transaction.date.toLocaleDateString()} • {account?.name || 'Unknown Account'}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyLarge" style={[
                    styles.transactionAmount,
                    { color: transaction.amount >= 0 ? theme.colors.primary : theme.colors.error }
                  ]}>
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount), account?.currency as any)}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
    gap: 8,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationButton: {
    margin: 0,
  },

  // Compact Balance Card Styles
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  balanceContent: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
  currencyChip: {
    height: 24,
  },
  totalBalance: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Compact Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Compact Overview Styles
  overviewCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  overviewContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  yearSelector: {
    flex: 0.5,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  overviewItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  overviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  overviewLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  overviewAmount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Compact Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Compact Account Cards
  accountCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  accountContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
  },
  accountCurrency: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.7,
  },
  accountBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Compact Transactions
  transactionsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  transactionsContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  transactionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 1,
  },
  transactionMeta: {
    fontSize: 11,
    fontWeight: '400',
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },


  // Compact Bottom Spacer
  bottomSpacer: {
    height: 20,
  },
});