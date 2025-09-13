import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from 'expo-router';
import { useAccounts } from '../../src/hooks/useAccounts';
import { Account } from '../../src/types';
import { ArrowLeft, Menu } from 'lucide-react-native';

const schema = yup.object().shape({
  name: yup.string().required('Account name is required').min(2, 'Name must be at least 2 characters'),
  currency: yup.string().required('Currency is required'),
  color: yup.string(),
  icon: yup.string(),
});

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

const colors = [
  { value: '#2196F3', label: 'Blue' },
  { value: '#4CAF50', label: 'Green' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#F44336', label: 'Red' },
  { value: '#9C27B0', label: 'Purple' },
  { value: '#00BCD4', label: 'Cyan' },
];

const icons = [
  { value: 'wallet', label: 'Wallet' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'bank', label: 'Bank' },
  { value: 'piggy-bank', label: 'Piggy Bank' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'home', label: 'Home' },
];

export default function AddAccountScreen(): React.JSX.Element {
  const { createAccount, accounts } = useAccounts();

  const getIconEmoji = (iconValue: string) => {
    const iconMap: { [key: string]: string } = {
      'wallet': '👛',
      'credit-card': '💳',
      'bank': '🏦',
      'piggy-bank': '🐷',
      'briefcase': '💼',
      'home': '🏠',
    };
    return iconMap[iconValue] || '👛';
  };

  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      currency: 'USD',
      color: '#2196F3',
      icon: 'wallet',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createAccount.mutateAsync(data);
      Alert.alert('Success', 'Account created successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
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
              Add Account
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
        {/* Account Details */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Details
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Account Name"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.name}
                  outlineStyle={styles.inputOutline}
                />
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>
        </Surface>

        {/* Currency Selection */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Currency
            </Text>
            <Controller
              control={control}
              name="currency"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={currencies.slice(0, 3).map(curr => ({
                    value: curr.value,
                    label: curr.label,
                  }))}
                  style={styles.segmentedButtons}
                />
              )}
            />
          </View>
        </Surface>

        {/* Color Theme */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Color Theme
            </Text>
            <Controller
              control={control}
              name="color"
              render={({ field: { onChange, value } }) => (
                <View style={styles.colorContainer}>
                  {colors.map(color => (
                    <TouchableOpacity
                      key={color.value}
                      onPress={() => onChange(color.value)}
                      style={[
                        styles.colorOption,
                        { 
                          backgroundColor: color.value,
                          borderColor: value === color.value ? '#000000' : '#e5e7eb',
                          borderWidth: value === color.value ? 3 : 1,
                        }
                      ]}
                      activeOpacity={0.7}
                    >
                      {value === color.value && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.checkmark}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </Surface>

        {/* Icon Selection */}
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Icon
            </Text>
            <Controller
              control={control}
              name="icon"
              render={({ field: { onChange, value } }) => (
                <View style={styles.iconContainer}>
                  {icons.map(icon => (
                    <TouchableOpacity
                      key={icon.value}
                      onPress={() => onChange(icon.value)}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor: value === icon.value ? '#000000' : '#f9fafb',
                          borderColor: value === icon.value ? '#000000' : '#e5e7eb',
                          borderWidth: value === icon.value ? 2 : 1,
                        }
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.iconEmoji,
                        { color: value === icon.value ? '#ffffff' : '#6b7280' }
                      ]}>
                        {getIconEmoji(icon.value)}
                      </Text>
                      <Text style={[
                        styles.iconLabel,
                        { color: value === icon.value ? '#ffffff' : '#6b7280' }
                      ]}>
                        {icon.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </Surface>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={createAccount.isPending}
          disabled={createAccount.isPending}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Create Account
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
  // Color and Icon Containers
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  iconOption: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
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
