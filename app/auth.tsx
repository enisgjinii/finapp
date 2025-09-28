import React, { useState } from 'react';
import { StyleSheet, View, Alert, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';

export default function AuthScreen(): React.JSX.Element {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (authMode === 'signup') {
      if (!displayName.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
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
        await signIn(email, password, rememberMe);
        Alert.alert('Success', 'Welcome back!');
      } else {
        await signUp(email, password, displayName.trim());
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Authentication failed';
      
      if (error.message.includes('user-not-found')) {
        errorMessage = 'No account found with this email address';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'Incorrect password';
      } else if (error.message.includes('email-already-in-use')) {
        errorMessage = 'An account with this email already exists';
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'Password is too weak. Please choose a stronger password';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      Alert.alert('Success', 'Welcome!');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Google Sign-In failed';
      
      if (error.message.includes('cancelled')) {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection';
      } else if (error.message.includes('popup')) {
        errorMessage = 'Popup was blocked. Please allow popups and try again';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    // Clear form when switching modes
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {authMode === 'signin' 
                  ? 'Sign in to your Finance Tracker account'
                  : 'Join Finance Tracker to manage your finances'
                }
              </Text>

              {/* Google Sign-In Button - Primary Action */}
              <Button
                mode="contained"
                onPress={handleGoogleAuth}
                loading={googleLoading}
                disabled={googleLoading || loading}
                style={styles.primaryButton}
                labelStyle={styles.primaryButtonLabel}
                icon="google"
              >
                {authMode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email/Password Form */}
              {authMode === 'signup' && (
                <TextInput
                  label="Full Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  mode="outlined"
                  autoCapitalize="words"
                  style={styles.input}
                  disabled={loading || googleLoading}
                />
              )}

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                disabled={loading || googleLoading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                style={styles.input}
                disabled={loading || googleLoading}
              />

              {authMode === 'signup' && (
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry
                  autoComplete="new-password"
                  style={styles.input}
                  disabled={loading || googleLoading}
                />
              )}

              {authMode === 'signin' && (
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => setRememberMe(!rememberMe)}
                    color="#000000"
                    disabled={loading || googleLoading}
                  />
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </View>
              )}

              <Button
                mode="contained"
                onPress={handleAuth}
                loading={loading}
                disabled={loading || googleLoading}
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
                  onPress={switchMode}
                  labelStyle={styles.toggleButtonLabel}
                  style={styles.toggleButton}
                  disabled={loading || googleLoading}
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </Button>
              </View>

              {/* Platform Info */}
              {__DEV__ && (
                <Text style={styles.debugText}>
                  Platform: {Platform.OS} | Auth: {user ? 'Authenticated' : 'Not authenticated'}
                </Text>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 14,
  },
  debugText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});