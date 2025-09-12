import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useInstallments } from '../../src/hooks/useInstallments';
import { useSavings } from '../../src/hooks/useSavings';
import { formatCurrency } from '../../src/utils/money';
import { Receipt, Plus, Building2, Target, CreditCard, TrendingUp, TrendingDown } from 'lucide-react-native';

export default function MoneyScreen(): React.JSX.Element {
  const theme = useTheme();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { installments } = useInstallments();
  const { savings } = useSavings();

  // Calculate quick stats
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const recentTransactions = transactions.slice(0, 3);
  const activeInstallments = installments.filter(inst => inst.monthsPaid < inst.monthsTotal).slice(0, 2);
  const activeSavings = savings.filter(saving => saving.currentAmount < saving.targetAmount).slice(0, 2);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.screenTitle, { color: theme.colors.onBackground }]}>
        Money
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Quick Stats */}
        <Card style={[styles.statsCard, {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline
        }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Overview
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Balance
                </Text>
                <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.primary }]}>
                  {formatCurrency(totalBalance)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Accounts
                </Text>
                <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {accounts.length}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Main Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => router.push('/transactions/add')}
          >
            <Receipt size={24} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.primary }]}>
              Add Transaction
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.secondaryContainer }]}
            onPress={() => router.push('/accounts/add')}
          >
            <Building2 size={24} color={theme.colors.secondary} />
            <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.secondary }]}>
              Add Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.tertiaryContainer }]}
            onPress={() => router.push('/installments/add')}
          >
            <CreditCard size={24} color={theme.colors.tertiary} />
            <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.tertiary }]}>
              Add Installment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => router.push('/savings/add')}
          >
            <Target size={24} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={[styles.actionText, { color: theme.colors.onSurfaceVariant }]}>
              Add Savings Goal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <Card style={[styles.sectionCard, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline
          }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Recent Transactions
                </Text>
                <TouchableOpacity onPress={() => router.push('/transactions')}>
                  <Text variant="bodyMedium" style={[styles.seeAllText, { color: theme.colors.primary }]}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
              {recentTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionItem}
                  onPress={() => router.push(`/transactions/${transaction.id}`)}
                >
                  <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, {
                      backgroundColor: transaction.amount > 0 ? theme.colors.primaryContainer : theme.colors.errorContainer
                    }]}>
                      {transaction.amount > 0 ? (
                        <TrendingDown size={16} color={theme.colors.primary} />
                      ) : (
                        <TrendingUp size={16} color={theme.colors.error} />
                      )}
                    </View>
                    <View>
                      <Text variant="bodyMedium" style={[styles.transactionTitle, { color: theme.colors.onSurface }]}>
                        {transaction.title || transaction.category || 'Transaction'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.transactionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                        {accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyMedium" style={[styles.transactionAmount, {
                    color: transaction.amount > 0 ? theme.colors.primary : theme.colors.error
                  }]}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Active Installments */}
        {activeInstallments.length > 0 && (
          <Card style={[styles.sectionCard, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline
          }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Active Installments
                </Text>
                <TouchableOpacity onPress={() => router.push('/installments')}>
                  <Text variant="bodyMedium" style={[styles.seeAllText, { color: theme.colors.primary }]}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
              {activeInstallments.map((installment) => (
                <TouchableOpacity
                  key={installment.id}
                  style={styles.installmentItem}
                  onPress={() => router.push('/installments')}
                >
                  <View style={styles.installmentLeft}>
                    <View style={[styles.installmentIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
                      <CreditCard size={16} color={theme.colors.secondary} />
                    </View>
                    <View>
                      <Text variant="bodyMedium" style={[styles.installmentTitle, { color: theme.colors.onSurface }]}>
                        {installment.title}
                      </Text>
                      <Text variant="bodySmall" style={[styles.installmentSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                        {installment.monthsPaid} of {installment.monthsTotal} payments
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyMedium" style={[styles.installmentAmount, { color: theme.colors.onSurface }]}>
                    {formatCurrency(installment.monthlyAmount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Active Savings Goals */}
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
              {activeSavings.map((saving) => {
                const progress = Math.min(saving.currentAmount / saving.targetAmount, 1);
                return (
                  <TouchableOpacity
                    key={saving.id}
                    style={styles.savingsItem}
                    onPress={() => router.push('/savings')}
                  >
                    <View style={styles.savingsLeft}>
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
                        <View style={styles.progressBar}>
                          <View
                            style={[styles.progressFill, {
                              width: `${progress * 100}%`,
                              backgroundColor: theme.colors.primary
                            }]}
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Card.Content>
          </Card>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  statsCard: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
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
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
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
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  installmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  installmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  installmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  installmentTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  installmentSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  installmentAmount: {
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
  savingsLeft: {
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
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});