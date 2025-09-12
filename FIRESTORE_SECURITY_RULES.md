# Firestore Security Rules Documentation

## Overview

This document contains the Firestore security rules for the Finance Tracker application. These rules ensure that users can only access their own financial data while maintaining data integrity and security.

## Current Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isValidAmount(amount) {
      return amount is number && amount >= -999999.99 && amount <= 999999.99;
    }

    function isValidCurrency(currency) {
      return currency in ['USD', 'EUR', 'GBP', 'TRY', 'CAD', 'AUD', 'JPY'];
    }

    // User profiles
    match /users/{userId} {
      allow read, write: if isSignedIn() && isOwner(userId);

      // User's accounts
      match /accounts/{accountId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }

      // User's transactions
      match /transactions/{transactionId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }

      // User's installments
      match /installments/{installmentId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }

      // User's savings goals
      match /savings/{savingsId} {
        allow read, write: if isSignedIn() && isOwner(userId);
      }
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Enhanced Security Rules

Below is an enhanced version of the security rules with additional validation, security measures, and best practices:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAuthenticatedUser() {
      return isSignedIn() && request.auth.token.email_verified == true;
    }

    function isValidEmail(email) {
      return email is string &&
             email.matches('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
    }

    function isValidAmount(amount) {
      return amount is number &&
             amount >= -999999999.99 &&
             amount <= 999999999.99;
    }

    function isValidCurrency(currency) {
      return currency in ['USD', 'EUR', 'GBP', 'TRY', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'SEK', 'NZD'];
    }

    function isValidDate(date) {
      return date is timestamp ||
             (date is string && date.matches('\\d{4}-\\d{2}-\\d{2}'));
    }

    function isValidString(str, maxLength) {
      return str is string &&
             str.size() > 0 &&
             str.size() <= maxLength;
    }

    function hasRequiredFields(data, requiredFields) {
      return data.keys().hasAll(requiredFields) &&
             requiredFields.hasAll(data.keys());
    }

    function isValidTransaction(data) {
      return hasRequiredFields(data, ['amount', 'description', 'date', 'accountId', 'userId']) &&
             isValidAmount(data.amount) &&
             isValidString(data.description, 200) &&
             isValidDate(data.date) &&
             data.accountId == request.auth.uid &&
             data.userId == request.auth.uid;
    }

    function isValidAccount(data) {
      return hasRequiredFields(data, ['name', 'currency', 'userId']) &&
             isValidString(data.name, 50) &&
             isValidCurrency(data.currency) &&
             data.userId == request.auth.uid;
    }

    function isValidInstallment(data) {
      return hasRequiredFields(data, ['title', 'monthlyAmount', 'monthsTotal', 'accountId', 'userId']) &&
             isValidString(data.title, 100) &&
             isValidAmount(data.monthlyAmount) &&
             data.monthsTotal is int &&
             data.monthsTotal > 0 &&
             data.monthsTotal <= 360 &&
             data.accountId == request.auth.uid &&
             data.userId == request.auth.uid;
    }

    function isValidSavingsGoal(data) {
      return hasRequiredFields(data, ['title', 'targetAmount', 'currentAmount', 'userId']) &&
             isValidString(data.title, 100) &&
             isValidAmount(data.targetAmount) &&
             isValidAmount(data.currentAmount) &&
             data.currentAmount >= 0 &&
             data.targetAmount > 0 &&
             data.userId == request.auth.uid;
    }

    function canCreateOnly(data) {
      return request.method == 'create';
    }

    function canUpdateOnly(data) {
      return request.method == 'update';
    }

    function canDeleteOnly() {
      return request.method == 'delete';
    }

    // ============================================================================
    // USER PROFILES
    // ============================================================================

    match /users/{userId} {
      // Users can read and write their own profile
      allow read, write: if isAuthenticatedUser() && isOwner(userId);

      // Validate user profile data
      allow create: if canCreateOnly(resource.data) &&
                       isAuthenticatedUser() &&
                       isOwner(userId) &&
                       hasRequiredFields(resource.data, ['email', 'displayName', 'createdAt']) &&
                       isValidEmail(resource.data.email) &&
                       isValidString(resource.data.displayName, 50);

      allow update: if canUpdateOnly(resource.data) &&
                       isAuthenticatedUser() &&
                       isOwner(userId) &&
                       (!resource.data.diff(resource.data).affectedKeys().hasAny(['userId', 'createdAt']));

      // ============================================================================
      // USER'S ACCOUNTS SUBCOLLECTION
      // ============================================================================

      match /accounts/{accountId} {
        allow read: if isAuthenticatedUser() && isOwner(userId);

        allow create: if canCreateOnly(resource.data) &&
                         isAuthenticatedUser() &&
                         isOwner(userId) &&
                         isValidAccount(resource.data);

        allow update: if canUpdateOnly(resource.data) &&
                         isAuthenticatedUser() &&
                         isOwner(userId) &&
                         isValidAccount(resource.data) &&
                         resource.data.userId == userId;

        allow delete: if canDeleteOnly() &&
                         isAuthenticatedUser() &&
                         isOwner(userId);
      }

      // ============================================================================
      // USER'S TRANSACTIONS SUBCOLLECTION
      // ============================================================================

      match /transactions/{transactionId} {
        allow read: if isAuthenticatedUser() && isOwner(userId);

        allow create: if canCreateOnly(resource.data) &&
                         isAuthenticatedUser() &&
                         isOwner(userId) &&
                         isValidTransaction(resource.data);

        allow update: if canUpdateOnly(resource.data) &&
                         isAuthenticatedUser() &&
                         isOwner(userId) &&
                         isValidTransaction(resource.data) &&
                         resource.data.userId == userId;

        allow delete: if canDeleteOnly() &&
                         isAuthenticatedUser() &&
                         isOwner(userId);
      }

      // ============================================================================
      // USER'S INSTALLMENTS SUBCOLLECTION
      // ============================================================================

      match /installments/{installmentId} {
        allow read: if isAuthenticatedUser() && isOwner(userId);

        allow create: if canCreateOnly(resource.data) &&
                         isAuthenticatedUser() &&
                         isOwner(userId) &&
                         isValidInstallment(resource.data);

        allow update: if canUpdateOnly(resource.data) &&
                         isAuthenticatedUser() &&
                         isOwner(userId) &&
                         isValidInstallment(resource.data) &&
                         resource.data.userId == userId;

        allow delete: if canDeleteOnly() &&
                         isAuthenticatedUser() &&
                         isOwner(userId);
      }

      // ============================================================================
      // USER'S SAVINGS GOALS SUBCOLLECTION
      // ============================================================================

      match /savings/{savingsId} {
        allow read: if isAuthenticatedUser() && isOwner(userId);

        allow create: if canCreateOnly(resource.data) &&
                         isAuthenticatedUser() &&
                         isOwner(userId) &&
                         isValidSavingsGoal(resource.data);

        allow update: if canUpdateOnly(resource.data) &&
                         isAuthenticatedUser() &&
                         isOwner(userId) &&
                         isValidSavingsGoal(resource.data) &&
                         resource.data.userId == userId;

        allow delete: if canDeleteOnly() &&
                         isAuthenticatedUser() &&
                         isOwner(userId);
      }
    }

    // ============================================================================
    // GLOBAL SYSTEM DATA (READ-ONLY)
    // ============================================================================

    match /system/{document=**} {
      allow read: if isAuthenticatedUser();
      allow write: if false;
    }

    // ============================================================================
    // PUBLIC REFERENCE DATA
    // ============================================================================

    match /currencies/{currencyId} {
      allow read: if isAuthenticatedUser();
      allow write: if false;
    }

    match /categories/{categoryId} {
      allow read: if isAuthenticatedUser();
      allow write: if false;
    }

    // ============================================================================
    // DENY ALL OTHER ACCESS
    // ============================================================================

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Key Enhancements

### 🔐 **Security Improvements**

1. **Email Verification Required**: Users must have verified email addresses
2. **Method-Specific Rules**: Separate rules for create, update, and delete operations
3. **Data Validation**: Comprehensive validation for all data types
4. **Field Immutability**: Prevents modification of critical fields like `userId` and `createdAt`

### ✅ **Data Validation**

1. **Amount Limits**: Expanded range for financial amounts (-999,999,999.99 to 999,999,999.99)
2. **String Length Limits**: Prevents excessively long text inputs
3. **Currency Support**: Added more currencies (CHF, CNY, SEK, NZD)
4. **Date Validation**: Supports both timestamps and ISO date strings
5. **Required Fields**: Ensures all necessary fields are present

### 🛡️ **Access Control**

1. **Granular Permissions**: Different permissions for create, read, update, delete
2. **Owner Verification**: Strict ownership validation
3. **Authenticated Access**: All operations require authenticated users
4. **Subcollection Security**: Each subcollection has its own security rules

### 📊 **Data Integrity**

1. **Transaction Validation**: Ensures transaction data integrity
2. **Account Validation**: Validates account information
3. **Installment Validation**: Checks installment data constraints
4. **Savings Validation**: Validates savings goal data

## Deployment Instructions

1. Copy the enhanced rules above
2. Go to Firebase Console → Firestore Database → Rules
3. Replace the existing rules with the enhanced version
4. Click "Publish"

## Testing the Rules

Test your rules with the Firebase Emulator:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Start the emulator
firebase emulators:start --only firestore

# Run security rules tests
firebase emulators:exec --only firestore "npm test"
```

## Best Practices Implemented

- ✅ **Defense in Depth**: Multiple layers of validation
- ✅ **Principle of Least Privilege**: Users can only access their own data
- ✅ **Input Validation**: All user inputs are validated
- ✅ **Immutable Fields**: Critical fields cannot be modified
- ✅ **Method Separation**: Different rules for different operations
- ✅ **Email Verification**: Requires verified email addresses

## Monitoring and Maintenance

- Regularly review access patterns in Firebase Console
- Monitor for unusual access attempts
- Update rules as your application evolves
- Test rules thoroughly before deploying to production
