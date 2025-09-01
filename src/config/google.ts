import { GoogleAuthProvider } from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

// Google Sign-In Configuration for Expo
export const GOOGLE_CONFIG = {
  // Web Client ID from Firebase Console
  webClientId: '525395309052-jph56iko8clbj0vtmp25f7r1mj34b0bq.apps.googleusercontent.com',

  // iOS Client ID (if you have iOS app)
  iosClientId: '',

  // Android Client ID (if you have Android app)
  androidClientId: '',

  // Redirect URI scheme (matches app.json scheme)
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'myapp',
    path: 'auth'
  }),

  // Additional configuration (optional)
  scopes: ['profile', 'email'],
  customParameters: {
    prompt: 'select_account'
  }
};

// Expo Google Sign-In Setup Instructions:
//
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Select your project (finapp-551d3)
// 3. Go to Authentication > Sign-in method
// 4. Click on "Google" provider
// 5. Click "Enable"
// 6. Copy the "Web client ID" and replace YOUR_WEB_CLIENT_ID above
// 7. Add your domain to authorized domains if needed
//
// For Expo apps:
// 8. Update app.json with proper redirect URIs:
//    {
//      "expo": {
//        "scheme": "your-app-scheme"
//      }
//    }
//
// 9. Use expo-auth-session for Google Sign-In instead of @react-native-google-signin

export default GOOGLE_CONFIG;
