import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../database';
import { logFirebaseError } from '../errors';
import type { AccountSync, SyncCallback, ErrorCallback, SyncSubscription } from './types';
import type { PinterestAccount } from '@/types/pinterest';

export class FirebaseAccountSync implements AccountSync {
  private subscriptions = new Map<string, SyncCallback<PinterestAccount[]>>();
  private errorHandlers = new Map<string, ErrorCallback>();

  subscribe(
    path: string,
    onData: SyncCallback<PinterestAccount[]>,
    onError?: ErrorCallback
  ): SyncSubscription {
    const dbRef = ref(database, path);
    
    if (onError) {
      this.errorHandlers.set(path, onError);
    }

    this.subscriptions.set(path, onData);

    const callback = (snapshot: DataSnapshot) => {
      try {
        const accounts: PinterestAccount[] = [];
        snapshot.forEach((child) => {
          accounts.push({
            id: child.key!,
            ...child.val()
          });
        });
        onData(accounts);
      } catch (error) {
        logFirebaseError('Account Sync', error);
        if (onError) {
          onError(error instanceof Error ? error : new Error('Account sync failed'));
        }
      }
    };

    onValue(dbRef, callback, (error) => {
      logFirebaseError('Account Sync Error', error);
      if (onError) {
        onError(error);
      }
    });

    return {
      unsubscribe: () => this.unsubscribe(path)
    };
  }

  unsubscribe(path: string): void {
    const dbRef = ref(database, path);
    off(dbRef);
    this.subscriptions.delete(path);
    this.errorHandlers.delete(path);
  }

  watchUserAccounts(userId: string): SyncSubscription {
    return this.subscribe(
      `users/${userId}/accounts`,
      (accounts) => {
        console.log('Accounts updated:', accounts.length);
      },
      (error) => {
        console.error('Account sync error:', error);
      }
    );
  }
}