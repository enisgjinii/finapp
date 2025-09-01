# Google Sign-In Setup Guide

## Overview
This guide will help you set up Google Sign-In for your Finance Tracker app. The app supports both email/password authentication and Google authentication.

## Prerequisites
- Firebase project set up
- Google Cloud Console access
- Expo CLI or React Native CLI

## Firebase Configuration

### 1. Enable Google Sign-In in Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable the **Google** provider
5. Copy the **Web client ID** - you'll need this later

### 2. Configure Google Cloud Console

#### For Web (Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set **Application type** to **Web application**
6. Add your authorized domains:
   - `localhost` (for development)
   - Your production domain
7. Copy the **Client ID** - this is your Web Client ID

#### For Mobile Apps (Optional - for native apps)
1. In the same Google Cloud Console, create additional OAuth client IDs:
   - **iOS**: Set Application type to iOS
   - **Android**: Set Application type to Android
2. Use your app's bundle ID/package name

## App Configuration

### 1. Update Google Configuration
Edit `src/config/google.ts`:

```typescript
export const GOOGLE_CONFIG = {
  // Replace with your actual web client ID from Firebase Console
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',

  // For iOS (if you have iOS app)
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',

  // For Android (if you have Android app)
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',

  // Additional configuration
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
  accountName: '',
};
```

### 2. Update Firebase Configuration
Make sure your `src/config/firebase.ts` has the correct Firebase config with Google enabled.

## Expo Setup (for Expo apps)

### 1. Configure app.json
Add the following to your `app.json`:

```json
{
  "expo": {
    "scheme": "your-app-scheme",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

### 2. Install Dependencies
The required dependencies are already installed:
- `@react-native-google-signin/google-signin`
- `firebase` (with auth)

## React Native CLI Setup (for bare RN apps)

### 1. iOS Setup
1. Add the following to your `ios/YourAppName/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

2. Run `cd ios && pod install`

### 2. Android Setup
1. Add the following to your `android/app/build.gradle`:

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

2. Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
    <meta-data
        android:name="com.google.android.gms.version"
        android:value="@integer/google_play_services_version" />
</application>
```

## Testing

### 1. Development Testing
1. Start your app with `expo start` or `npx react-native run-ios/android`
2. Try the Google Sign-In button
3. Check Firebase Authentication console to see authenticated users

### 2. Production Setup
1. Update all client IDs with production values
2. Configure proper redirect URIs in Google Cloud Console
3. Test on real devices

## Troubleshooting

### Common Issues:

1. **"Google Sign-In requires native configuration"**
   - Make sure you've completed the platform-specific setup
   - Check that client IDs are correctly configured

2. **"Invalid client" error**
   - Verify your client IDs match between Firebase and Google Cloud Console
   - Check that the correct client ID is used for each platform

3. **iOS: "Google Sign-In cancelled"**
   - Ensure URL schemes are properly configured in Info.plist
   - Check that the iOS client ID is correct

4. **Android: "Google Sign-In failed"**
   - Verify SHA-1 fingerprint is added to Firebase project
   - Check Android client ID configuration

### Debug Tips:
1. Check Firebase console for authentication errors
2. Use React Native debugger to inspect error messages
3. Test with different Google accounts
4. Verify internet connection and Google Play Services (Android)

## Security Notes

- ✅ **Email verification required** by default in Firestore rules
- ✅ **User data isolation** - users can only access their own data
- ✅ **Secure token handling** - Firebase handles token validation
- ✅ **OAuth 2.0 compliance** - follows Google OAuth best practices

## Support

If you encounter issues:
1. Check the [Firebase documentation](https://firebase.google.com/docs/auth/web/google-signin)
2. Review the [@react-native-google-signin/google-signin docs](https://github.com/react-native-google-signin/google-signin)
3. Check Firebase console for detailed error messages

---

**Note**: Make sure to replace all placeholder values with your actual client IDs before deploying to production.
