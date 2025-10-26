
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  '@firebase/auth: Auth (10.12.1): You are initializing Firebase Auth for React Native without providing AsyncStorage.',
]);

// This file sits under `app/` but is not a route; provide a harmless default
// export so the router doesn't warn about a missing default export.
import React from 'react';
export default function WarningsRoute() {
  return null;
}