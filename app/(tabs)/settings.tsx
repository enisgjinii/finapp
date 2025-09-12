import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card, List, Switch, Button, Divider, useTheme as usePaperTheme, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={[styles.title, { color: paperTheme.colors.onBackground }]}>
          Settings
        </Text>

      <Card style={[styles.settingsCard, {
        backgroundColor: paperTheme.colors.surface,
        borderColor: paperTheme.colors.outline
      }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Appearance
          </Text>

          <View style={styles.themeSelector}>
            <Text variant="bodyMedium" style={[styles.themeLabel, { color: paperTheme.colors.onSurface }]}>
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
            <Text variant="bodyMedium" style={[styles.currencyLabel, { color: paperTheme.colors.onSurface }]}>
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
          <Text variant="bodySmall" style={[styles.infoText, { color: paperTheme.colors.onSurfaceVariant }]}>
            Platform: React Native + Expo
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
  segmentedButtons: {
    marginTop: 8,
  },
  currencySelector: {
    marginBottom: 16,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
});
