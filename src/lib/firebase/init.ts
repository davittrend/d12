import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { validateFirebaseConfig } from './utils/env-validator';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';

class FirebaseInitializer {
  private static instance: FirebaseApp | null = null;

  static initialize(): FirebaseApp {
    if (!this.instance) {
      try {
        const config = validateFirebaseConfig();
        this.instance = getApps().length === 0 
          ? initializeApp(config) 
          : getApps()[0];

        // Initialize Realtime Database with WebSocket transport
        const db = getDatabase(this.instance);
        
        // Use WebSocket transport for better reliability
        const dbURL = new URL(config.databaseURL);
        dbURL.protocol = 'wss:';
        
        // Connect to emulator in development
        if (import.meta.env.DEV) {
          connectDatabaseEmulator(db, 'localhost', 9000);
        }

        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
      }
    }
    return this.instance;
  }
}

export const app = FirebaseInitializer.initialize();
