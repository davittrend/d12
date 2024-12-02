import type { DataSnapshot } from 'firebase/database';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

export type SyncCallback<T> = (data: T) => void;
export type ErrorCallback = (error: Error) => void;

export interface SyncSubscription {
  unsubscribe: () => void;
}

export interface DataSync<T> {
  subscribe(path: string, onData: SyncCallback<T>, onError?: ErrorCallback): SyncSubscription;
  unsubscribe(path: string): void;
}

export interface AccountSync extends DataSync<PinterestAccount[]> {
  watchUserAccounts(userId: string): SyncSubscription;
}

export interface BoardSync extends DataSync<Record<string, PinterestBoard[]>> {
  watchUserBoards(userId: string): SyncSubscription;
}

export interface SyncManager {
  accounts: AccountSync;
  boards: BoardSync;
  initialize(userId: string): void;
  cleanup(): void;
}