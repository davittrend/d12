import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../database';
import { logFirebaseError } from '../errors';
import type { BoardSync, SyncCallback, ErrorCallback, SyncSubscription } from './types';
import type { PinterestBoard } from '@/types/pinterest';

export class FirebaseBoardSync implements BoardSync {
  private subscriptions = new Map<string, SyncCallback<Record<string, PinterestBoard[]>>>();
  private errorHandlers = new Map<string, ErrorCallback>();

  subscribe(
    path: string,
    onData: SyncCallback<Record<string, PinterestBoard[]>>,
    onError?: ErrorCallback
  ): SyncSubscription {
    const dbRef = ref(database, path);
    
    if (onError) {
      this.errorHandlers.set(path, onError);
    }

    this.subscriptions.set(path, onData);

    const callback = (snapshot: DataSnapshot) => {
      try {
        const boards: Record<string, PinterestBoard[]> = {};
        snapshot.forEach((child) => {
          boards[child.key!] = child.val();
        });
        onData(boards);
      } catch (error) {
        logFirebaseError('Board Sync', error);
        if (onError) {
          onError(error instanceof Error ? error : new Error('Board sync failed'));
        }
      }
    };

    onValue(dbRef, callback, (error) => {
      logFirebaseError('Board Sync Error', error);
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

  watchUserBoards(userId: string): SyncSubscription {
    return this.subscribe(
      `users/${userId}/boards`,
      (boards) => {
        console.log('Boards updated:', Object.keys(boards).length);
      },
      (error) => {
        console.error('Board sync error:', error);
      }
    );
  }
}