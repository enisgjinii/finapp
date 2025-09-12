import { Tabs, Redirect } from 'expo-router';
import { TrendingUp, DollarSign, User, Wallet, Receipt, Target, Settings } from 'lucide-react-native';
import { useAuth } from '../../src/providers/AuthProvider';
import { View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerLayout } from '../../src/components/DrawerLayout';

function TabLayoutContent(): React.JSX.Element {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.onBackground }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <DrawerLayout>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
            height: 48 + insets.bottom,
            paddingBottom: insets.bottom + 2,
            paddingTop: 2,
            paddingHorizontal: 4,
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '500',
            marginTop: 1,
          },
          tabBarItemStyle: {
            paddingVertical: 1,
            paddingHorizontal: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <TrendingUp size={18} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="money"
          options={{
            title: 'Money',
            tabBarIcon: ({ color }) => (
              <DollarSign size={18} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color }) => (
              <Wallet size={18} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color }) => (
              <Receipt size={18} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="savings"
          options={{
            title: 'Savings',
            tabBarIcon: ({ color }) => (
              <Target size={18} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <Settings size={18} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <User size={18} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="installments"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="planning"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
    </DrawerLayout>
  );
}

export default function TabLayout(): React.JSX.Element {
  return <TabLayoutContent />;
}