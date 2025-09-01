// Google Sign-In Configuration for Firebase
// This is used with Firebase Auth's built-in Google provider

export const GOOGLE_CONFIG = {
  // Web Client ID from Firebase Console
  webClientId: '525395309052-jph56iko8clbj0vtmp25f7r1mj34b0bq.apps.googleusercontent.com',

  // Additional configuration (optional)
  scopes: ['profile', 'email'],
  customParameters: {
    prompt: 'select_account'
  }
};

// Firebase Google Sign-In Setup Instructions:
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
// That's it! Firebase handles the OAuth flow automatically.

export default GOOGLE_CONFIG;
