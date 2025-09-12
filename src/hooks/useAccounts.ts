import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../providers/AuthProvider';
import { Account } from '../types';
import { useEffect } from 'react';

export const useAccounts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ['accounts', user?.uid],
    queryFn: (): Account[] => [],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const accountsRef = collection(db, `users/${user.uid}/accounts`);
    const q = query(accountsRef, where('isArchived', '!=', true), orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Account[];

      queryClient.setQueryData(['accounts', user.uid], accounts);
    });

    return unsubscribe;
  }, [user, queryClient]);

  const createAccount = useMutation({
    mutationFn: async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const accountsRef = collection(db, `users/${user.uid}/accounts`);
      const now = new Date();
      
      await addDoc(accountsRef, {
        ...account,
        createdAt: now,
        updatedAt: now,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.uid] });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const accountRef = doc(db, `users/${user.uid}/accounts`, id);
      await updateDoc(accountRef, {
        ...updates,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.uid] });
    },
  });

  return {
    accounts: accountsQuery.data || [],
    loading: accountsQuery.isLoading,
    createAccount,
    updateAccount,
  };
};