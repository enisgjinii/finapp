import { Tabs, Redirect } from 'expo-router';
import { Home, DollarSign, Target, User } from 'lucide-react-native';
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
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
            paddingHorizontal: 8,
            elevation: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
            paddingHorizontal: 4,
            minHeight: 44,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Home size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Money',
            tabBarIcon: ({ color }) => (
              <DollarSign size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="savings"
          options={{
            title: 'Goals',
            tabBarIcon: ({ color }) => (
              <Target size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <User size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            href: null, // Hide from tab bar - accessible via Money tab
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null, // Hide from tab bar - accessible via Goals tab or menu
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