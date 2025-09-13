import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { useSavings } from '../../src/hooks/useSavings';
import { SavingsGoal } from '../../src/types';
import { ArrowLeft, Menu } from 'lucide-react-native';

const schema = yup.object().shape({
  title: yup.string().required('Title is required').min(2, 'Title must be at least 2 characters'),
  targetAmount: yup.string().required('Target amount is required').test('is-number', 'Must be a valid positive number', (value) => {
    const num = parseFloat(value || '0');
    return !isNaN(num) && num > 0;
  }),
  currentAmount: yup.string().test('is-number', 'Must be a valid non-negative number', (value) => {
    const num = parseFloat(value || '0');
    return !isNaN(num) && num >= 0;
  }),
  dueDate: yup.string().optional(),
  notes: yup.string(),
});

export default function AddSavingsScreen(): React.JSX.Element {
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
              Add Savings Goal
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
        {/* Goal Details */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Goal Details
            </Text>

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
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title.message}</Text>
            )}
          </View>
        </Surface>

        {/* Amount Information */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Amount Information
            </Text>

            <Controller
              control={control}
              name="targetAmount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Target Amount"
                  value={value || ''}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  error={!!errors.targetAmount}
                  outlineStyle={styles.inputOutline}
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
                  value={value || ''}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  error={!!errors.currentAmount}
                  outlineStyle={styles.inputOutline}
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
          </View>
        </Surface>

        {/* Additional Information */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Additional Information
            </Text>

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
                  outlineStyle={styles.inputOutline}
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
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
          </View>
        </Surface>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={createSavingsGoal.isPending}
          disabled={createSavingsGoal.isPending}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Create Savings Goal
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
  notesInput: {
    height: 80,
  },
  // Progress Styles
  progressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  progressText: {
    marginBottom: 8,
    fontWeight: '500',
    color: '#000000',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
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