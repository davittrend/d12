import { FirebaseAccountSync } from './accounts';
import { FirebaseBoardSync } from './boards';
import type { SyncManager, SyncSubscription } from './types';
import { toast } from 'sonner';

export class FirebaseSyncManager implements SyncManager {
  private subscriptions: SyncSubscription[] = [];
  public accounts = new FirebaseAccountSync();
  public boards = new FirebaseBoardSync();

  initialize(userId: string): void {
    console.log('Initializing Firebase sync for user:', userId);

    // Watch accounts
    this.subscriptions.push(
      this.accounts.watchUserAccounts(userId)
    );

    // Watch boards
    this.subscriptions.push(
      this.boards.watchUserBoards(userId)
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