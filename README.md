# Finance Tracker Mobile

A comprehensive React Native finance tracking app built with Expo, React Native Paper, and Firebase.

## Features

- 📱 **Multi-Account Management**: Track finances across TEB, Paysera, OneFor, PayPal, and Cash
- 💰 **Transaction Tracking**: Income, expenses, and transfers with categories and tags
- 📅 **Installment Management**: Track and pay monthly installments with progress tracking
- 🎯 **Savings Goals**: Set and track progress toward financial goals
- 📊 **Financial Analytics**: Yearly and monthly summaries with visual charts
- 📥 **CSV Import**: Import transactions from bank statements with column mapping
- 🔄 **Offline Support**: Works offline with automatic sync when connected
- 🔐 **Secure Authentication**: Email/password and Google Sign-In with Firebase Auth
- 🌙 **Dark Mode**: Adaptive theming with system preference detection

## Tech Stack

- **Framework**: Expo (React Native)
- **UI Library**: React Native Paper (Material Design 3)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Yup validation
- **Charts**: Victory Native
- **File Handling**: Expo Document Picker + File System

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Copy your Firebase config and replace the placeholder in `src/config/firebase.ts`
5. Deploy the Firestore rules from `firestore.rules`

## Installation

```bash
npm install
npm run dev
```

## Architecture

### Data Model

All user data is stored under `users/{uid}/` collections:

- **accounts**: Account information with balances
- **transactions**: All financial transactions
- **installments**: Monthly payment tracking
- **savings**: Savings goals and progress
- **imports**: CSV import session history

### Security

- Row-level security enforced via Firestore rules
- All data scoped to authenticated user
- Server-side validation and sanitization
- Secure file upload with Firebase Storage

### Offline Support

- Firestore offline persistence enabled
- Optimistic updates with error handling
- Automatic sync when connection restored
- Queue management for failed operations

## Usage

1. **Sign Up/In**: Create account or sign in with existing credentials
2. **Add Accounts**: Set up your financial accounts (banks, cards, cash)
3. **Track Transactions**: Log income, expenses, and transfers
4. **Manage Installments**: Track monthly payments and due dates
5. **Set Savings Goals**: Create and track progress toward financial targets
6. **Import Data**: Upload CSV files from your bank statements
7. **View Analytics**: Monitor your financial health with charts and summaries

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details