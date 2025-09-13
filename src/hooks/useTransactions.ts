import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, limit, Timestamp } from 'firebase/firestore';
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

  // Debug: Log current authentication state
  console.log('🔐 Auth state:', {
    isAuthenticated: !!user,
    userId: user?.uid,
    email: user?.email
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions', user?.uid, filters],
    queryFn: (): Transaction[] => [],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    console.log('👤 Current user:', user.uid);

    const transactionsRef = collection(db, 'financialRecords');

    // TEMPORARY: Remove userId filter to test if data loads
    // let q = query(transactionsRef, where('userId', '==', user.uid));
    let q = query(transactionsRef); // Query all documents temporarily

    console.log('🔎 Querying ALL financialRecords (temporarily removed userId filter)');

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔍 Query result:', {
        userId: user.uid,
        documentCount: snapshot.size,
        documents: snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });

      let transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        // Helper function to safely parse dates
        const safeParseDate = (dateValue: any): Date => {
          if (!dateValue) return new Date();
          
          // If it's already a Date object
          if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? new Date() : dateValue;
          }
          
          // If it's a Firestore Timestamp
          if (dateValue && typeof dateValue.toDate === 'function') {
            const date = dateValue.toDate();
            return isNaN(date.getTime()) ? new Date() : date;
          }
          
          // If it's a string, try to parse it
          if (typeof dateValue === 'string') {
            // Handle MM/DD/YYYY format
            if (dateValue.includes('/')) {
              const [month, day, year] = dateValue.split('/');
              const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
            }
            
            // Try standard Date parsing
            const parsedDate = new Date(dateValue);
            return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
          }
          
          return new Date();
        };

        const transaction = {
          id: doc.id,
          // Map Firestore field names to app field names
          date: safeParseDate(data.data),
          amount: data.shuma || 0,
          description: data.pershkrimi || '',
          category: data.category || '',
          accountId: data.accountId || '', // This field might not exist in old data
          userId: data.userId || '',
          createdAt: safeParseDate(data.createdAt),
          updatedAt: safeParseDate(data.updatedAt),
          // Keep original fields for compatibility
          ...data
        };

        console.log('📄 Mapped transaction:', transaction);
        return transaction;
      }) as Transaction[];

      // Sort by date descending (client-side since we can't use orderBy)
      transactions = transactions.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        
        // Handle invalid dates by putting them at the end
        const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
        const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
        
        return timeB - timeA;
      });

      // Apply client-side filters
      if (filters.accountId) {
        transactions = transactions.filter(tx => tx.accountId === filters.accountId);
      }

      if (filters.year) {
        transactions = transactions.filter(tx => {
          if (!tx.date) return false;
          const date = tx.date instanceof Date ? tx.date : new Date(tx.date);
          return !isNaN(date.getTime()) && date.getFullYear() === filters.year;
        });
      }

      if (filters.month !== undefined) {
        transactions = transactions.filter(tx => {
          if (!tx.date) return false;
          const date = tx.date instanceof Date ? tx.date : new Date(tx.date);
          return !isNaN(date.getTime()) && date.getMonth() === filters.month;
        });
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

      console.log('💾 Setting transactions data:', transactions.length, 'transactions');
      queryClient.setQueryData(['transactions', user.uid, filters], transactions);
    });

    return unsubscribe;
  }, [user, queryClient, JSON.stringify(filters)]);

  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const transactionsRef = collection(db, 'financialRecords');
      const now = new Date();
      
      await addDoc(transactionsRef, {
        // Map app field names to Firestore field names
        userId: user.uid,
        sheetName: transaction.accountId || 'Manual Entry',
        data: transaction.date.toLocaleDateString('en-US'), // MM/DD/YYYY format
        shuma: transaction.amount,
        pershkrimi: transaction.description || '',
        category: transaction.category || '',
        accountId: transaction.accountId || '',
        uploadedAt: Timestamp.now(),
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

      const transactionRef = doc(db, 'financialRecords', id);
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Map app field names to Firestore field names
      if (updates.date) {
        updateData.data = updates.date.toLocaleDateString('en-US');
      }
      if (updates.amount !== undefined) {
        updateData.shuma = updates.amount;
      }
      if (updates.description !== undefined) {
        updateData.pershkrimi = updates.description;
      }
      if (updates.category !== undefined) {
        updateData.category = updates.category;
      }
      if (updates.accountId !== undefined) {
        updateData.accountId = updates.accountId;
        updateData.sheetName = updates.accountId || 'Manual Entry';
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
      
      const transactionRef = doc(db, 'financialRecords', id);
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