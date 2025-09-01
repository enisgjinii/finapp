import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../providers/AuthProvider';
import { Transaction } from '../types';
import { useEffect } from 'react';

interface TransactionFilters {
  accountId?: string;
  year?: number;
  month?: number;
  type?: 'income' | 'expense';
  searchQuery?: string;
  limit?: number;
}

export const useTransactions = (filters: TransactionFilters = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', user?.uid, filters],
    queryFn: () => [],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const transactionsRef = collection(db, `users/${user.uid}/transactions`);
    let q = query(transactionsRef, orderBy('date', 'desc'));

    if (filters.accountId) {
      q = query(q, where('accountId', '==', filters.accountId));
    }

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Transaction[];

      // Apply client-side filters
      if (filters.year) {
        transactions = transactions.filter(tx => tx.date.getFullYear() === filters.year);
      }

      if (filters.month !== undefined) {
        transactions = transactions.filter(tx => tx.date.getMonth() === filters.month);
      }

      if (filters.type) {
        transactions = transactions.filter(tx => 
          filters.type === 'income' ? tx.amount >= 0 : tx.amount < 0
        );
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        transactions = transactions.filter(tx =>
          tx.description?.toLowerCase().includes(query) ||
          tx.category?.toLowerCase().includes(query) ||
          tx.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }

      queryClient.setQueryData(['transactions', user.uid, filters], transactions);
    });

    return unsubscribe;
  }, [user, queryClient, JSON.stringify(filters)]);

  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const transactionsRef = collection(db, `users/${user.uid}/transactions`);
      const now = new Date();
      
      await addDoc(transactionsRef, {
        ...transaction,
        date: Timestamp.fromDate(transaction.date),
        createdAt: now,
        updatedAt: now,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.uid] });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const transactionRef = doc(db, `users/${user.uid}/transactions`, id);
      const updateData: any = {
        ...updates,
        updatedAt: new Date(),
      };

      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(transactionRef, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.uid] });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const transactionRef = doc(db, `users/${user.uid}/transactions`, id);
      await deleteDoc(transactionRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.uid] });
    },
  });

  return {
    transactions: transactionsQuery.data || [],
    loading: transactionsQuery.isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};