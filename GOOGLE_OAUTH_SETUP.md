# Google OAuth Setup Guide (Complete Configuration)

## 🚨 Issue: "URL was not found on this server"

The error you're seeing occurs because Google OAuth requires **exact redirect URIs** to be registered in Google Cloud Console. The Expo development URL (`exp://192.168.31.9:8082`) is not registered as an authorized redirect URI.

## 🔧 Step-by-Step Setup

### Step 1: Firebase Console Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `finapp-551d3`
3. **Navigate to Authentication**:
   - Click **Authentication** in the left sidebar
   - Click **Sign-in method** tab
4. **Enable Google Provider**:
   - Find **Google** in the provider list
   - Click on it
   - Toggle **Enable** to ON
   - **Copy the Web client ID** (you already have this)

### Step 2: Google Cloud Console Configuration

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (same as Firebase project)
3. **Navigate to APIs & Services** > **Credentials**
4. **Find your OAuth 2.0 Client ID** (Web application)
5. **Edit the client** and add these redirect URIs:

#### For Development (Expo):
```
http://localhost:8082
https://auth.expo.io/@yourusername/finapp
exp://127.0.0.1:8082
http://localhost:8081
https://localhost:8081
```

#### For Mobile Testing:
```
exp://127.0.0.1:8082
exp://192.168.1.1:8082
exp://192.168.31.9:8082
```

#### For Production (when you deploy):
```
https://yourdomain.com
https://yourdomain.com/auth
```

### Step 3: Update Authorized Domains in Firebase

1. **In Firebase Console** > **Authentication** > **Settings**
2. **Click "Add domain"** and add these authorized domains:
   - `auth.expo.io` (for Expo development)
   - `127.0.0.1` (for local development)
   - Your production domain (when deployed, e.g., `yourdomain.com`)

3. **Your current domains should include**:
   - `localhost` ✅ (already there)
   - `finapp-551d3.firebaseapp.com` ✅ (already there)
   - `finapp-551d3.web.app` ✅ (already there)
   - `auth.expo.io` ❌ (NEED TO ADD THIS)

### Step 4: Test the Configuration

1. **Restart your Expo app**:
   ```bash
   npm run dev
   ```

2. **Try Google Sign-In**:
   - Click "Continue with Google"
   - Should now work without the "URL not found" error

## 🔍 What Was Wrong

The OAuth flow was trying to use:
- **Client ID**: `525395309052-jph56iko8clbj0vtmp25f7r1mj34b0bq.apps.googleusercontent.com` ✅ (Correct)
- **Redirect URI**: `exp://192.168.31.9:8082` ❌ (Not registered in Google Cloud Console)

## ✅ Current Implementation Status

Your app now uses **Firebase's built-in Google authentication** which is:
- ✅ **Properly configured** for Firebase
- ✅ **Cross-platform compatible** (Web, iOS, Android)
- ✅ **Secure** OAuth 2.0 implementation
- ✅ **Error handling** for different scenarios

## 🧪 Testing Google Sign-In

### For Web:
- Opens popup for Google authentication
- Requires popup permissions in browser

### For Mobile (Expo Go):
- Opens system browser
- Redirects back to app after authentication

### Expected Flow:
1. Click "Continue with Google"
2. Browser/system browser opens
3. Google authentication page appears
4. User signs in with Google
5. Redirects back to your app
6. User is authenticated and logged in

## 🔧 Troubleshooting

### Still getting "URL not found"?
1. **Double-check redirect URIs** in Google Cloud Console
2. **Make sure client ID is correct**
3. **Try different browser** (some block popups)
4. **Check Firebase Console** for authentication errors

### For Mobile Testing:
1. **Use Expo Go app** on your phone
2. **Scan QR code** from terminal
3. **Try Google Sign-In** on actual device

### Development vs Production:
- **Development**: Uses Expo development URLs
- **Production**: Needs your domain registered

## 📱 Platform-Specific Notes

### Web Development:
- Works with popup authentication
- May require allowing popups in browser

### Mobile Development:
- Uses redirect authentication
- Works with Expo Go
- Requires proper redirect URI registration

### Production Deployment:
- Register your production domain
- Update redirect URIs accordingly
- Test on actual devices

## 🎯 Quick Test

1. **Complete steps 1-3 above** (Firebase + Google Cloud Console)
2. **Restart Expo**: `npm run dev`
3. **Test Google Sign-In** on web or mobile
4. **Check Firebase Console** > Authentication > Users to verify

---

## 📞 Support

If you continue having issues:

1. **Check Firebase Console** logs
2. **Verify redirect URIs** exactly match
3. **Test with different browsers**
4. **Try on actual mobile device**

**Once configured correctly, Google Sign-In will work seamlessly!** 🚀</contents>
</xai:function_call">Wrote contents to /Users/enisgjini/Desktop/finapp/GOOGLE_OAUTH_SETUP.md

Assistant: Now I should update the auth screen to provide a helpful message when Google Sign-In fails due to configuration issues. This will guide users to the setup guide.<|control273|><xai:function_call name="search_replace">
<parameter name="file_path">/Users/enisgjini/Desktop/finapp/app/auth.tsx
