import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Text, Card, Button, Modal, Portal, ProgressBar, Chip, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react-native';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import { useAuth } from '../providers/AuthProvider';
import { db } from '../config/firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface ImportWizardProps {
  visible: boolean;
  onClose: () => void;
}

interface ParsedRow {
  [key: string]: any;
}

interface ColumnMapping {
  dateKey: string;
  amountKey: string;
  descKey: string;
  accountKey?: string;
  categoryKey?: string;
  typeKey?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ visible, onClose }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { createTransaction } = useTransactions();
  const { accounts } = useAccounts();
  
  const [step, setStep] = useState<'file' | 'mapping' | 'preview' | 'importing' | 'complete'>('file');
  const [fileData, setFileData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateKey: '',
    amountKey: '',
    descKey: '',
    accountKey: '',
    categoryKey: '',
    typeKey: '',
  });
  const [importResult, setImportResult] = useState<ImportResult>({ imported: 0, skipped: 0, errors: [] });
  const [importProgress, setImportProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      // Reset state when modal closes
      setStep('file');
      setFileData([]);
      setFileName('');
      setAvailableColumns([]);
      setMapping({
        dateKey: '',
        amountKey: '',
        descKey: '',
        accountKey: '',
        categoryKey: '',
        typeKey: '',
      });
      setImportResult({ imported: 0, skipped: 0, errors: [] });
      setImportProgress(0);
    }
  }, [visible]);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      setFileName(file.name);

      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      
      let parsedData: ParsedRow[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().toLowerCase(),
        });
        parsedData = parseResult.data as ParsedRow[];
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Parse Excel
        const workbook = XLSX.read(fileContent, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = (jsonData[0] as string[]).map(h => h?.toString().trim().toLowerCase() || '');
          parsedData = (jsonData.slice(1) as any[][]).map(row => {
            const obj: ParsedRow = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
        }
      }

      if (parsedData.length === 0) {
        Alert.alert('No Data', 'No valid data found in the selected file.');
        return;
      }

      setFileData(parsedData);
      setAvailableColumns(Object.keys(parsedData[0] || {}));
      
      // Auto-detect common column names
      const autoMapping: Partial<ColumnMapping> = {};
      availableColumns.forEach(col => {
        if (col.includes('date') && !autoMapping.dateKey) autoMapping.dateKey = col;
        if (col.includes('amount') && !autoMapping.amountKey) autoMapping.amountKey = col;
        if ((col.includes('desc') || col.includes('memo') || col.includes('note')) && !autoMapping.descKey) autoMapping.descKey = col;
        if (col.includes('account') && !autoMapping.accountKey) autoMapping.accountKey = col;
        if (col.includes('category') && !autoMapping.categoryKey) autoMapping.categoryKey = col;
        if (col.includes('type') && !autoMapping.typeKey) autoMapping.typeKey = col;
      });

      setMapping(prev => ({ ...prev, ...autoMapping }));
      setStep('mapping');
    } catch (error) {
      console.error('File parsing error:', error);
      Alert.alert('Error', 'Failed to parse the selected file.');
    }
  };

  const validateMapping = (): boolean => {
    if (!mapping.dateKey || !mapping.amountKey || !mapping.descKey) {
      Alert.alert('Missing Required Fields', 'Please map Date, Amount, and Description columns.');
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    if (!validateMapping()) return;
    setStep('preview');
  };

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Try different date formats
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
    ];
    
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const parseAmount = (amountStr: string, typeStr?: string): number | null => {
    if (!amountStr) return null;
    
    // Remove currency symbols and parse
    const cleaned = amountStr.toString().replace(/[^\d.-]/g, '');
    const amount = parseFloat(cleaned);
    
    if (isNaN(amount)) return null;
    
    // Determine if it's income or expense
    if (typeStr?.toLowerCase().includes('income') || typeStr?.toLowerCase().includes('credit')) {
      return Math.abs(amount);
    } else if (typeStr?.toLowerCase().includes('expense') || typeStr?.toLowerCase().includes('debit')) {
      return -Math.abs(amount);
    }
    
    // If no type specified, assume negative for expenses (common in bank exports)
    return amount < 0 ? amount : -Math.abs(amount);
  };

  const handleImport = async () => {
    if (!validateMapping()) return;
    
    setStep('importing');
    setImportProgress(0);
    
    const importId = uuidv4();
    const results: ImportResult = { imported: 0, skipped: 0, errors: [] };
    
    try {
      // Create import session record
      const importSession = {
        id: importId,
        filename: fileName,
        rowCount: fileData.length,
        importedCount: 0,
        skippedCount: 0,
        createdAt: Date.now(),
        mapping,
        sampleRows: fileData.slice(0, 10),
      };

      await addDoc(collection(db, 'uploadSessions'), {
        ...importSession,
        userId: user?.uid,
        uploadedAt: new Date(),
        totalSheets: 1, // Since this is CSV import
        totalRecords: fileData.length,
        status: 'completed',
      });

      // Process transactions in batches
      const batchSize = 400;
      const batches = [];
      
      for (let i = 0; i < fileData.length; i += batchSize) {
        batches.push(fileData.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchWrite = writeBatch(db);
        
        for (const row of batch) {
          try {
            const date = parseDate(row[mapping.dateKey]);
            const amount = parseAmount(row[mapping.amountKey], row[mapping.typeKey]);
            const description = row[mapping.descKey]?.toString().trim();
            
            if (!date || amount === null || !description) {
              results.skipped++;
              results.errors.push(`Row ${fileData.indexOf(row) + 1}: Missing required data`);
              continue;
            }

            // Find matching account
            let accountId = accounts[0]?.id;
            if (mapping.accountKey && row[mapping.accountKey]) {
              const accountName = row[mapping.accountKey].toString().trim();
              const matchingAccount = accounts.find(acc => 
                acc.name.toLowerCase().includes(accountName.toLowerCase()) ||
                accountName.toLowerCase().includes(acc.name.toLowerCase())
              );
              if (matchingAccount) {
                accountId = matchingAccount.id;
              }
            }

            const transactionData = {
              userId: user?.uid,
              sheetName: fileName, // Using filename as sheet name for CSV imports
              data: date.toLocaleDateString('en-US'), // Format as MM/DD/YYYY as per new rules
              shuma: amount,
              pershkrimi: description,
              category: mapping.categoryKey ? row[mapping.categoryKey]?.toString().trim() : undefined,
              uploadedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const transactionRef = collection(db, 'financialRecords');
            batchWrite.set(doc(transactionRef), transactionData);
            results.imported++;
          } catch (error) {
            results.skipped++;
            results.errors.push(`Row ${fileData.indexOf(row) + 1}: ${error}`);
          }
        }
        
        await batchWrite.commit();
        setImportProgress((batchIndex + 1) / batches.length);
      }

      setImportResult(results);
      setStep('complete');
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Failed to import transactions. Please try again.');
      setStep('mapping');
    }
  };

  const renderFileStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
        Select File
      </Text>
      <Text variant="bodyMedium" style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
        Choose a CSV or Excel file to import transactions from.
      </Text>
      
      <Button
        mode="contained"
        onPress={handleFilePick}
        icon={() => <Upload size={20} color={theme.colors.onPrimary} />}
        style={styles.actionButton}
      >
        Choose File
      </Button>
    </View>
  );

  const renderMappingStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
        Map Columns
      </Text>
      <Text variant="bodyMedium" style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
        Map your file columns to transaction fields.
      </Text>
      
      <View style={styles.mappingContainer}>
        <Text variant="titleMedium" style={[styles.mappingTitle, { color: theme.colors.onSurface }]}>
          Available Columns:
        </Text>
        <View style={styles.columnsList}>
          {availableColumns.map(column => (
            <Chip key={column} style={styles.columnChip}>
              {column}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button mode="outlined" onPress={() => setStep('file')} style={styles.button}>
          Back
        </Button>
        <Button mode="contained" onPress={handlePreview} style={styles.button}>
          Preview
        </Button>
      </View>
    </View>
  );

  const renderPreviewStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
        Preview Import
      </Text>
      <Text variant="bodyMedium" style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
        Review the first few transactions before importing.
      </Text>
      
      <View style={styles.previewContainer}>
        <Text variant="titleMedium" style={[styles.previewTitle, { color: theme.colors.onSurface }]}>
          Sample Data ({Math.min(5, fileData.length)} of {fileData.length} rows):
        </Text>
        {fileData.slice(0, 5).map((row, index) => (
          <Card key={index} style={[styles.previewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content style={styles.previewCardContent}>
              <Text variant="bodySmall" style={[styles.previewText, { color: theme.colors.onSurfaceVariant }]}>
                Date: {row[mapping.dateKey] || 'N/A'}
              </Text>
              <Text variant="bodySmall" style={[styles.previewText, { color: theme.colors.onSurfaceVariant }]}>
                Amount: {row[mapping.amountKey] || 'N/A'}
              </Text>
              <Text variant="bodySmall" style={[styles.previewText, { color: theme.colors.onSurfaceVariant }]}>
                Description: {row[mapping.descKey] || 'N/A'}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Button mode="outlined" onPress={() => setStep('mapping')} style={styles.button}>
          Back
        </Button>
        <Button mode="contained" onPress={handleImport} style={styles.button}>
          Import {fileData.length} Transactions
        </Button>
      </View>
    </View>
  );

  const renderImportingStep = () => (
    <View style={styles.stepContent}>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
        Importing Transactions
      </Text>
      <Text variant="bodyMedium" style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
        Please wait while we import your transactions...
      </Text>
      
      <ProgressBar progress={importProgress} color={theme.colors.primary} style={styles.progressBar} />
      <Text variant="bodySmall" style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
        {Math.round(importProgress * 100)}% complete
      </Text>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.completeIcon}>
        <CheckCircle size={48} color={theme.colors.primary} />
      </View>
      <Text variant="headlineSmall" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
        Import Complete
      </Text>
      
      <View style={styles.resultsContainer}>
        <View style={styles.resultItem}>
          <Text variant="titleMedium" style={[styles.resultLabel, { color: theme.colors.primary }]}>
            {importResult.imported}
          </Text>
          <Text variant="bodyMedium" style={[styles.resultDescription, { color: theme.colors.onSurfaceVariant }]}>
            Transactions Imported
          </Text>
        </View>
        
        {importResult.skipped > 0 && (
          <View style={styles.resultItem}>
            <Text variant="titleMedium" style={[styles.resultLabel, { color: theme.colors.error }]}>
              {importResult.skipped}
            </Text>
            <Text variant="bodyMedium" style={[styles.resultDescription, { color: theme.colors.onSurfaceVariant }]}>
              Transactions Skipped
            </Text>
          </View>
        )}
      </View>

      <Button mode="contained" onPress={onClose} style={styles.actionButton}>
        Done
      </Button>
    </View>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.modalHeader}>
          <Text variant="headlineMedium" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Import Transactions
          </Text>
          <Button mode="text" onPress={onClose} icon={() => <X size={20} color={theme.colors.onSurface} />} />
        </View>

        {step === 'file' && renderFileStep()}
        {step === 'mapping' && renderMappingStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'importing' && renderImportingStep()}
        {step === 'complete' && renderCompleteStep()}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  stepDescription: {
    marginBottom: 24,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 16,
  },
  mappingContainer: {
    marginBottom: 24,
  },
  mappingTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  columnsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  columnChip: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  previewContainer: {
    marginBottom: 24,
  },
  previewTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  previewCard: {
    marginBottom: 8,
  },
  previewCardContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  previewText: {
    marginBottom: 4,
  },
  progressBar: {
    marginVertical: 16,
  },
  progressText: {
    textAlign: 'center',
  },
  completeIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultLabel: {
    fontWeight: '700',
    fontSize: 24,
  },
  resultDescription: {
    marginTop: 4,
    textAlign: 'center',
  },
});
