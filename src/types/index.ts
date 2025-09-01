export interface Account {
  id: string;
  name: string;
  currency: string;
  color?: string;
  icon?: string;
  isArchived?: boolean;
  balanceComputed?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  accountId: string;
  amount: number;
  description?: string;
  category?: string;
  tags?: string[];
  savingsAlloc?: number;
  attachmentUrl?: string;
  source?: 'manual' | 'import' | 'installment' | 'transfer';
  transferId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Installment {
  id: string;
  title: string;
  accountId: string;
  principal: number;
  monthlyAmount: number;
  monthsTotal: number;
  monthsPaid: number;
  nextDueDate: Date;
  status: 'active' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportSession {
  id: string;
  fileName: string;
  mapping: {
    dateKey: string;
    amountKey: string;
    descKey: string;
    accountKey?: string;
  };
  rowCount: number;
  createdAt: Date;
}

export interface UserProfile {
  displayName?: string;
  email: string;
  currency: string;
  createdAt: Date;
}