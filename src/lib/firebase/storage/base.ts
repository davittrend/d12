import { ref, set, get, remove, DatabaseReference } from 'firebase/database';
import type { StorageResult } from './types';
import { database } from '../database';
import { logFirebaseError } from '../errors';

export abstract class BaseFirebaseStorage<T> {
  protected abstract getPath(userId: string, id?: string): string;

  protected getRef(path: string): DatabaseReference {
    return ref(database, path);
  }

  async save(userId: string, id: string, data: T): Promise<StorageResult<void>> {
    try {
      const path = this.getPath(userId, id);
      const dbRef = this.getRef(path);
      await set(dbRef, data);
      console.log(`Data saved successfully at path: ${path}`);
      return { success: true };
    } catch (error) {
      logFirebaseError('Save Operation', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to save data')
      };
    }
  }

  async get(userId: string, id: string): Promise<StorageResult<T>> {
    try {
      const path = this.getPath(userId, id);
      const dbRef = this.getRef(path);
      const snapshot = await get(dbRef);

      if (!snapshot.exists()) {
        return {
          success: false,
          error: new Error('Data not found')
        };
      }

      return {
        success: true,
        data: snapshot.val()
      };
    } catch (error) {
      logFirebaseError('Get Operation', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to get data')
      };
    }
  }

  async getAll(userId: string): Promise<StorageResult<Record<string, T>>> {
    try {
      const path = this.getPath(userId);
      const dbRef = this.getRef(path);
      const snapshot = await get(dbRef);

      if (!snapshot.exists()) {
        return { success: true, data: {} };
      }

      return {
        success: true,
        data: snapshot.val()
      };
    } catch (error) {
      logFirebaseError('Get All Operation', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to get all data')
      };
    }
  }

  async remove(userId: string, id: string): Promise<StorageResult<void>> {
    try {
      const path = this.getPath(userId, id);
      const dbRef = this.getRef(path);
      await remove(dbRef);
      console.log(`Data removed successfully from path: ${path}`);
      return { success: true };
    } catch (error) {
      logFirebaseError('Remove Operation', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to remove data')
      };
    }
  }
}