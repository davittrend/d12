import { BaseFirebaseStorage } from './base';
import type { AccountStorage } from './types';
import type { PinterestAccount } from '@/types/pinterest';

export class FirebaseAccountStorage extends BaseFirebaseStorage<PinterestAccount> implements AccountStorage {
  protected getPath(userId: string, accountId?: string): string {
    const basePath = `users/${userId}/accounts`;
    return accountId ? `${basePath}/${accountId}` : basePath;
  }

  async saveAccount(userId: string, account: PinterestAccount): Promise<StorageResult<void>> {
    return this.save(userId, account.id, account);
  }

  async getAccount(userId: string, accountId: string): Promise<StorageResult<PinterestAccount>> {
    return this.get(userId, accountId);
  }

  async getAllAccounts(userId: string): Promise<StorageResult<PinterestAccount[]>> {
    const result = await this.getAll(userId);
    
    if (!result.success) {
      return result;
    }

    const accounts = Object.entries(result.data || {}).map(([id, account]) => ({
      ...account,
      id
    }));

    return {
      success: true,
      data: accounts
    };
  }

  async removeAccount(userId: string, accountId: string): Promise<StorageResult<void>> {
    return this.remove(userId, accountId);
  }
}