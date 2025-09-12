import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Divider, List, Switch, useTheme as usePaperTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTheme } from '../../src/providers/ThemeProvider';
import {
  User, Mail, Calendar, Shield, Bell, Moon, Sun, LogOut, Edit, Trash2,
  Download, Upload, Globe, HelpCircle, Info, Lock, Database, CreditCard
} from 'lucide-react-native';

export default function ProfileScreen(): React.JSX.Element {
  const { user, signOut } = useAuth();
  const paperTheme = usePaperTheme();
  const { themeMode, setThemeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

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

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported as a CSV file. This may take a few moments.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Export',
          onPress: () => {
            // Implement data export logic
            Alert.alert('Export Started', 'Your data export has been initiated. You will receive a notification when it\'s ready.');
          },
        },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'Select a CSV file to import your transactions. This will merge with your existing data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Import',
          onPress: () => {
            // Implement data import logic
            Alert.alert('Not Implemented', 'Data import feature is not yet implemented.');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions, accounts, and settings. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Not Implemented', 'Data clearing feature is not yet implemented.');
          },
        },
      ]
    );
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={[styles.title, { color: paperTheme.colors.onBackground }]}>
          Profile
        </Text>

      <Card style={[styles.profileCard, {
        backgroundColor: paperTheme.colors.surface,
        borderColor: paperTheme.colors.outline
      }]}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={80}
              label={getInitials(user?.displayName)}
              style={[styles.avatar, { backgroundColor: paperTheme.colors.primary }]}
            />
            <Button
              mode="outlined"
              icon={Edit}
              onPress={() => Alert.alert('Not Implemented', 'Edit profile feature is not yet implemented.')}
              style={[styles.editButton, { borderColor: paperTheme.colors.outline }]}
            >
              Edit
            </Button>
          </View>

          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={[styles.userName, { color: paperTheme.colors.onSurface }]}>
              {user?.displayName || 'User'}
            </Text>
            <Text variant="bodyMedium" style={[styles.userEmail, { color: paperTheme.colors.onSurfaceVariant }]}>
              {user?.email}
            </Text>
            <Text variant="bodySmall" style={[styles.userId, { color: paperTheme.colors.onSurfaceVariant }]}>
              ID: {user?.uid?.slice(0, 8)}...
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.settingsCard, {
        backgroundColor: paperTheme.colors.surface,
        borderColor: paperTheme.colors.outline
      }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
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

          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Appearance
          </Text>

          <View style={styles.themeSelector}>
            <Text variant="bodyMedium" style={[styles.themeLabel, { color: paperTheme.colors.onSurface }]}>
              Theme
            </Text>
            <View style={styles.themeButtons}>
              <Button
                mode={themeMode === 'light' ? 'contained' : 'outlined'}
                onPress={() => setThemeMode('light')}
                icon={Sun}
                style={styles.themeButton}
                compact
              >
                Light
              </Button>
              <Button
                mode={themeMode === 'dark' ? 'contained' : 'outlined'}
                onPress={() => setThemeMode('dark')}
                icon={Moon}
                style={styles.themeButton}
                compact
              >
                Dark
              </Button>
              <Button
                mode={themeMode === 'system' ? 'contained' : 'outlined'}
                onPress={() => setThemeMode('system')}
                icon={Globe}
                style={styles.themeButton}
                compact
              >
                System
              </Button>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Notifications
          </Text>

          <List.Item
            title="Push Notifications"
            description="Receive notifications for important events"
            left={(props) => <List.Icon {...props} icon={Bell} />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={paperTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />

          <Divider style={styles.divider} />

          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Security
          </Text>

          <List.Item
            title="Biometric Authentication"
            description="Use fingerprint or face ID to unlock the app"
            left={(props) => <List.Icon {...props} icon={Lock} />}
            right={() => (
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                color={paperTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />

          <Divider style={styles.divider} />

          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Data Management
          </Text>

          <List.Item
            title="Auto Backup"
            description="Automatically backup your data to cloud"
            left={(props) => <List.Icon {...props} icon={Database} />}
            right={() => (
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                color={paperTheme.colors.primary}
              />
            )}
            style={styles.listItem}
          />

          <List.Item
            title="Export Data"
            description="Download your data as CSV file"
            left={(props) => <List.Icon {...props} icon={Download} />}
            onPress={handleExportData}
            style={styles.listItem}
          />

          <List.Item
            title="Import Data"
            description="Import transactions from CSV file"
            left={(props) => <List.Icon {...props} icon={Upload} />}
            onPress={handleImportData}
            style={styles.listItem}
          />

          <List.Item
            title="Clear All Data"
            description="Permanently delete all your data"
            left={(props) => <List.Icon {...props} icon={Trash2} color={paperTheme.colors.error} />}
            onPress={handleClearData}
            style={styles.listItem}
            titleStyle={{ color: paperTheme.colors.error }}
          />

          <Divider style={styles.divider} />

          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Currency & Region
          </Text>

          <List.Item
            title="Default Currency"
            description="USD - US Dollar"
            left={(props) => <List.Icon {...props} icon={CreditCard} />}
            onPress={() => Alert.alert('Not Implemented', 'Currency selection feature is not yet implemented.')}
            style={styles.listItem}
          />

          <List.Item
            title="Language"
            description="English"
            left={(props) => <List.Icon {...props} icon={Globe} />}
            onPress={() => Alert.alert('Not Implemented', 'Language selection feature is not yet implemented.')}
            style={styles.listItem}
          />

          <Divider style={styles.divider} />

          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Support & About
          </Text>

          <List.Item
            title="Help & Support"
            description="Get help and contact support"
            left={(props) => <List.Icon {...props} icon={HelpCircle} />}
            onPress={() => Alert.alert('Not Implemented', 'Help and support feature is not yet implemented.')}
            style={styles.listItem}
          />

          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={(props) => <List.Icon {...props} icon={Shield} />}
            onPress={() => Alert.alert('Not Implemented', 'Privacy policy feature is not yet implemented.')}
            style={styles.listItem}
          />

          <List.Item
            title="About"
            description="App version and information"
            left={(props) => <List.Icon {...props} icon={Info} />}
            onPress={() => Alert.alert('About', 'Finance Tracker v1.0.0\n\nA simple and powerful app to manage your personal finances.\n\nBuilt with React Native and Expo.')}
            style={styles.listItem}
          />

          <List.Item
            title="Delete Account"
            description="Permanently delete your account"
            left={(props) => <List.Icon {...props} icon={Trash2} color={paperTheme.colors.error} />}
            onPress={handleDeleteAccount}
            style={styles.listItem}
            titleStyle={{ color: paperTheme.colors.error }}
          />

          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            icon={LogOut}
            onPress={handleSignOut}
            style={styles.signOutButton}
            textColor={paperTheme.colors.error}
            buttonColor="transparent"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.infoCard, {
        backgroundColor: paperTheme.colors.surface,
        borderColor: paperTheme.colors.outline
      }]}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.infoTitle, { color: paperTheme.colors.onSurface }]}>
            App Information
          </Text>
          <Text variant="bodySmall" style={[styles.infoText, { color: paperTheme.colors.onSurfaceVariant }]}>
            Version: 1.0.0
          </Text>
          <Text variant="bodySmall" style={[styles.infoText, { color: paperTheme.colors.onSurfaceVariant }]}>
            Build: 2024.1.0
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 24,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.025,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
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
    marginBottom: 12,
  },
  editButton: {
    borderRadius: 8,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
  },
  settingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  themeSelector: {
    marginBottom: 16,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
  },
});
