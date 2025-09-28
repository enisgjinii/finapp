import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session for Expo
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  // Web Client ID from Firebase Console
  webClientId: '525395309052-jph56iko8clbj0vtmp25f7r1mj34b0bq.apps.googleusercontent.com',
  
  // OAuth scopes
  scopes: ['openid', 'profile', 'email'],
  
  // Additional parameters
  additionalParameters: {},
  
  // Custom parameters for Google OAuth
  customParameters: {
    prompt: 'select_account',
  },
};

// Create redirect URI for different platforms
export const getRedirectUri = () => {
  if (Platform.OS === 'web') {
    // For web, use the current origin
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return 'http://localhost:8081/auth/callback';
  }
  
  // For mobile, use Expo's redirect URI
  return AuthSession.makeRedirectUri({
    scheme: 'myapp',
    path: 'auth/callback'
  });
};

// Google OAuth endpoints
export const GOOGLE_OAUTH_ENDPOINTS = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

export default GOOGLE_CONFIG;