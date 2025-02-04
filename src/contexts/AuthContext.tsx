import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthContextType, UserProfile, UserRole } from '../types/auth';
import { UserRoles } from '../types/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          // Convert Firebase user to our UserProfile type
          setUser({
            ...firebaseUser,
            role: userData?.role || UserRoles.WORKER, // Default to worker role if not found
          });
        } catch (err) {
          console.error('Error fetching user role:', err);
          setUser({
            ...firebaseUser,
            role: UserRoles.WORKER, // Default to worker role on error
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Starting sign in process');
      setError(null);
      setIsLoading(true);

      // Simplified online check
      const isOnline = navigator.onLine;
      console.log('AuthContext: Network status - ', isOnline ? 'online' : 'offline');

      if (!isOnline) {
        setError('No internet connection. Please check your network and try again.');
        return false;
      }

      // Check if Firebase auth is initialized
      if (!auth) {
        console.error('AuthContext: Firebase auth not initialized');
        setError('Firebase authentication not initialized');
        return false;
      }

      // Check if Firestore is initialized
      if (!db) {
        console.error('AuthContext: Firestore not initialized');
        setError('Database not initialized');
        return false;
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Firebase auth successful', result.user.uid);

      try {
        // Get user role from Firestore with timeout
        const userDocRef = doc(db, 'users', result.user.uid);
        console.log('AuthContext: Attempting to fetch user document');
        
        const userDoc = await Promise.race([
          getDoc(userDocRef),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database request timeout')), 10000)
          )
        ]);

        if (!userDoc.exists()) {
          console.warn('AuthContext: No user document found in Firestore');
          // Create a default user document if it doesn't exist
          await setDoc(userDocRef, {
            role: UserRoles.WORKER,
            email: result.user.email,
            createdAt: new Date().toISOString(),
          });
          console.log('AuthContext: Created default user document');
        } else {
          console.log('AuthContext: Firestore user data:', userDoc.data());
        }
      } catch (firestoreErr) {
        console.error('AuthContext: Firestore error:', firestoreErr);
        // Don't fail the sign-in if Firestore fails, but log the error
        if (firestoreErr.message === 'Database request timeout') {
          setError('Database connection timed out. Please try again.');
        } else {
          setError('Error connecting to database. Please try again.');
        }
      }

      return true;
    } catch (err) {
      console.error('AuthContext: Sign in error:', err);
      if (err.code) {
        // Handle specific Firebase auth errors
        switch (err.code) {
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          case 'auth/user-disabled':
            setError('This account has been disabled');
            break;
          case 'auth/user-not-found':
            setError('No account found with this email');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password');
            break;
          default:
            setError((err as Error).message);
        }
      } else {
        setError((err as Error).message);
      }
      return false;
    } finally {
      console.log('AuthContext: Sign in process complete');
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, displayName: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(firebaseUser, { displayName });
      
      // Save user role to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        role,
        email,
        displayName,
        createdAt: new Date().toISOString(),
      });
      
      // Set user in state
      setUser({
        ...firebaseUser,
        role,
        displayName,
      });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  // Add network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network status: online');
      // Optionally refresh data here
    };

    const handleOffline = () => {
      console.log('Network status: offline');
      setError('Lost internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 