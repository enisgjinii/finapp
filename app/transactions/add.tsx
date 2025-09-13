import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, SegmentedButtons, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { Transaction } from '../../src/types';
import { AttachmentSection } from '../../src/components/AttachmentSection';
import { AttachmentUpload } from '../../src/services/storage';
import { ArrowLeft, Menu } from 'lucide-react-native';

const schema = yup.object().shape({
  description: yup.string().max(200, 'Description too long'),
  amount: yup.string().required('Amount is required').test('not-zero', 'Amount cannot be zero', (value) => {
    const num = parseFloat(value || '0');
    return !isNaN(num) && num !== 0;
  }),
  category: yup.string(),
  accountId: yup.string().required('Account is required'),
});

export default function AddTransactionScreen(): React.JSX.Element {
  const [transactionType, setTransactionType] = useState('expense');
  const [attachments, setAttachments] = useState<AttachmentUpload[]>([]);
  const { createTransaction } = useTransactions();
  const { accounts } = useAccounts();

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      category: '',
      accountId: accounts[0]?.id || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const amount = transactionType === 'expense'
        ? -Math.abs(parseFloat(data.amount))
        : Math.abs(parseFloat(data.amount));

      await createTransaction.mutateAsync({
        ...data,
        amount,
        date: new Date(),
        source: 'manual',
        tags: data.category ? [data.category] : [],
        attachments: attachments.length > 0 ? attachments : undefined,
      } as Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>);

      Alert.alert('Success', 'Transaction added successfully');
      reset();
      setAttachments([]);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#000000" />
            </TouchableOpacity>
            <Text variant="headlineLarge" style={styles.screenTitle}>
              Add Transaction
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Menu size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Type */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Transaction Type
            </Text>
            <SegmentedButtons
              value={transactionType}
              onValueChange={setTransactionType}
              buttons={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
              style={styles.typeSelector}
            />
          </View>
        </Surface>

        {/* Transaction Details */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Transaction Details
            </Text>

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Description"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.description}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description.message}</Text>
            )}

            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Amount"
                  value={value || ''}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  error={!!errors.amount}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount.message}</Text>
            )}

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Category (optional)"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
          </View>
        </Surface>

        {/* Account Selection */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account
            </Text>
            <Controller
              control={control}
              name="accountId"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={accounts.slice(0, 3).map(account => ({
                    value: account.id,
                    label: account.name,
                  }))}
                  style={styles.segmentedButtons}
                />
              )}
            />
          </View>
        </Surface>

        {/* Attachments */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Attachments
            </Text>
            <AttachmentSection
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              disabled={createTransaction.isPending}
            />
          </View>
        </Surface>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={createTransaction.isPending}
          disabled={createTransaction.isPending}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Add Transaction
        </Button>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 0,
    color: '#000000',
  },
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Card Styles
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  // Input Styles
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  inputOutline: {
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  // Segmented Buttons
  typeSelector: {
    marginBottom: 0,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  // Error Text
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -8,
  },
  // Submit Button
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#000000',
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 16,
  },
});
