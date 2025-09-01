import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TransactionsListScreen } from '../screens/transactions/TransactionsListScreen';
import { AccountsListScreen } from '../screens/accounts/AccountsListScreen';
import { InstallmentsListScreen } from '../screens/installments/InstallmentsListScreen';
import { SavingsListScreen } from '../screens/savings/SavingsListScreen';
import { TransactionFormScreen } from '../screens/forms/TransactionFormScreen';
import { TrendingUp, CreditCard, Building2, Target, Receipt } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardHome" component={DashboardScreen} />
  </Stack.Navigator>
);

const TransactionsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TransactionsList" component={TransactionsListScreen} />
    <Stack.Screen name="TransactionForm" component={TransactionFormScreen} />
  </Stack.Navigator>
);

const AccountsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AccountsList" component={AccountsListScreen} />
  </Stack.Navigator>
);

const InstallmentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="InstallmentsList" component={InstallmentsListScreen} />
  </Stack.Navigator>
);

const SavingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SavingsList" component={SavingsListScreen} />
  </Stack.Navigator>
);

export const AppNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TrendingUp color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Receipt color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Accounts"
        component={AccountsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Building2 color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Installments"
        component={InstallmentsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CreditCard color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Savings"
        component={SavingsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Target color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};