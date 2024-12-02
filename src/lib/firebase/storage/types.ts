import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface AccountStorage {
  saveAccount(userId: string, account: PinterestAccount): Promise<StorageResult<void>>;
  getAccount(userId: string, accountId: string): Promise<StorageResult<PinterestAccount>>;
  getAllAccounts(userId: string): Promise<StorageResult<PinterestAccount[]>>;
  removeAccount(userId: string, accountId: string): Promise<StorageResult<void>>;
}

export interface BoardStorage {
  saveBoards(userId: string, accountId: string, boards: PinterestBoard[]): Promise<StorageResult<void>>;
  getBoards(userId: string, accountId: string): Promise<StorageResult<PinterestBoard[]>>;
  getAllBoards(userId: string): Promise<StorageResult<Record<string, PinterestBoard[]>>>;
  removeBoards(userId: string, accountId: string): Promise<StorageResult<void>>;
}