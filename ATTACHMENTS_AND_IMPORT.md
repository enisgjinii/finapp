# Attachments & Import Features

This document describes the file attachment and CSV/XLSX import functionality added to the FinApp.

## Features Overview

### 1. File Attachments
- **Location**: Transaction creation/edit forms
- **Supported Files**: Images (JPEG, PNG, GIF, WebP) and PDFs
- **File Size Limit**: 15MB per file
- **Storage**: Firebase Storage with organized folder structure
- **Features**:
  - Upload progress tracking
  - File preview (images and PDFs)
  - File deletion with confirmation
  - Offline queue support (planned)

### 2. CSV/XLSX Import
- **Location**: Transactions screen (Import button in header)
- **Supported Formats**: CSV, XLS, XLSX
- **Features**:
  - Auto-detection of common column names
  - Manual column mapping
  - Data preview before import
  - Batch processing (400 transactions per batch)
  - Import session tracking
  - Error handling and reporting

## Technical Implementation

### Data Model Extensions

#### Transaction Type
```typescript
interface Transaction {
  // ... existing fields
  attachments?: Array<{
    id: string;              // uuid
    name: string;            // original filename
    mimeType: string;
    size?: number;           // bytes
    storagePath: string;     // Firebase Storage path
    downloadURL: string;
    createdAt: number;       // Date.now()
  }>;
  importSessionId?: string;  // link to import batch
}
```

#### Import Session Type
```typescript
interface ImportSession {
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
```

### File Structure

```
src/
├── components/
│   ├── AttachmentSection.tsx    # File attachment UI component
│   └── ImportWizard.tsx         # Import wizard modal
├── services/
│   └── storage.ts               # Firebase Storage operations
└── types/
    └── index.ts                 # Extended type definitions
```

### Firebase Storage Structure

```
users/{uid}/transactions/{transactionId}/attachments/{uuid}-{sanitizedFileName}
```

### Firestore Collections

```
users/{uid}/
├── transactions/           # Existing transactions with new fields
└── imports/               # New import session tracking
```

## Usage Guide

### Adding File Attachments

1. **Create/Edit Transaction**: Navigate to transaction form
2. **Add Attachment**: Click "Add File" button in Attachments section
3. **Select File**: Choose image or PDF from device
4. **Upload**: File uploads automatically with progress indicator
5. **Preview**: Tap download icon to preview file
6. **Remove**: Tap trash icon to delete attachment

### Importing Transactions

1. **Access Import**: Tap Import button (upload icon) in Transactions screen header
2. **Select File**: Choose CSV or Excel file from device
3. **Map Columns**: 
   - System auto-detects common column names
   - Manually map remaining columns if needed
   - Required: Date, Amount, Description
4. **Preview**: Review sample data before importing
5. **Import**: Confirm import to process all transactions
6. **Results**: View import summary with counts

### Supported File Formats

#### CSV Files
- Headers: `date`, `amount`, `description`, `account`, `category`, `type`
- Date formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
- Amount: Numeric values (negative for expenses)

#### Excel Files
- Same column structure as CSV
- Supports .xls and .xlsx formats
- First sheet is used for import

## Security & Validation

### File Upload Security
- File type validation (images and PDFs only)
- File size limits (15MB)
- Filename sanitization
- User-scoped storage paths

### Firestore Rules
- Updated transaction validation to include new fields
- Import session validation rules
- User-scoped access control
- Attachment metadata validation

### Data Validation
- Required field validation
- Amount range validation (-999,999,999.99 to 999,999,999.99)
- Date format validation
- String length limits

## Error Handling

### Upload Errors
- Network connectivity issues
- File size/type validation failures
- Storage quota exceeded
- Authentication errors

### Import Errors
- File parsing failures
- Invalid data formats
- Missing required columns
- Duplicate transaction detection

## Performance Considerations

### File Uploads
- Progress tracking for large files
- Background upload processing
- Retry mechanisms for failed uploads

### Import Processing
- Batch processing (400 transactions per batch)
- Progress indicators
- Memory-efficient file parsing
- Transaction rollback on errors

## Dependencies Added

```json
{
  "uuid": "^9.0.0",
  "@types/uuid": "^9.0.0",
  "papaparse": "^5.4.0",
  "xlsx": "^0.18.5"
}
```

## Future Enhancements

### Planned Features
- Offline upload queue
- Bulk attachment operations
- Advanced import filters
- Import templates
- Duplicate detection
- Transaction categorization AI

### Performance Optimizations
- Image compression
- Lazy loading for large files
- Caching strategies
- Background sync

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size (must be < 15MB)
   - Verify file type (images/PDFs only)
   - Ensure stable internet connection

2. **Import Errors**
   - Verify CSV/Excel format
   - Check column headers match expected names
   - Ensure date and amount columns contain valid data

3. **Preview Not Working**
   - Check file permissions
   - Verify file is not corrupted
   - Try refreshing the app

### Support
For technical issues or feature requests, please refer to the main project documentation or create an issue in the repository.
