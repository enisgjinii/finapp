import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../providers/AuthProvider';
import { SavingsGoal } from '../types';
import { useEffect } from 'react';

export const useSavings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const savingsQuery = useQuery({
    queryKey: ['savings', user?.uid],
    queryFn: (): SavingsGoal[] => [],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const savingsRef = collection(db, 'savings');
    const q = query(savingsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let savings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as SavingsGoal[];

      // Sort by createdAt descending (client-side)
      savings = savings.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      queryClient.setQueryData(['savings', user.uid], savings);
    });

    return unsubscribe;
  }, [user, queryClient]);

  const createSavingsGoal = useMutation({
    mutationFn: async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const savingsRef = collection(db, 'savings');
      const now = new Date();
      
      await addDoc(savingsRef, {
        ...goal,
        dueDate: goal.dueDate ? goal.dueDate : null,
        createdAt: now,
        updatedAt: now,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings', user?.uid] });
    },
  });

  const updateSavingsGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavingsGoal> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const goalRef = doc(db, 'savings', id);
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings', user?.uid] });
    },
  });

  return {
    savings: savingsQuery.data || [],
    loading: savingsQuery.isLoading,
    createSavingsGoal,
    updateSavingsGoal,
  };
};