import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { storage } from '../firebase/storage';
import { auth } from '../firebase/auth';
import { toast } from 'sonner';
import type { AccountStore } from './types';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

const initialState: AccountStore = {
  accounts: [],
  selectedAccountId: null,
  boards: {},
  initialized: false,
  loading: false,
  error: null,
};

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAccounts: (accounts) => set(
        produce((state) => {
          state.accounts = accounts;
          state.error = null;
        })
      ),
      
      setSelectedAccount: (accountId) => set(
        produce((state) => {
          state.selectedAccountId = accountId;
          state.error = null;
        })
      ),

      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      addAccount: async (account) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          toast.error('User not authenticated');
          throw new Error('User not authenticated');
        }

        try {
          get().setLoading(true);
          const result = await storage.accounts.save(userId, account);
          
          if (!result.success) {
            throw result.error;
          }
          
          set(
            produce((state) => {
              state.accounts = [...state.accounts, account];
              state.error = null;
            })
          );
          
          toast.success('Account added successfully');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add account';
          toast.error(message);
          throw error;
        } finally {
          get().setLoading(false);
        }
      },
      
      setBoards: async (accountId, boards) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          toast.error('User not authenticated');
          throw new Error('User not authenticated');
        }

        try {
          get().setLoading(true);
          const result = await storage.boards.save(userId, accountId, boards);
          
          if (!result.success) {
            throw result.error;
          }
          
          set(
            produce((state) => {
              state.boards[accountId] = boards;
              state.error = null;
            })
          );
          
          toast.success('Boards updated successfully');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update boards';
          toast.error(message);
          throw error;
        } finally {
          get().setLoading(false);
        }
      },

      removeAccount: async (accountId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          toast.error('User not authenticated');
          throw new Error('User not authenticated');
        }

        try {
          get().setLoading(true);
          const [accountResult, boardsResult] = await Promise.all([
            storage.accounts.remove(userId, accountId),
            storage.boards.remove(userId, accountId)
          ]);
          
          if (!accountResult.success) {
            throw accountResult.error;
          }
          
          if (!boardsResult.success) {
            throw boardsResult.error;
          }

          set(
            produce((state) => {
              state.accounts = state.accounts.filter(a => a.id !== accountId);
              delete state.boards[accountId];
              if (state.selectedAccountId === accountId) {
                state.selectedAccountId = state.accounts[0]?.id || null;
              }
              state.error = null;
            })
          );
          
          toast.success('Account removed successfully');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to remove account';
          toast.error(message);
          throw error;
        } finally {
          get().setLoading(false);
        }
      },
      
      getAccount: (accountId) => {
        const account = get().accounts.find(a => a.id === accountId);
        if (!account) {
          const error = new Error('Account not found');
          toast.error(error.message);
          throw error;
        }
        return account;
      },

      initializeStore: async (userId: string) => {
        if (get().initialized) return;

        try {
          get().setLoading(true);
          console.log('Initializing store for user:', userId);

          const [accountsResult, boardsResult] = await Promise.all([
            storage.accounts.getAll(userId),
            storage.boards.getAll(userId)
          ]);

          if (!accountsResult.success) {
            throw accountsResult.error;
          }

          if (!boardsResult.success) {
            throw boardsResult.error;
          }

          set(
            produce((state) => {
              state.accounts = accountsResult.data || [];
              state.boards = boardsResult.data || {};
              state.initialized = true;
              state.selectedAccountId = accountsResult.data?.[0]?.id || null;
              state.error = null;
            })
          );

          console.log('Store initialized successfully');
          toast.success('Account data loaded successfully');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to initialize store';
          toast.error(message);
          set({ 
            error: message,
            initialized: true 
          });
          throw error;
        } finally {
          get().setLoading(false);
        }
      },
    }),
    {
      name: 'pinterest-accounts',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId,
      }),
    }
  )
);