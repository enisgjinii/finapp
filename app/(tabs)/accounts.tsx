import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, useTheme, Surface, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useTransactions } from '../../src/hooks/useTransactions';
import { AccountCard } from '../../src/components/AccountCard';
import { calculateBalance } from '../../src/utils/money';
import { formatCurrency } from '../../src/utils/money';
import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react-native';

export default function AccountsScreen(): React.JSX.Element {
  const theme = useTheme();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  // Get all unique sheetName values from transactions
  const sheetAccounts = useMemo(() => {
    const sheetMap = new Map<string, {
      name: string;
      balance: number;
      transactionCount: number;
      totalIncome: number;
      totalExpenses: number;
    }>();

    transactions.forEach(tx => {
      const sheetName = (tx as any).sheetName;
      if (!sheetName) return;

      if (!sheetMap.has(sheetName)) {
        sheetMap.set(sheetName, {
          name: sheetName,
          balance: 0,
          transactionCount: 0,
          totalIncome: 0,
          totalExpenses: 0,
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
    });

    return Array.from(sheetMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  // Calculate total balance across all sheets
  const totalBalance = useMemo(() => {
    return sheetAccounts.reduce((sum, sheet) => sum + sheet.balance, 0);
  }, [sheetAccounts]);

  // Calculate total transactions count
  const totalTransactions = useMemo(() => {
    return sheetAccounts.reduce((sum, sheet) => sum + sheet.transactionCount, 0);
  }, [sheetAccounts]);

  const renderSheetAccount = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.sheetCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        // Navigate to transactions filtered by this sheet
        router.push({
          pathname: '/transactions',
          params: { filterAccount: item.name }
        });
      }}
    >
      <View style={styles.sheetHeader}>
        <View style={[styles.sheetIcon, { backgroundColor: theme.colors.primaryContainer }]}>
          <Wallet size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.sheetInfo}>
          <Text variant="titleMedium" style={[styles.sheetName, { color: theme.colors.onSurface }]}>
            {item.name}
          </Text>
          <Text variant="bodySmall" style={[styles.sheetMeta, { color: theme.colors.onSurfaceVariant }]}>
            {item.transactionCount} transactions
          </Text>
        </View>
        <View style={styles.sheetBalance}>
          <Text 
            variant="titleLarge" 
            style={[
              styles.balanceText, 
              { color: item.balance >= 0 ? theme.colors.primary : theme.colors.error }
            ]}
          >
            {formatCurrency(item.balance)}
          </Text>
        </View>
      </View>
      
      <View style={styles.sheetStats}>
        <View style={styles.statItem}>
          <TrendingUp size={16} color={theme.colors.primary} />
          <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.primary }]}>
            {formatCurrency(item.totalIncome)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <TrendingDown size={16} color={theme.colors.error} />
          <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.error }]}>
            {formatCurrency(item.totalExpenses)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAccount = ({ item }: { item: any }) => (
    <AccountCard
      account={item}
      balance={calculateBalance(transactions, item.id)}
      onPress={() => router.push(`/accounts/${item.id}`)}
      onEdit={() => router.push(`/accounts/${item.id}/edit`)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Accounts
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/accounts/add')}
          style={[styles.addButton, { backgroundColor: theme.colors.primaryContainer }]}
        >
          <Plus size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.summaryContent}>
          <View style={[styles.summaryIcon, { backgroundColor: theme.colors.primaryContainer }]}>
            <Wallet size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.summaryText}>
            <Text variant="bodySmall" style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
              Total Balance
            </Text>
            <Text variant="headlineSmall" style={[styles.summaryValue, { color: theme.colors.onSurface }]}>
              {formatCurrency(totalBalance)}
            </Text>
            <Text variant="bodySmall" style={[styles.summarySubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {sheetAccounts.length} accounts • {totalTransactions} transactions
            </Text>
          </View>
        </View>
      </Surface>

      {/* Sheet Accounts Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Transaction Sheets
        </Text>
        <FlatList
          data={sheetAccounts}
          keyExtractor={(item) => item.name}
          renderItem={renderSheetAccount}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Regular Accounts Section (if any) */}
      {accounts.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
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
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  sheetCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sheetInfo: {
    flex: 1,
  },
  sheetName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  sheetMeta: {
    fontSize: 12,
    opacity: 0.7,
  },
  sheetBalance: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: '600',
  },
  sheetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});