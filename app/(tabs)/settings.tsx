import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, Surface, Switch, Button, Divider, useTheme as usePaperTheme, SegmentedButtons, IconButton } from 'react-native-paper';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useCurrency, CURRENCIES } from '../../src/providers/CurrencyProvider';
import { 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  HelpCircle, 
  Info,
  CreditCard,
  Database,
  Lock
} from 'lucide-react-native';

export default function SettingsScreen(): React.JSX.Element {
  const paperTheme = usePaperTheme();
  const { themeMode, setThemeMode } = useTheme();
  const { primaryCurrency, setPrimaryCurrency } = useCurrency();
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

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

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text variant="headlineLarge" style={styles.screenTitle}>
              Settings
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Appearance Section */}
        <Surface style={styles.sectionCard} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Appearance
            </Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.themeSelector}>
              <Text variant="bodyMedium" style={styles.themeLabel}>
                Theme
              </Text>
              <SegmentedButtons
                value={themeMode}
                onValueChange={setThemeMode}
                buttons={[
                  {
                    value: 'light',
                    label: 'Light',
                    icon: Sun,
                  },
                  {
                    value: 'dark',
                    label: 'Dark',
                    icon: Moon,
                  },
                  {
                    value: 'system',
                    label: 'System',
                    icon: Globe,
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.currencySelector}>
              <Text variant="bodyMedium" style={styles.currencyLabel}>
                Primary Currency
              </Text>
              <SegmentedButtons
                value={primaryCurrency}
                onValueChange={setPrimaryCurrency}
                buttons={[
                  {
                    value: 'EUR',
                    label: 'EUR',
                  },
                  {
                    value: 'USD',
                    label: 'USD',
                  },
                  {
                    value: 'GBP',
                    label: 'GBP',
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
          </View>
        </Surface>

        {/* Notifications Section */}
        <Surface style={styles.sectionCard} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Notifications
            </Text>
          </View>
          
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Bell size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Push Notifications
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Receive notifications for important events
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color="#000000"
              />
            </View>
          </View>
        </Surface>

        {/* Security Section */}
        <Surface style={styles.sectionCard} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Security
            </Text>
          </View>
          
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Lock size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Biometric Authentication
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Use fingerprint or face ID to unlock the app
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                color="#000000"
              />
            </View>
          </View>
        </Surface>

        {/* Data Management Section */}
        <Surface style={styles.sectionCard} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Data Management
            </Text>
          </View>
          
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Database size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Auto Backup
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Automatically backup your data to cloud
                  </Text>
                </View>
              </View>
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                color="#000000"
              />
            </View>

            <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Download size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Export Data
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Download your data as CSV file
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleImportData}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Upload size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Import Data
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Import transactions from CSV file
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Trash2 size={20} color="#dc2626" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={[styles.settingTitle, { color: '#dc2626' }]}>
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

        {/* Currency & Region Section */}
        <Surface style={styles.sectionCard} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Currency & Region
            </Text>
          </View>
          
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => Alert.alert('Not Implemented', 'Currency selection feature is not yet implemented.')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <CreditCard size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
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
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Globe size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
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

        {/* Support & About Section */}
        <Surface style={styles.sectionCard} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Support & About
            </Text>
          </View>
          
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => Alert.alert('Not Implemented', 'Help and support feature is not yet implemented.')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <HelpCircle size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
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
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Shield size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
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
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Info size={20} color="#6b7280" />
                </View>
                <View style={styles.settingText}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    About
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    App version and information
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* App Information */}
        <Surface style={styles.infoCard} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.infoTitle}>
              App Information
            </Text>
          </View>
          <View style={styles.sectionContent}>
            <Text variant="bodySmall" style={styles.infoText}>
              Version: 1.0.0
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              Build: 2024.1.0
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              Platform: React Native + Expo
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
  // Header Styles
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
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Section Card Styles
  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 12,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Setting Item Styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Theme and Currency Selectors
  themeSelector: {
    marginBottom: 16,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  currencySelector: {
    marginBottom: 16,
  },
  currencyLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginTop: 4,
  },
  // Info Card Styles
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
    color: '#000000',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});
