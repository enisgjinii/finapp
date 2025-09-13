import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../providers/AuthProvider';
import { Installment } from '../types';
import { useEffect } from 'react';

export const useInstallments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const installmentsQuery = useQuery({
    queryKey: ['installments', user?.uid],
    queryFn: (): Installment[] => [],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const installmentsRef = collection(db, 'installments');
    const q = query(installmentsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let installments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        nextDueDate: doc.data().nextDueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Installment[];

      // Filter active installments and sort by nextDueDate (client-side)
      installments = installments
        .filter(installment => installment.status === 'active')
        .sort((a, b) => {
          const dateA = a.nextDueDate ? (a.nextDueDate instanceof Date ? a.nextDueDate : new Date(a.nextDueDate)) : new Date(9999999999999);
          const dateB = b.nextDueDate ? (b.nextDueDate instanceof Date ? b.nextDueDate : new Date(b.nextDueDate)) : new Date(9999999999999);
          return dateA.getTime() - dateB.getTime();
        });

      queryClient.setQueryData(['installments', user.uid], installments);
    });

    return unsubscribe;
  }, [user, queryClient]);

  const createInstallment = useMutation({
    mutationFn: async (installment: Omit<Installment, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const installmentsRef = collection(db, 'installments');
      const now = new Date();
      
      await addDoc(installmentsRef, {
        ...installment,
        nextDueDate: Timestamp.fromDate(installment.nextDueDate),
        createdAt: now,
        updatedAt: now,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments', user?.uid] });
    },
  });

  const payInstallment = useMutation({
    mutationFn: async (installmentId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const installmentRef = doc(db, 'installments', installmentId);
      const installment = queryClient.getQueryData<Installment[]>(['installments', user.uid])
        ?.find(inst => inst.id === installmentId);

      if (!installment) throw new Error('Installment not found');

      if (!installment.nextDueDate) throw new Error('Installment has no due date');

      const nextDueDate = installment.nextDueDate instanceof Date ? installment.nextDueDate : new Date(installment.nextDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      const monthsPaid = installment.monthsPaid + 1;
      const status = monthsPaid >= installment.monthsTotal ? 'paid' : 'active';

      await updateDoc(installmentRef, {
        monthsPaid,
        nextDueDate: status === 'active' ? Timestamp.fromDate(nextDueDate) : null,
        status,
        updatedAt: new Date(),
      });

      return { installment, monthsPaid };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments', user?.uid] });
    },
  });

  return {
    installments: installmentsQuery.data || [],
    loading: installmentsQuery.isLoading,
    createInstallment,
    payInstallment,
  };
};