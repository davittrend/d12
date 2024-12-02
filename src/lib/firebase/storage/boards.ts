import { BaseFirebaseStorage } from './base';
import type { BoardStorage } from './types';
import type { PinterestBoard } from '@/types/pinterest';

export class FirebaseBoardStorage extends BaseFirebaseStorage<PinterestBoard[]> implements BoardStorage {
  protected getPath(userId: string, accountId?: string): string {
    const basePath = `users/${userId}/boards`;
    return accountId ? `${basePath}/${accountId}` : basePath;
  }

  async saveBoards(userId: string, accountId: string, boards: PinterestBoard[]): Promise<StorageResult<void>> {
    return this.save(userId, accountId, boards);
  }

  async getBoards(userId: string, accountId: string): Promise<StorageResult<PinterestBoard[]>> {
    return this.get(userId, accountId);
  }

  async getAllBoards(userId: string): Promise<StorageResult<Record<string, PinterestBoard[]>>> {
    return this.getAll(userId);
  }

  async removeBoards(userId: string, accountId: string): Promise<StorageResult<void>> {
    return this.remove(userId, accountId);
  }
}