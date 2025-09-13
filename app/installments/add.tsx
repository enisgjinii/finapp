import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { useInstallments } from '../../src/hooks/useInstallments';
import { useAccounts } from '../../src/hooks/useAccounts';
import { ArrowLeft, Menu } from 'lucide-react-native';

const schema = yup.object().shape({
  title: yup.string().required('Title is required').min(2, 'Title must be at least 2 characters'),
  principal: yup.string().required('Principal amount is required').test('is-number', 'Must be a valid positive number', (value) => {
    const num = parseFloat(value || '0');
    return !isNaN(num) && num > 0;
  }),
  monthlyAmount: yup.string().required('Monthly amount is required').test('is-number', 'Must be a valid positive number', (value) => {
    const num = parseFloat(value || '0');
    return !isNaN(num) && num > 0;
  }),
  monthsTotal: yup.string().required('Total months is required').test('is-integer', 'Must be a whole number', (value) => {
    const num = parseInt(value || '0');
    return !isNaN(num) && num >= 1 && num === parseFloat(value || '0');
  }),
  accountId: yup.string().required('Account is required'),
  nextDueDate: yup.string().required('Next due date is required'),
});

export default function AddInstallmentScreen(): React.JSX.Element {
  const { createInstallment } = useInstallments();
  const { accounts } = useAccounts();

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      principal: '',
      monthlyAmount: '',
      monthsTotal: '12',
      accountId: accounts[0]?.id || '',
      nextDueDate: new Date().toISOString().split('T')[0],
    },
  });

  const principal = watch('principal');
  const monthlyAmount = watch('monthlyAmount');
  const monthsTotal = watch('monthsTotal');

  // Auto-calculate monthly amount if principal and months are provided
  useEffect(() => {
    if (principal && monthsTotal && !monthlyAmount) {
      const calculatedMonthly = parseFloat(principal) / parseInt(monthsTotal);
      setValue('monthlyAmount', calculatedMonthly.toFixed(2));
    }
  }, [principal, monthsTotal, monthlyAmount, setValue]);

  // Auto-calculate total months if principal and monthly amount are provided
  useEffect(() => {
    if (principal && monthlyAmount && !monthsTotal) {
      const calculatedMonths = Math.ceil(parseFloat(principal) / parseFloat(monthlyAmount));
      setValue('monthsTotal', calculatedMonths.toString());
    }
  }, [principal, monthlyAmount, monthsTotal, setValue]);

  const onSubmit = async (data: any) => {
    try {
      await createInstallment.mutateAsync({
        title: data.title,
        principal: parseFloat(data.principal),
        monthlyAmount: parseFloat(data.monthlyAmount),
        monthsTotal: parseInt(data.monthsTotal),
        monthsPaid: 0,
        accountId: data.accountId,
        nextDueDate: new Date(data.nextDueDate),
        status: 'active',
      });

      Alert.alert('Success', 'Installment plan created successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create installment plan');
    }
  };

  const totalAmount = principal && monthlyAmount ?
    (parseFloat(principal) + (parseFloat(monthlyAmount) * parseInt(monthsTotal || '0'))) : 0;

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
              Add Installment Plan
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
        {/* Installment Details */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Installment Details
            </Text>

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Installment Title"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.title}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title.message}</Text>
            )}
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

        {/* Payment Information */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment Information
            </Text>

            <Controller
              control={control}
              name="principal"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Principal Amount"
                  value={value || ''}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  error={!!errors.principal}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.principal && (
              <Text style={styles.errorText}>{errors.principal.message}</Text>
            )}

            <Controller
              control={control}
              name="monthlyAmount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Monthly Payment"
                  value={value || ''}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  error={!!errors.monthlyAmount}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.monthlyAmount && (
              <Text style={styles.errorText}>{errors.monthlyAmount.message}</Text>
            )}

            <Controller
              control={control}
              name="monthsTotal"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Total Months"
                  value={value || ''}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  error={!!errors.monthsTotal}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.monthsTotal && (
              <Text style={styles.errorText}>{errors.monthsTotal.message}</Text>
            )}
          </View>
        </Surface>

        {/* Schedule */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Schedule
            </Text>

            <Controller
              control={control}
              name="nextDueDate"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="First Due Date"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                  error={!!errors.nextDueDate}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.nextDueDate && (
              <Text style={styles.errorText}>{errors.nextDueDate.message}</Text>
            )}

            {totalAmount > 0 && (
              <View style={styles.summaryContainer}>
                <Text variant="bodyMedium" style={styles.summaryText}>
                  Total Amount: ${totalAmount.toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={styles.summarySubtext}>
                  (${parseFloat(monthlyAmount || '0').toFixed(2)} × {monthsTotal} months)
                </Text>
              </View>
            )}
          </View>
        </Surface>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={createInstallment.isPending}
          disabled={createInstallment.isPending}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Create Installment Plan
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
  segmentedButtons: {
    marginBottom: 0,
  },
  // Summary Container
  summaryContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  summaryText: {
    fontWeight: '600',
    color: '#000000',
  },
  summarySubtext: {
    marginTop: 4,
    opacity: 0.7,
    color: '#6b7280',
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