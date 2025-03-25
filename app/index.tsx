// app/index.tsx

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/(tabs)'); // if already logged in, jump to tabs
      } else {
        router.replace('/login'); // otherwise jump to login page
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
