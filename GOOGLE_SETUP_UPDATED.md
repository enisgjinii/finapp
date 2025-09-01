# Google Sign-In Setup Guide (Updated for Expo)

## Current Status
✅ **Email/Password Authentication**: Fully functional and working
⚠️ **Google Sign-In**: Shows setup message - requires additional configuration

## Quick Start (Use Email/Password for now)

Your app is ready to use with email/password authentication! The Google Sign-In button shows a helpful message directing users to use email/password while you complete the setup.

## To Enable Google Sign-In (Optional)

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable the **Google** provider
5. Copy the **Web client ID**

### 2. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set **Application type** to **Web application**
6. Add authorized domains:
   - `localhost` (for development)
   - Your production domain
7. Copy the **Client ID**

### 3. Update Configuration
Edit `src/config/google.ts`:

```typescript
export const GOOGLE_CONFIG = {
  webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
  accountName: '',
};
```

### 4. Update AuthProvider (Optional)
Replace the Google Sign-In method in `src/providers/AuthProvider.tsx` with:

```typescript
const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    // For Expo, you can use Firebase's built-in Google provider
    // or implement Expo Auth Session for more control
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw new Error(error.message || 'Google sign-in failed');
  }
};
```

## Why This Approach?

- **Immediate Functionality**: Users can start using the app right away
- **Gradual Enhancement**: Add Google Sign-In when ready
- **Better UX**: No broken features while setting up OAuth
- **Flexible**: Supports both Expo and bare React Native

## Testing

1. **Current**: Use email/password authentication
2. **Future**: Enable Google Sign-In following the steps above
3. **Production**: Test on real devices with proper OAuth setup

---

**Your Finance Tracker is ready to use!** 🚀

Users can:
- ✅ Create accounts with email/password
- ✅ Sign in/out securely
- ✅ Access all features
- ✅ View setup guide for Google Sign-In when ready
