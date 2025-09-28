import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithCredential,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../config/firebase';
import { GOOGLE_CONFIG, getRedirectUri } from '../config/google';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Secure storage keys
const CREDENTIALS_KEY = 'user_credentials';
const REMEMBER_ME_KEY = 'remember_me_enabled';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Store credentials securely
  const rememberCredentials = async (email: string, password: string) => {
    try {
      await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ email, password }));
      await SecureStore.setItemAsync(REMEMBER_ME_KEY, 'true');
    } catch (error) {
      console.error('Error storing credentials:', error);
    }
  };

  // Clear stored credentials
  const clearCredentials = async () => {
    try {
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  };

  // Auto-login with stored credentials
  const autoLogin = async () => {
    try {
      const storedCredentials = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      const rememberMeEnabled = await SecureStore.getItemAsync(REMEMBER_ME_KEY);

      if (storedCredentials && rememberMeEnabled === 'true') {
        const { email, password } = JSON.parse(storedCredentials);
        console.log('Attempting auto-login for:', email);
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Auto-login successful');
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      // Clear invalid credentials
      await clearCredentials();
    }
  };

  useEffect(() => {
    // Listen for auth state changes - Firebase handles persistence automatically
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      setUser(user);
      
      // Only attempt auto-login if no user is signed in and we're not already loading
      if (!user && loading) {
        await autoLogin();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [loading]);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('Signing in user:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Store credentials if remember me is enabled
      if (rememberMe) {
        await rememberCredentials(email, password);
      } else {
        await clearCredentials();
      }
      
      console.log('Sign-in successful:', result.user.email);
    } catch (error: any) {
      console.error('Sign-in error:', error);
      throw new Error(error.message || 'Sign-in failed');
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('Creating new user:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      console.log('Sign-up successful:', result.user.email);
    } catch (error: any) {
      console.error('Sign-up error:', error);
      throw new Error(error.message || 'Sign-up failed');
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');
      
      if (Platform.OS === 'web') {
        // Web platform - use Firebase popup
        console.log('Using web popup authentication');
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithPopup(auth, provider);
        console.log('Google sign-in successful:', result.user.displayName);
      } else {
        // Mobile platform - use Expo AuthSession
        console.log('Using Expo AuthSession for mobile');
        
        const redirectUri = getRedirectUri();
        console.log('Redirect URI:', redirectUri);

        // Create the auth request
        const request = new AuthSession.AuthRequest({
          clientId: GOOGLE_CONFIG.webClientId,
          scopes: GOOGLE_CONFIG.scopes,
          redirectUri: redirectUri,
          responseType: AuthSession.ResponseType.IdToken,
          extraParams: GOOGLE_CONFIG.customParameters,
        });

        console.log('Auth request created, starting session...');

        // Perform the auth request
        const result = await request.promptAsync({
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        });

        console.log('Auth session result:', result.type);

        if (result.type === 'success' && result.params.id_token) {
          console.log('Received access token, creating Firebase credential...');

          // Create Firebase credential from Google sign-in
          const googleCredential = GoogleAuthProvider.credential(result.params.id_token);

          // Sign in to Firebase with the Google credential
          const firebaseResult = await signInWithCredential(auth, googleCredential);
          console.log('Google sign-in successful:', firebaseResult.user.displayName);
        } else if (result.type === 'cancel') {
          throw new Error('Sign-in was cancelled by user');
        } else {
          console.error('Auth session failed:', result);
          throw new Error('Google Sign-In failed');
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message || 'Google Sign-In failed');
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await clearCredentials(); // Clear stored credentials
      await firebaseSignOut(auth);
      console.log('Sign-out successful');
    } catch (error: any) {
      console.error('Sign-out error:', error);
      throw new Error(error.message || 'Sign-out failed');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};