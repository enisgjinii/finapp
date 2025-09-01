import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAccounts } from '../../hooks/useAccounts';
import { Account } from '../../types';

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

export const AccountFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { createAccount, updateAccount, accounts } = useAccounts();

  const accountId = (route.params as any)?.accountId;
  const isEditing = !!accountId;

  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      currency: 'USD',
      color: '#2196F3',
      icon: 'wallet',
    },
  });

  useEffect(() => {
    if (isEditing && accountId) {
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        setValue('name', account.name);
        setValue('currency', account.currency);
        setValue('color', account.color || '#2196F3');
        setValue('icon', account.icon || 'wallet');
      }
    }
  }, [accountId, accounts, isEditing, setValue]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await updateAccount.mutateAsync({
          id: accountId,
          ...data,
        });
        Alert.alert('Success', 'Account updated successfully');
      } else {
        await createAccount.mutateAsync(data);
        Alert.alert('Success', 'Account created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} account`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {isEditing ? 'Edit Account' : 'Add Account'}
      </Text>

      <Card style={styles.card}>
        <Card.Content>
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
              />
            )}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name.message}</Text>
          )}

          <Controller
            control={control}
            name="currency"
            render={({ field: { onChange, value } }) => (
              <View style={styles.segmentedContainer}>
                <Text variant="bodyMedium" style={styles.label}>Currency</Text>
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={currencies.slice(0, 3).map(curr => ({
                    value: curr.value,
                    label: curr.label,
                  }))}
                  style={styles.segmentedButtons}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, value } }) => (
              <View style={styles.segmentedContainer}>
                <Text variant="bodyMedium" style={styles.label}>Color Theme</Text>
                <View style={styles.colorContainer}>
                  {colors.map(color => (
                    <Button
                      key={color.value}
                      mode={value === color.value ? 'contained' : 'outlined'}
                      onPress={() => onChange(color.value)}
                      style={[
                        styles.colorButton,
                        { backgroundColor: value === color.value ? color.value : 'transparent' }
                      ]}
                      labelStyle={{ color: value === color.value ? 'white' : color.value }}
                    >
                      {color.label}
                    </Button>
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <View style={styles.segmentedContainer}>
                <Text variant="bodyMedium" style={styles.label}>Icon</Text>
                <View style={styles.iconContainer}>
                  {icons.map(icon => (
                    <Button
                      key={icon.value}
                      mode={value === icon.value ? 'contained' : 'outlined'}
                      onPress={() => onChange(icon.value)}
                      style={styles.iconButton}
                    >
                      {icon.label}
                    </Button>
                  ))}
                </View>
              </View>
            )}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={createAccount.isPending || updateAccount.isPending}
            disabled={createAccount.isPending || updateAccount.isPending}
            style={styles.submitButton}
          >
            {isEditing ? 'Update Account' : 'Create Account'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

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
  segmentedContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    flex: 1,
    minWidth: 80,
    marginVertical: 4,
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconButton: {
    flex: 1,
    minWidth: 100,
    marginVertical: 4,
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
