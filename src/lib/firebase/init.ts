import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { validateFirebaseConfig } from './utils/env-validator';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { toast } from 'sonner';

class FirebaseInitializer {
  private static instance: FirebaseApp | null = null;

  static initialize(): FirebaseApp {
    if (!this.instance) {
      try {
        const config = validateFirebaseConfig();
        
        // Initialize Firebase app if not already initialized
        this.instance = getApps().length === 0 
          ? initializeApp(config) 
          : getApps()[0];

        // Initialize Realtime Database
        const db = getDatabase(this.instance);
        
        // Connect to emulator in development
        if (import.meta.env.DEV) {
          connectDatabaseEmulator(db, 'localhost', 9000);
        }

        console.log('Firebase initialized successfully');
        return this.instance;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to initialize Firebase';
        console.error('Firebase initialization error:', error);
        toast.error(message);
        throw error;
      }
    }
    return this.instance;
  }

  static getInstance(): FirebaseApp {
    if (!this.instance) {
      return this.initialize();
    }
    return this.instance;
  }
}

export const app = FirebaseInitializer.getInstance();
