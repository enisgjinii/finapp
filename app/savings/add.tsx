import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { useSavings } from '../../src/hooks/useSavings';
import { SavingsGoal } from '../../src/types';

const schema = yup.object().shape({
  title: yup.string().required('Title is required').min(2, 'Title must be at least 2 characters'),
  targetAmount: yup.number().required('Target amount is required').positive('Amount must be positive'),
  currentAmount: yup.number().min(0, 'Current amount cannot be negative').default(0),
  dueDate: yup.string().optional(),
  notes: yup.string(),
});

export default function AddSavingsScreen(): JSX.Element {
  const { createSavingsGoal } = useSavings();

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      targetAmount: '',
      currentAmount: '0',
      dueDate: '',
      notes: '',
    },
  });

  const targetAmount = watch('targetAmount');
  const currentAmount = watch('currentAmount');

  const progress = targetAmount && currentAmount ?
    Math.min((parseFloat(currentAmount) / parseFloat(targetAmount)) * 100, 100) : 0;

  const onSubmit = async (data: any) => {
    try {
      const savingsData = {
        title: data.title,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount || '0'),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes || undefined,
      };

      await createSavingsGoal.mutateAsync(savingsData);
      Alert.alert('Success', 'Savings goal created successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create savings goal');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Add Savings Goal
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Goal Title"
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
            name="targetAmount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Target Amount"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.targetAmount}
              />
            )}
          />
          {errors.targetAmount && (
            <Text style={styles.errorText}>{errors.targetAmount.message}</Text>
          )}

          <Controller
            control={control}
            name="currentAmount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Current Amount Saved"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.currentAmount}
              />
            )}
          />
          {errors.currentAmount && (
            <Text style={styles.errorText}>{errors.currentAmount.message}</Text>
          )}

          {targetAmount && currentAmount && (
            <View style={styles.progressContainer}>
              <Text variant="bodyMedium" style={styles.progressText}>
                Progress: {progress.toFixed(1)}%
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` }
                  ]}
                />
              </View>
            </View>
          )}

          <Controller
            control={control}
            name="dueDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Due Date (optional)"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Notes (optional)"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={[styles.input, styles.notesInput]}
              />
            )}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={createSavingsGoal.isPending}
            disabled={createSavingsGoal.isPending}
            style={styles.submitButton}
          >
            Create Savings Goal
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
  notesInput: {
    height: 80,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
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
