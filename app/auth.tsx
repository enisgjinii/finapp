import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';

export default function AuthScreen(): JSX.Element {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();

  // Redirect if user is already authenticated
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const validateForm = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (authMode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert(
        'Google Sign-In Setup Required',
        error.message || 'Google Sign-In needs to be configured. Please check the GOOGLE_OAUTH_SETUP.md file for complete setup instructions.',
        [
          {
            text: 'Use Email/Password',
            style: 'default'
          },
          {
            text: 'Setup Guide',
            style: 'default',
            onPress: () => {
              // Could open the setup guide file or show instructions
              Alert.alert(
                'Setup Instructions',
                '1. Go to Firebase Console\n2. Enable Google provider\n3. Copy Web client ID\n4. Add redirect URIs in Google Cloud Console\n5. Test authentication'
              );
            }
          }
        ]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Finance Tracker
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Manage your finances with ease
            </Text>

            {/* Google Sign-In Button - Primary Action */}
            <Button
              mode="contained"
              onPress={handleGoogleAuth}
              loading={googleLoading}
              disabled={googleLoading}
              style={styles.primaryButton}
              labelStyle={styles.primaryButtonLabel}
              icon="google"
            >
              Continue with Google
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            {authMode === 'signup' && (
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
              />
            )}

            <Button
              mode="contained"
              onPress={handleAuth}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <Text style={styles.modeText}>
                {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <Button
                mode="text"
                onPress={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                labelStyle={styles.toggleButtonLabel}
                style={styles.toggleButton}
              >
                {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  card: {
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.025,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  primaryButton: {
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  primaryButtonLabel: {
    color: '#374151',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
    paddingVertical: 4,
    backgroundColor: '#000000',
  },
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  modeText: {
    color: '#6b7280',
    fontSize: 14,
  },
  toggleButton: {
    marginLeft: 4,
  },
  toggleButtonLabel: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
