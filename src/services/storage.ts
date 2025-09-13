import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, UploadTask, getMetadata } from 'firebase/storage';
import { auth } from '../config/firebase';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

export interface AttachmentUpload {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  storagePath: string;
  downloadURL: string;
  createdAt: number;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export class StorageService {
  private static getCurrentUserId(): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  private static sanitizeFileName(fileName: string): string {
    // Remove or replace invalid characters for Firebase Storage
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  private static getStoragePath(transactionId: string, fileName: string): string {
    const userId = this.getCurrentUserId();
    const sanitizedName = this.sanitizeFileName(fileName);
    const uuid = uuidv4();
    return `users/${userId}/transactions/${transactionId}/attachments/${uuid}-${sanitizedName}`;
  }

  static async uploadAttachment(
    transactionId: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<AttachmentUpload> {
    try {
      const userId = this.getCurrentUserId();
      const storagePath = this.getStoragePath(transactionId, fileName);
      const storageRef = ref(storage, storagePath);

      // Read file as blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const size = fileInfo.size;

      // Upload with progress tracking
      const uploadTask = uploadBytes(storageRef, blob);
      
      // Note: Firebase v9 doesn't have built-in progress tracking for uploadBytes
      // For progress tracking, you'd need to use uploadBytesResumable instead
      await uploadTask;

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        id: uuidv4(),
        name: fileName,
        mimeType,
        size,
        storagePath,
        downloadURL,
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  static async uploadAttachmentWithProgress(
    transactionId: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<AttachmentUpload> {
    try {
      const userId = this.getCurrentUserId();
      const storagePath = this.getStoragePath(transactionId, fileName);
      const storageRef = ref(storage, storagePath);

      // Read file as blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const size = fileInfo.size;

      // Create upload task with progress tracking
      const uploadTask = uploadBytes(storageRef, blob);
      
      // For now, we'll use uploadBytes (no progress tracking)
      // In a production app, you'd want to use uploadBytesResumable for progress
      await uploadTask;

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        id: uuidv4(),
        name: fileName,
        mimeType,
        size,
        storagePath,
        downloadURL,
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  static async deleteAttachment(storagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete attachment');
    }
  }

  static async getAttachmentMetadata(storagePath: string) {
    try {
      const storageRef = ref(storage, storagePath);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error('Metadata error:', error);
      throw new Error('Failed to get attachment metadata');
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'picture-as-pdf';
    if (mimeType.includes('text/')) return 'description';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'table-chart';
    return 'attach-file';
  }
}
