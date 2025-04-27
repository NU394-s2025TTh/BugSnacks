/*
 * Custom React hook that listens for Firebase Authentication state changes
 * and provides the current user's UID (or null if not signed in).
 */
// All comments made in the file were done by OpenAI's o4-mini model

// Import listener for Firebase Auth state changes
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '@/firebaseConfig';

// Define a custom hook to expose the current user ID
export function useUserId() {
  // Local state to hold the current user's UID (or null if no user)
  const [userId, setUserId] = useState<string | null>(null);

  // Set up the auth state listener when the component mounts
  useEffect(() => {
    // Subscribe to auth state changes and update local state
    const unsub = onAuthStateChanged(auth, (user) => setUserId(user?.email ?? null));
    // Clean up the subscription when the component unmounts
    return unsub;
  }, []);

  return userId;
}
