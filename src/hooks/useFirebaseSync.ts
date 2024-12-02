import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { syncManager } from '@/lib/firebase/sync';
import { toast } from 'sonner';

export function useFirebaseSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      try {
        syncManager.initialize(user.uid);
      } catch (error) {
        console.error('Failed to initialize Firebase sync:', error);
        toast.error('Failed to start real-time updates');
      }
    }

    return () => {
      if (user) {
        try {
          syncManager.cleanup();
        } catch (error) {
          console.error('Failed to cleanup Firebase sync:', error);
        }
      }
    };
  }, [user?.uid]);
}