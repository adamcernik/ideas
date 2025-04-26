# Idea Exchange React App

This is a React-based version of the Idea Exchange platform that uses Firebase for authentication and data storage.

## Setup

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd react-ideas
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```
5. The app will open in your browser at `http://localhost:3000`

## Deployment

The app is configured for deployment to GitHub Pages:

1. Install the gh-pages package:
   ```
   npm install gh-pages --save-dev
   ```

2. Deploy the app to GitHub Pages:
   ```
   npm run deploy
   ```

3. The app will be available at `https://jiriadamcernik.github.io/ideas`

## Features

- User authentication (login, register, Google sign-in)
- Idea management (create, view, delete)
- Tag-based categorization
- Responsive design for all devices

## Firebase Configuration

The app uses Firebase for authentication and Firestore for data storage. The Firebase configuration is already set up in the `src/firebase.js` file.

## Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects the app from Create React App (one-way operation)
- `npm run deploy` - Deploys the app to GitHub Pages 