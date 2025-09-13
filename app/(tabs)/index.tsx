import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useAuth } from '../../src/providers/AuthProvider';
import { useCurrency } from '../../src/providers/CurrencyProvider';
import { calculateBalance } from '../../src/utils/money';
import { 
  TrendingUp, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  Target,
  MoreHorizontal,
  Building2
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { formatCurrency, primaryCurrency } = useCurrency();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  // Get all unique sheetName values from transactions (same logic as accounts screen)
  const sheetAccounts = useMemo(() => {
    const sheetMap = new Map<string, {
      name: string;
      balance: number;
      transactionCount: number;
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
        });
      }

      const sheet = sheetMap.get(sheetName)!;
      sheet.balance += tx.amount;
      sheet.transactionCount += 1;
    });

    return Array.from(sheetMap.values()).filter(sheet => sheet.transactionCount > 0);
  }, [transactions]);

  const totalBalance = sheetAccounts.reduce((sum, sheet) => sum + sheet.balance, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text variant="headlineLarge" style={styles.screenTitle}>
              Dashboard
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Total Balance Card */}
        <Surface style={styles.balanceCard}>
          <View style={styles.balanceContent}>
            <View style={styles.balanceHeader}>
              <Text variant="bodySmall" style={styles.balanceLabel}>
                Total Balance
              </Text>
              <Chip 
                mode="outlined" 
                textStyle={{ color: '#000000', fontSize: 12 }}
                style={styles.currencyChip}
                compact
              >
                {primaryCurrency}
              </Chip>
            </View>
            <Text variant="headlineLarge" style={styles.totalBalance}>
              {formatCurrency(totalBalance)}
            </Text>
            <View style={styles.balanceChange}>
              <TrendingUp size={12} color="#000000" />
              <Text variant="bodySmall" style={styles.changeText}>
                +12.5% from last month
              </Text>
            </View>
          </View>
        </Surface>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/transactions/add')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Plus size={14} color="#000000" />
            </View>
            <Text variant="bodySmall" style={styles.actionText}>
              Add
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/accounts/add')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <CreditCard size={14} color="#000000" />
            </View>
            <Text variant="bodySmall" style={styles.actionText}>
              Account
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
              Savings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/reports')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <TrendingUp size={14} color="#000000" />
            </View>
            <Text variant="bodySmall" style={styles.actionText}>
              Reports
            </Text>
          </TouchableOpacity>
        </View>


        {/* Accounts Section */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Accounts
          </Text>
          <TouchableOpacity onPress={() => router.push('/accounts')} activeOpacity={0.7}>
            <Text variant="bodySmall" style={styles.seeAllText}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {sheetAccounts.slice(0, 2).map(sheet => {
          const getAccountIcon = () => {
            if (sheet.name.toLowerCase().includes('savings')) return <Target size={14} color="#6b7280" />;
            if (sheet.name.toLowerCase().includes('credit')) return <CreditCard size={14} color="#6b7280" />;
            return <Wallet size={14} color="#6b7280" />;
          };

          return (
            <TouchableOpacity 
              key={sheet.name}
              style={styles.accountCard}
              onPress={() => router.push({
                pathname: '/transactions',
                params: { filterAccount: sheet.name }
              })}
              activeOpacity={0.7}
            >
              <View style={styles.accountContent}>
                <View style={styles.accountInfo}>
                  <View style={styles.accountIcon}>
                    {getAccountIcon()}
                  </View>
                  <View style={styles.accountDetails}>
                    <Text variant="bodyLarge" style={styles.accountName}>
                      {sheet.name}
                    </Text>
                  </View>
                </View>
                <MoreHorizontal size={12} color="#6b7280" />
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recent
          </Text>
          <TouchableOpacity onPress={() => router.push('/transactions')} activeOpacity={0.7}>
            <Text variant="bodySmall" style={styles.seeAllText}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <Surface style={styles.transactionsCard}>
          <View style={styles.transactionsContent}>
            {transactions.slice(0, 3).map((transaction, index) => {
              const account = accounts.find(a => a.id === transaction.accountId);
              const isLast = index === transactions.slice(0, 3).length - 1;
              
              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={[styles.transactionItem, !isLast && styles.transactionItemBorder]}
                  onPress={() => router.push(`/transactions/${transaction.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIcon}>
                      {transaction.amount >= 0 ? (
                        <ArrowUpRight size={12} color="#000000" />
                      ) : (
                        <ArrowDownLeft size={12} color="#dc2626" />
                      )}
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text variant="bodyMedium" style={styles.transactionDescription}>
                        {transaction.description || 'No description'}
                      </Text>
                      <Text variant="bodySmall" style={styles.transactionMeta}>
                        {transaction.date ? (transaction.date instanceof Date ? transaction.date : new Date(transaction.date)).toLocaleDateString() : 'Invalid Date'} • {account?.name || 'Unknown Account'}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyLarge" style={[
                    styles.transactionAmount,
                    { color: transaction.amount >= 0 ? '#000000' : '#dc2626' }
                  ]}>
                    {transaction.amount >= 0 ? '' : '-'}{formatCurrency(Math.abs(transaction.amount), account?.currency as any)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Surface>

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
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Balance Card Styles
  balanceCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 12,
  },
  balanceContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    color: '#6b7280',
  },
  currencyChip: {
    height: 20,
    borderColor: '#e5e7eb',
  },
  totalBalance: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 4,
    color: '#000000',
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
    color: '#6b7280',
  },

  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 6,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 0,
    shadowOpacity: 0,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: '#f9fafb',
  },
  actionText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000000',
  },


  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },

  // Account Cards
  accountCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  accountContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    color: '#000000',
  },

  // Transactions
  transactionsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 12,
  },
  transactionsContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    color: '#000000',
  },
  transactionMeta: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 16,
  },
});