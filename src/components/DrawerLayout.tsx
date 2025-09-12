import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, Avatar, useTheme as usePaperTheme, Portal, Modal, Divider } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import {
  Home,
  CreditCard,
  Building2,
  Target,
  Receipt,
  User,
  Settings,
  BarChart3,
  LogOut,
  Plus,
  Menu,
  X,
  Calendar
} from 'lucide-react-native';
import { router, usePathname } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

interface DrawerItemProps {
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  onPress: () => void;
  isActive?: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ label, icon: Icon, onPress, isActive }) => {
  const theme = usePaperTheme();

  return (
    <TouchableOpacity
      style={[
        styles.drawerItem,
        {
          backgroundColor: isActive ? theme.colors.primaryContainer : 'transparent',
        }
      ]}
      onPress={onPress}
    >
      <Icon
        color={isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
        size={20}
      />
      <Text
        style={[
          styles.drawerItemText,
          {
            color: isActive ? theme.colors.primary : theme.colors.onSurface,
          }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface DrawerLayoutProps {
  children: React.ReactNode;
}

export const DrawerLayout: React.FC<DrawerLayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, signOut } = useAuth();
  const theme = usePaperTheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isDrawerOpen ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isDrawerOpen, slideAnim]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      closeDrawer();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateTo = (route: string) => {
    router.push(route as any);
    closeDrawer();
  };

  const currentRoute = pathname;

  const drawerItems = [
    { label: 'Dashboard', icon: Home, route: '/(tabs)', key: 'dashboard' },
    { label: 'Transactions', icon: Receipt, route: '/(tabs)/transactions', key: 'transactions' },
    { label: 'Accounts', icon: Building2, route: '/(tabs)/accounts', key: 'accounts' },
    { label: 'Planning', icon: Calendar, route: '/(tabs)/planning', key: 'planning' },
    { label: 'Reports', icon: BarChart3, route: '/(tabs)/reports', key: 'reports' },
    { label: 'Profile', icon: User, route: '/(tabs)/profile', key: 'profile' },
    { label: 'Settings', icon: Settings, route: '/(tabs)/settings', key: 'settings' },
  ];

  const quickActions = [
    { label: 'Add Transaction', icon: Plus, route: '/transactions/add', key: 'add-transaction' },
    { label: 'Add Account', icon: Plus, route: '/accounts/add', key: 'add-account' },
    { label: 'Add Installment', icon: Plus, route: '/installments/add', key: 'add-installment' },
    { label: 'Add Savings Goal', icon: Plus, route: '/savings/add', key: 'add-savings' },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Menu Button */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.primary,
        paddingTop: insets.top + 12
      }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <Menu color={theme.colors.onPrimary} size={24} />
        </TouchableOpacity>
        <Text
          variant="titleLarge"
          style={[styles.headerTitle, { color: theme.colors.onPrimary }]}
        >
          FinApp
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.colors.surface,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        {/* User Profile Section */}
        <View style={[styles.userSection, { 
          backgroundColor: theme.colors.primaryContainer,
          paddingTop: insets.top + 20
        }]}>
          <TouchableOpacity onPress={closeDrawer} style={[styles.closeButton, { top: insets.top + 16 }]}>
            <X color={theme.colors.onPrimaryContainer} size={24} />
          </TouchableOpacity>
          <Avatar.Text
            size={60}
            label={user?.email?.charAt(0).toUpperCase() || 'U'}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.userInfo}>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}
            >
              {user?.displayName || 'User'}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onPrimaryContainer, opacity: 0.8 }}
            >
              {user?.email}
            </Text>
          </View>
        </View>

        <Divider />

        {/* Navigation Items */}
        <View style={styles.drawerItems}>
          {drawerItems.map((item) => (
            <DrawerItem
              key={item.key}
              label={item.label}
              icon={item.icon}
              onPress={() => navigateTo(item.route)}
              isActive={currentRoute.includes(item.key)}
            />
          ))}
        </View>

        <Divider style={{ marginVertical: 8 }} />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text
            variant="titleSmall"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Quick Actions
          </Text>
          {quickActions.map((item) => (
            <DrawerItem
              key={item.key}
              label={item.label}
              icon={item.icon}
              onPress={() => navigateTo(item.route)}
            />
          ))}
        </View>

        <Divider style={{ marginVertical: 8 }} />

        {/* Logout */}
        <View style={{ paddingBottom: insets.bottom + 16 }}>
          <DrawerItem
            label="Logout"
            icon={LogOut}
            onPress={handleLogout}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 1001,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userSection: {
    padding: 20,
    paddingBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  userInfo: {
    marginTop: 16,
  },
  drawerItems: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  drawerItemText: {
    marginLeft: 16,
    fontSize: 16,
  },
  quickActions: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 20,
  },
});
