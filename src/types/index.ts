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
  attachments?: Array<{
    id: string;              // uuid
    name: string;            // original filename
    mimeType: string;
    size?: number;           // bytes
    storagePath: string;     // e.g. users/{uid}/transactions/{txId}/attachments/{uuid}
    downloadURL: string;
    createdAt: number;       // Date.now()
  }>;
  importSessionId?: string;  // link to an import batch
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
  filename: string;
  rowCount: number;
  importedCount: number;
  skippedCount: number;
  createdAt: number;
  mapping: {
    dateKey: string;
    amountKey: string;
    descKey: string;
    accountKey?: string;
    categoryKey?: string;
    typeKey?: string;
  };
  sampleRows: Array<Record<string, any>>;
}

export interface UserProfile {
  displayName?: string;
  email: string;
  currency: string;
  createdAt: Date;
}