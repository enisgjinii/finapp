import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Chip, Button, useTheme, Surface, IconButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { formatCurrency } from '../../src/utils/money';
import { formatDate } from '../../src/utils/date';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Building2,
  FileText,
  Clock,
  MoreHorizontal,
  Share,
  Download
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function TransactionDetailsScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const [showDrawer, setShowDrawer] = useState(false);

  const transaction = transactions.find(t => t.id === id);
  const account = transaction ? accounts.find(a => a.id === transaction.accountId) : null;

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.centerContent, { flex: 1 }]}>
          <Text variant="headlineSmall" style={[styles.errorTitle, { color: theme.colors.error }]}>
            Transaction Not Found
          </Text>
          <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.onSurfaceVariant }]}>
            The transaction you're looking for doesn't exist or has been deleted.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.errorButton}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isIncome = transaction.amount > 0;
  const amountColor = isIncome ? '#000000' : '#dc2626'; // Black for income, red for expenses

  const handleEdit = () => {
    router.push(`/transactions/${transaction.id}/edit`);
  };

  const handleDelete = () => {
    // Handle delete logic here
    console.log('Delete transaction:', transaction.id);
  };

  const handleShare = () => {
    // Handle share logic here
    console.log('Share transaction:', transaction.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Enhanced Header */}
      <Surface style={styles.header} elevation={0}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#000000" />
            </TouchableOpacity>
            <Text variant="titleLarge" style={styles.headerTitle}>
              Transaction Details
            </Text>
          </View>

          <View style={styles.headerActions}>
            <IconButton
              icon={() => <Share size={20} color="#6b7280" />}
              size={20}
              onPress={handleShare}
              style={styles.headerIconButton}
            />
            <IconButton
              icon={() => <Edit size={20} color="#6b7280" />}
              size={20}
              onPress={handleEdit}
              style={styles.headerIconButton}
            />
            <IconButton
              icon={() => <MoreHorizontal size={20} color="#6b7280" />}
              size={20}
              onPress={() => setShowDrawer(true)}
              style={styles.headerIconButton}
            />
          </View>
        </View>
      </Surface>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Amount Card */}
        <Surface style={styles.amountCard} elevation={1}>
          <View style={styles.amountContent}>
            <View style={styles.amountIcon}>
              <DollarSign
                size={32}
                color={isIncome ? '#000000' : '#dc2626'}
              />
            </View>

            <View style={styles.amountDetails}>
              <Text variant="headlineLarge" style={[styles.amount, { color: amountColor }]}>
                {isIncome ? '' : '-'}{formatCurrency(Math.abs(transaction.amount))}
              </Text>
              <View style={[styles.typeBadge, {
                backgroundColor: isIncome ? '#000000' : '#dc2626'
              }]}>
                <Text style={[styles.typeBadgeText, {
                  color: '#ffffff'
                }]}>
                  {isIncome ? 'Income' : 'Expense'}
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Transaction Details */}
        <Surface style={styles.detailsCard} elevation={1}>
          <View style={styles.detailsContent}>
            <Text variant="titleMedium" style={styles.detailsTitle}>
              Transaction Information
            </Text>

            <View style={styles.detailItems}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <FileText size={18} color="#6b7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={styles.detailLabel}>
                    Description
                  </Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {transaction.description || 'No description'}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Building2 size={18} color="#6b7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={styles.detailLabel}>
                    Account
                  </Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {(transaction as any).sheetName || account?.name || 'Unknown Account'}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Calendar size={18} color="#6b7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={styles.detailLabel}>
                    Date & Time
                  </Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {transaction.date ? (transaction.date instanceof Date ? transaction.date : new Date(transaction.date)).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Invalid Date'}
                  </Text>
                </View>
              </View>

              {transaction.category && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Tag size={18} color="#6b7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={styles.detailLabel}>
                        Category
                      </Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {transaction.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              {transaction.source && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Clock size={18} color="#6b7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={styles.detailLabel}>
                        Source
                      </Text>
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceBadgeText}>
                          {transaction.source.charAt(0).toUpperCase() + transaction.source.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              <Divider style={styles.divider} />

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Clock size={18} color="#6b7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodySmall" style={styles.detailLabel}>
                    Created
                  </Text>
                  <Text variant="bodyLarge" style={styles.detailValue}>
                    {formatDate(transaction.createdAt)}
                  </Text>
                </View>
              </View>

              {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Clock size={18} color="#6b7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={styles.detailLabel}>
                        Last Updated
                      </Text>
                      <Text variant="bodyLarge" style={styles.detailValue}>
                        {formatDate(transaction.updatedAt)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleEdit}
          >
            <Edit size={20} color="#ffffff" />
            <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>
              Edit Transaction
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDelete}
          >
            <Trash2 size={20} color="#ffffff" />
            <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Drawer */}
      {showDrawer && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          onPress={() => setShowDrawer(false)}
          activeOpacity={1}
        >
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text variant="titleMedium" style={styles.drawerTitle}>
                Transaction Options
              </Text>
              <TouchableOpacity onPress={() => setShowDrawer(false)}>
                <ArrowLeft size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerContent}>
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={handleEdit}
              >
                <Edit size={20} color="#000000" />
                <Text style={styles.drawerItemText}>
                  Edit Transaction
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={handleShare}
              >
                <Share size={20} color="#000000" />
                <Text style={styles.drawerItemText}>
                  Share Transaction
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={handleDelete}
              >
                <Trash2 size={20} color="#dc2626" />
                <Text style={[styles.drawerItemText, { color: '#dc2626' }]}>
                  Delete Transaction
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => router.back()}
              >
                <ArrowLeft size={20} color="#000000" />
                <Text style={styles.drawerItemText}>
                  Back to Transactions
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
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
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButton: {
    marginTop: 8,
    backgroundColor: '#000000',
  },

  // Header Styles - Clean, minimal design
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconButton: {
    margin: 0,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Amount Card - Clean white card with subtle border
  amountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  amountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  amountIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  amountDetails: {
    flex: 1,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 8,
    color: '#000000',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Details Card - Clean list design
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailsContent: {
    padding: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  detailItems: {
    gap: 0,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  categoryBadge: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  sourceBadge: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  sourceBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0ea5e9',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },

  // Action Buttons - Clean black/white design
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  primaryButton: {
    borderColor: '#000000',
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButton: {
    borderColor: '#dc2626',
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Drawer Styles - Clean modal design
  drawerOverlay: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  drawer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomWidth: 0,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  drawerContent: {
    paddingVertical: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 16,
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 20,
  },
});
