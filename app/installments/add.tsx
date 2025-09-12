import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { useInstallments } from '../../src/hooks/useInstallments';
import { useAccounts } from '../../src/hooks/useAccounts';

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
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Add Installment Plan
      </Text>

      <Card style={styles.card}>
        <Card.Content>
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
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}

          <Controller
            control={control}
            name="accountId"
            render={({ field: { onChange, value } }) => (
              <View style={styles.accountContainer}>
                <Text variant="bodyMedium" style={styles.label}>Account</Text>
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={accounts.slice(0, 3).map(account => ({
                    value: account.id,
                    label: account.name,
                  }))}
                  style={styles.segmentedButtons}
                />
              </View>
            )}
          />

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
              />
            )}
          />
          {errors.monthsTotal && (
            <Text style={styles.errorText}>{errors.monthsTotal.message}</Text>
          )}

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

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={createInstallment.isPending}
            disabled={createInstallment.isPending}
            style={styles.submitButton}
          >
            Create Installment Plan
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  card: {
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  accountContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  summaryContainer: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontWeight: '600',
    color: '#2196F3',
  },
  summarySubtext: {
    marginTop: 4,
    opacity: 0.7,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -8,
  },
  submitButton: {
    marginTop: 16,
  },
});
