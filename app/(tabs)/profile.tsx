import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Divider, List, Switch, useTheme } from 'react-native-paper';
import { useAuth } from '../../src/providers/AuthProvider';
import { User, Mail, Calendar, Shield, Bell, Moon, Sun, LogOut, Edit, Trash2 } from 'lucide-react-native';

export default function ProfileScreen(): JSX.Element {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion logic
            Alert.alert('Not Implemented', 'Account deletion feature is not yet implemented.');
          },
        },
      ]
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text variant="headlineMedium" style={styles.title}>
        Profile
      </Text>

      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={80}
              label={getInitials(user?.displayName)}
              style={styles.avatar}
            />
            <Button
              mode="outlined"
              icon={Edit}
              onPress={() => Alert.alert('Not Implemented', 'Edit profile feature is not yet implemented.')}
              style={styles.editButton}
            >
              Edit
            </Button>
          </View>

          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.displayName || 'User'}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email}
            </Text>
            <Text variant="bodySmall" style={styles.userId}>
              ID: {user?.uid?.slice(0, 8)}...
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Account Settings
          </Text>

          <List.Item
            title="Email"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon={Mail} />}
            onPress={() => Alert.alert('Not Implemented', 'Email change feature is not yet implemented.')}
            style={styles.listItem}
          />

          <List.Item
            title="Password"
            description="Change your password"
            left={(props) => <List.Icon {...props} icon={Shield} />}
            onPress={() => Alert.alert('Not Implemented', 'Password change feature is not yet implemented.')}
            style={styles.listItem}
          />

          <Divider style={styles.divider} />

          <Text variant="titleLarge" style={styles.sectionTitle}>
            Preferences
          </Text>

          <List.Item
            title="Dark Mode"
            description="Toggle dark theme"
            left={(props) => <List.Icon {...props} icon={darkMode ? Moon : Sun} />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color={theme.colors.primary}
              />
            )}
            style={styles.listItem}
          />

          <List.Item
            title="Notifications"
            description="Enable push notifications"
            left={(props) => <List.Icon {...props} icon={Bell} />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={theme.colors.primary}
              />
            )}
            style={styles.listItem}
          />

          <Divider style={styles.divider} />

          <Text variant="titleLarge" style={styles.sectionTitle}>
            Data & Privacy
          </Text>

          <List.Item
            title="Export Data"
            description="Download your data"
            left={(props) => <List.Icon {...props} icon={Calendar} />}
            onPress={() => Alert.alert('Not Implemented', 'Data export feature is not yet implemented.')}
            style={styles.listItem}
          />

          <List.Item
            title="Delete Account"
            description="Permanently delete your account"
            left={(props) => <List.Icon {...props} icon={Trash2} color={theme.colors.error} />}
            onPress={handleDeleteAccount}
            style={styles.listItem}
            titleStyle={{ color: theme.colors.error }}
          />

          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            icon={LogOut}
            onPress={handleSignOut}
            style={styles.signOutButton}
            textColor={theme.colors.error}
            buttonColor="transparent"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.infoTitle}>
            App Information
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            Version: 1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            Build: 2024.1.0
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.025,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#000000',
    marginBottom: 12,
  },
  editButton: {
    borderRadius: 8,
    borderColor: '#000000',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: '#9ca3af',
  },
  settingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  signOutButton: {
    marginTop: 16,
    borderRadius: 8,
    borderColor: '#ef4444',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});
