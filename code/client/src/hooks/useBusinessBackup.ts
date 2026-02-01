/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { toast } from 'sonner';
import { exportBusinessDataAction, importBusinessDataAction } from '@/app/backup/actions';

interface BackupMetadata {
  version: string;
  timestamp: string;
  businessName: string;
  businessId: string;
  exportType: 'full_backup';
}

interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any[]>;
}

export const useBusinessBackup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();

  const exportBusinessData = async () => {
    if (!user || !currentBusiness) {
      toast.error('No business selected for backup');
      return;
    }

    setIsExporting(true);
    setProgress(10);

    try {
      const result = await exportBusinessDataAction(currentBusiness.id);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch backup data");
      }

      setProgress(90);

      const backupData = result.data as unknown as BackupData;

      // Create and download file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentBusiness.name.replace(/[^a-zA-Z0-9]/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success('Backup completed successfully');
      
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error(error instanceof Error ? error.message : 'Backup failed. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const importBusinessData = async (file: File) => {
    if (!user || !currentBusiness) {
      toast.error('No business selected for restore');
      return false;
    }

    setIsImporting(true);
    setProgress(10);

    try {
      const fileContent = await file.text();
      const backupData: BackupData = JSON.parse(fileContent);

      // Validate backup file
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      // Check version - support both 1.0 (Supabase) and 2.0 (Prisma)
      // Since schema is different, we might need a converter if we want to support old backups.
      // For now, let's just use the server action for 2.0.
      if (backupData.metadata.version === '1.0') {
         toast.warning('Attempting to import legacy backup. Some fields might not map correctly.');
      } else if (backupData.metadata.version !== '2.0-prisma') {
         throw new Error('Unsupported backup version');
      }

      setProgress(30);

      const result = await importBusinessDataAction(currentBusiness.id, backupData);

      if (!result.success) {
        throw new Error(result.error || "Failed to restore data");
      }

      setProgress(100);
      toast.success('Data restored successfully');
      setTimeout(() => window.location.reload(), 1000);
      return true;
      
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed. Please check the backup file.');
      return false;
    } finally {
      setIsImporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    exportBusinessData,
    importBusinessData,
    isExporting,
    isImporting,
    progress
  };
};