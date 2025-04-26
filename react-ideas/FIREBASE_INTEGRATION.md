# Firebase Integration Guide

This React app is already configured to use the same Firebase database as the original HTML/JS version. Here's how the integration works and how you can modify it if needed.

## Current Configuration

The app uses the following Firebase services:
- **Firebase Authentication**: For user login and registration
- **Firestore Database**: For storing and retrieving ideas, comments, and other data
- **Firebase Analytics**: For tracking app usage (optional)

## How It Works

1. **Firebase Configuration**: The connection to Firebase is set up in `src/firebase.js`
2. **Authentication**: The app uses a custom `AuthContext` to manage authentication state
3. **Data Access**: Firestore queries are used in various components to access and modify data

## Using the Same Database

This React app is already configured to use the same Firebase project as the original HTML/JS version, so all data will be shared between both applications. This means:

- Users can log in with the same credentials in both apps
- Ideas created in one app will be visible in the other
- Changes to shared data will be reflected in both applications

## How to Modify Firebase Configuration

If you need to connect to a different Firebase project:

1. Open `src/firebase.js`
2. Replace the `firebaseConfig` object with your new project's configuration
3. Make sure your new Firebase project has the required services enabled:
   - Authentication (with Email/Password and Google providers)
   - Firestore Database
   - Analytics (optional)

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Firestore Data Structure

The app expects the following collections in Firestore:

- **ideas**: Contains all ideas with fields like `title`, `description`, `authorUid`, etc.
- **brainstorms**: Contains brainstorming content for ideas
- **questionAnswers**: Contains answers to questions in the Motivation section

## Security Rules

Make sure your Firestore security rules allow authenticated users to read/write their own data. Example rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ideas/{ideaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorUid;
    }
    
    match /brainstorms/{brainstormId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /questionAnswers/{answerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorUid;
    }
  }
}
```

## Troubleshooting

- **Authentication Issues**: Check that the authorized domains in your Firebase project include your deployment domain
- **Permission Errors**: Review your Firestore security rules
- **Missing Data**: Make sure the data structure in Firestore matches what the app expects
- **Deployment Problems**: If analytics fails, check browser console and consider conditionally loading analytics 