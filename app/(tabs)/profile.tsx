import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Surface, Button, Avatar, Divider, Switch } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/providers/AuthProvider';
import { useTheme } from '../../src/providers/ThemeProvider';
import {
  User, Mail, Calendar, Shield, Bell, Moon, Sun, LogOut, Edit, Trash2,
  Download, Upload, Globe, HelpCircle, Info, Lock, Database, CreditCard
} from 'lucide-react-native';

export default function ProfileScreen(): React.JSX.Element {
  const { user, signOut } = useAuth();
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text variant="headlineLarge" style={styles.screenTitle}>
              Profile
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Surface style={styles.profileCard}>
          <View style={styles.profileContent}>
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
          </View>
        </Surface>

        {/* Account Settings */}
        <Surface style={styles.settingsCard}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Account Settings
            </Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Not Implemented', 'Email change feature is not yet implemented.')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Mail size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Email
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    {user?.email}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Not Implemented', 'Password change feature is not yet implemented.')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Shield size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Password
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Change your password
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Appearance */}
        <Surface style={styles.settingsCard}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Appearance
            </Text>

            <View style={styles.themeSelector}>
              <Text variant="bodyMedium" style={styles.themeLabel}>
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
          </View>
        </Surface>

        {/* Notifications */}
        <Surface style={styles.settingsCard}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Notifications
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Bell size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Push Notifications
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Receive notifications for important events
                  </Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                />
              </View>
            </View>
          </View>
        </Surface>

        {/* Security */}
        <Surface style={styles.settingsCard}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Security
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Lock size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Biometric Authentication
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Use fingerprint or face ID to unlock the app
                  </Text>
                </View>
                <Switch
                  value={biometricAuth}
                  onValueChange={setBiometricAuth}
                />
              </View>
            </View>
          </View>
        </Surface>

        {/* Data Management */}
        <Surface style={styles.settingsCard}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Data Management
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Database size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Auto Backup
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Automatically backup your data to cloud
                  </Text>
                </View>
                <Switch
                  value={autoBackup}
                  onValueChange={setAutoBackup}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleExportData}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Download size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Export Data
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Download your data as CSV file
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleImportData}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Upload size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Import Data
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Import transactions from CSV file
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleClearData}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Trash2 size={20} color="#dc2626" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={[styles.settingTitle, { color: '#dc2626' }]}>
                    Clear All Data
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Permanently delete all your data
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Currency & Region */}
        <Surface style={styles.settingsCard}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Currency & Region
            </Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Not Implemented', 'Currency selection feature is not yet implemented.')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <CreditCard size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Default Currency
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    USD - US Dollar
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Not Implemented', 'Language selection feature is not yet implemented.')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Globe size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Language
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    English
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Support & About */}
        <Surface style={styles.settingsCard}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Support & About
            </Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Not Implemented', 'Help and support feature is not yet implemented.')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <HelpCircle size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Help & Support
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Get help and contact support
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Not Implemented', 'Privacy policy feature is not yet implemented.')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Shield size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    Privacy Policy
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Read our privacy policy
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('About', 'Finance Tracker v1.0.0\n\nA simple and powerful app to manage your personal finances.\n\nBuilt with React Native and Expo.')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Info size={20} color="#6b7280" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={styles.settingTitle}>
                    About
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    App version and information
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <Trash2 size={20} color="#dc2626" />
                </View>
                <View style={styles.settingDetails}>
                  <Text variant="bodyMedium" style={[styles.settingTitle, { color: '#dc2626' }]}>
                    Delete Account
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Permanently delete your account
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <Button
              mode="outlined"
              icon={LogOut}
              onPress={handleSignOut}
              style={styles.signOutButton}
              textColor="#dc2626"
              buttonColor="transparent"
            >
              Sign Out
            </Button>
          </View>
        </Surface>

        {/* App Information */}
        <Surface style={styles.infoCard}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.infoTitle}>
              App Information
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              Version: 1.0.0
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              Build: 2024.1.0
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 20 : 15,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 12,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 12,
    backgroundColor: '#000000',
  },
  editButton: {
    borderRadius: 8,
    borderColor: '#e5e7eb',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
    color: '#6b7280',
  },
  userId: {
    fontSize: 12,
    color: '#6b7280',
  },
  settingsCard: {
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
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    color: '#000000',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  signOutButton: {
    marginTop: 16,
    borderRadius: 8,
    borderColor: '#dc2626',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#6b7280',
  },
  themeSelector: {
    marginBottom: 16,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#000000',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
  },
});
