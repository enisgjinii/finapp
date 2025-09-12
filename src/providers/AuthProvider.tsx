import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';
import { GOOGLE_CONFIG } from '../config/google';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes - Firebase handles persistence automatically
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in with Expo AuthSession...');

      // Create the auth request
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CONFIG.webClientId,
        scopes: GOOGLE_CONFIG.scopes,
        redirectUri: GOOGLE_CONFIG.redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: GOOGLE_CONFIG.customParameters,
      });

      // Perform the auth request
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.id_token) {
        console.log('Google sign-in completed successfully');

        // Create Firebase credential from Google sign-in
        const googleCredential = GoogleAuthProvider.credential(result.params.id_token);

        // Sign in to Firebase with the Google credential
        const firebaseResult = await signInWithCredential(auth, googleCredential);
        console.log('Firebase authentication successful:', firebaseResult.user.displayName);
      } else if (result.type === 'cancel') {
        throw new Error('Sign-in was cancelled by user');
      } else {
        throw new Error('Google Sign-In failed');
      }

    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(`Google Sign-In failed: ${error.message}`);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
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