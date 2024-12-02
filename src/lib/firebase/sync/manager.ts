import { FirebaseAccountSync } from './accounts';
import { FirebaseBoardSync } from './boards';
import type { SyncManager, SyncSubscription } from './types';
import { toast } from 'sonner';
import { useAccountStore } from '@/lib/store';

export class FirebaseSyncManager implements SyncManager {
  private subscriptions: SyncSubscription[] = [];
  public accounts = new FirebaseAccountSync();
  public boards = new FirebaseBoardSync();

  initialize(userId: string): void {
    console.log('Initializing Firebase sync for user:', userId);

    // Watch accounts
    this.subscriptions.push(
      this.accounts.subscribe(
        `users/${userId}/accounts`,
        (accounts) => {
          useAccountStore.getState().setAccounts(accounts);
          console.log('Accounts updated:', accounts.length);
        },
        (error) => {
          console.error('Account sync error:', error);
          toast.error('Failed to sync accounts');
        }
      )
    );

    // Watch boards
    this.subscriptions.push(
      this.boards.subscribe(
        `users/${userId}/boards`,
        (boards) => {
          const state = useAccountStore.getState();
          Object.entries(boards).forEach(([accountId, accountBoards]) => {
            state.setBoards(accountId, accountBoards);
          });
          console.log('Boards updated:', Object.keys(boards).length);
        },
        (error) => {
          console.error('Board sync error:', error);
          toast.error('Failed to sync boards');
        }
      )
    );

    toast.success('Real-time synchronization started');
  }

  cleanup(): void {
    console.log('Cleaning up Firebase sync subscriptions');
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    toast.success('Real-time synchronization stopped');
  }
}

export const syncManager = new FirebaseSyncManager();
