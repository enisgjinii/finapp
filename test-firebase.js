// Quick Firebase Test Script
// Run this in browser console to test Firebase configuration

// Test 1: Check if Firebase is loaded
console.log('🔍 Testing Firebase configuration...');

// Test 2: Check Firebase config
if (typeof firebase !== 'undefined') {
  console.log('✅ Firebase SDK loaded');

  // Test 3: Check auth configuration
  const auth = firebase.auth();
  console.log('✅ Firebase Auth initialized');

  // Test 4: Check Google provider
  const provider = new firebase.auth.GoogleAuthProvider();
  console.log('✅ Google Auth Provider created');

  // Test 5: Check current user
  const user = auth.currentUser;
  if (user) {
    console.log('👤 Current user:', user.displayName, user.email);
  } else {
    console.log('👤 No user currently signed in');
  }

  console.log('🎉 Firebase test completed successfully!');
} else {
  console.error('❌ Firebase SDK not loaded - check if Firebase scripts are loading');
}

// Test Expo Auth Session (new implementation)
console.log('🔍 Testing Expo Auth Session...');
if (typeof AuthSession !== 'undefined') {
  console.log('✅ Expo Auth Session loaded');
} else {
  console.log('⚠️ Expo Auth Session not available in browser context (normal for web)');
}

// Instructions
console.log(`
📋 Next Steps:
1. Open browser console (F12)
2. Copy and paste this entire script
3. Check if all tests pass with ✅
4. Try Google Sign-In and check for detailed logs
5. If you see "Starting Google sign-in with Expo Auth Session..." then the new implementation is working!

📝 Expected Google Sign-In Logs:
- "Starting Google sign-in with Expo Auth Session..."
- "Redirect URI: exp://..."
- "Auth request created, starting session..."
- "Auth session result: success"
- "Received access token, creating Firebase credential..."
- "Google sign-in successful: [Your Name]"
`);
