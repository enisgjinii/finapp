import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, IconButton, ProgressBar, Button, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import { Image, FileText, Download, Trash2, Plus } from 'lucide-react-native';
import { StorageService, AttachmentUpload } from '../services/storage';

interface AttachmentSectionProps {
  attachments: AttachmentUpload[];
  onAttachmentsChange: (attachments: AttachmentUpload[]) => void;
  transactionId?: string;
  disabled?: boolean;
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  attachments,
  onAttachmentsChange,
  transactionId,
  disabled = false,
}) => {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAddAttachment = async () => {
    if (disabled) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file size (15MB limit)
      if (file.size && file.size > 15 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 15MB');
        return;
      }

      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.mimeType || '')) {
        Alert.alert('Invalid File Type', 'Please select an image (JPEG, PNG, GIF, WebP) or PDF file');
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      // Use a temporary ID if transactionId is not available yet
      const tempTransactionId = transactionId || 'temp-' + Date.now();
      
      const attachment = await StorageService.uploadAttachmentWithProgress(
        tempTransactionId,
        file.uri,
        file.name,
        file.mimeType || 'application/octet-stream',
        (progress) => {
          setUploadProgress(progress.bytesTransferred / progress.totalBytes);
        }
      );

      onAttachmentsChange([...attachments, attachment]);
      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload attachment. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAttachment = async (attachment: AttachmentUpload) => {
    Alert.alert(
      'Remove Attachment',
      'Are you sure you want to remove this attachment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteAttachment(attachment.storagePath);
              onAttachmentsChange(attachments.filter(a => a.id !== attachment.id));
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Delete Failed', 'Failed to remove attachment. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePreviewAttachment = async (attachment: AttachmentUpload) => {
    try {
      if (attachment.mimeType.startsWith('image/')) {
        // For images, we could open in a modal or use a different approach
        // For now, open in browser
        await WebBrowser.openBrowserAsync(attachment.downloadURL);
      } else if (attachment.mimeType === 'application/pdf') {
        await WebBrowser.openBrowserAsync(attachment.downloadURL);
      } else {
        Alert.alert('Preview Not Available', 'Preview is not available for this file type.');
      }
    } catch (error) {
      console.error('Preview error:', error);
      Alert.alert('Preview Failed', 'Failed to open file preview.');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image size={16} color={theme.colors.primary} />;
    } else if (mimeType === 'application/pdf') {
      return <FileText size={16} color={theme.colors.primary} />;
    }
    return <Download size={16} color={theme.colors.primary} />;
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Attachments
          </Text>
          <Button
            mode="outlined"
            onPress={handleAddAttachment}
            disabled={disabled || uploading}
            compact
            icon={() => <Plus size={16} color={theme.colors.primary} />}
          >
            Add File
          </Button>
        </View>

        {uploading && (
          <View style={styles.uploadProgress}>
            <Text variant="bodySmall" style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              Uploading...
            </Text>
            <ProgressBar progress={uploadProgress} color={theme.colors.primary} />
          </View>
        )}

        {attachments.length === 0 && !uploading ? (
          <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No files yet. Add a receipt or PDF.
          </Text>
        ) : (
          <View style={styles.attachmentsList}>
            {attachments.map((attachment) => (
              <View key={attachment.id} style={[styles.attachmentItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.attachmentInfo}>
                  <View style={styles.attachmentIcon}>
                    {getFileIcon(attachment.mimeType)}
                  </View>
                  <View style={styles.attachmentDetails}>
                    <Text variant="bodyMedium" style={[styles.attachmentName, { color: theme.colors.onSurface }]}>
                      {attachment.name}
                    </Text>
                    <Text variant="bodySmall" style={[styles.attachmentSize, { color: theme.colors.onSurfaceVariant }]}>
                      {attachment.size ? StorageService.formatFileSize(attachment.size) : 'Unknown size'}
                    </Text>
                  </View>
                </View>
                <View style={styles.attachmentActions}>
                  <IconButton
                    icon={() => <Download size={16} color={theme.colors.onSurfaceVariant} />}
                    size={20}
                    onPress={() => handlePreviewAttachment(attachment)}
                    disabled={disabled}
                  />
                  <IconButton
                    icon={() => <Trash2 size={16} color={theme.colors.error} />}
                    size={20}
                    onPress={() => handleRemoveAttachment(attachment)}
                    disabled={disabled}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
  },
  uploadProgress: {
    marginBottom: 16,
  },
  progressText: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  attachmentsList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentIcon: {
    marginRight: 12,
  },
  attachmentDetails: {
    flex: 1,
  },
  attachmentName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
  },
  attachmentActions: {
    flexDirection: 'row',
  },
});
