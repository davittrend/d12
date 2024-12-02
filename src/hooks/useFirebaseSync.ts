import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { syncManager } from '@/lib/firebase/sync';
import { toast } from 'sonner';
import { useAccountStore } from '@/lib/store';

export function useFirebaseSync() {
  const { user } = useAuth();
  const initialized = useRef(false);
  const { initializeStore } = useAccountStore();

  useEffect(() => {
    if (user && !initialized.current) {
      try {
        // Initialize store first
        initializeStore(user.uid);
        
        // Then start real-time sync
        syncManager.initialize(user.uid);
        
        initialized.current = true;
        console.log('Firebase sync initialized for user:', user.uid);
      } catch (error) {
        console.error('Failed to initialize Firebase sync:', error);
        toast.error('Failed to start real-time updates');
      }
    }

    return () => {
      if (initialized.current) {
        try {
          syncManager.cleanup();
          initialized.current = false;
          console.log('Firebase sync cleaned up');
        } catch (error) {
          console.error('Failed to cleanup Firebase sync:', error);
        }
      }
    };
  }, [user?.uid, initializeStore]);
}
