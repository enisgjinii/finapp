import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { Transaction } from '../../src/types';

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
      } as Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>);

      Alert.alert('Success', 'Transaction added successfully');
      reset();
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Add Transaction
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <SegmentedButtons
            value={transactionType}
            onValueChange={setTransactionType}
            buttons={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
            style={styles.typeSelector}
          />

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
              />
            )}
          />

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

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={createTransaction.isPending}
            disabled={createTransaction.isPending}
            style={styles.submitButton}
          >
            Add Transaction
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
  typeSelector: {
    marginBottom: 24,
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
