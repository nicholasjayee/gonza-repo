"use client";

import { useEffect, useState } from 'react';
import { useSaleDraft } from '@/hooks/useSaleDraft';
import { Sale } from '@/types';

export const useNewSaleDraft = (editSale?: Sale) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draftData, setDraftData] = useState<any>(null);

  const { loadDraft, clearDraft, checkForDraft } = useSaleDraft();

  // Automatically load draft on component mount
  useEffect(() => {
    if (!editSale) {
      const loadDraftAutomatically = () => {
        if (checkForDraft()) {
          const draft = loadDraft();
          if (draft) {
            setDraftData(draft);
          }
        }
      };

      // Load immediately
      loadDraftAutomatically();
    }
  }, [editSale, checkForDraft, loadDraft]);

  const handleLoadDraft = () => {
    // Clear the draft data after it's been loaded into the form
    setDraftData(null);
  };

  const handleDismissDraft = () => {
    clearDraft();
    setDraftData(null);
  };

  return {
    draftData,
    handleLoadDraft,
    handleDismissDraft,
    clearDraft
  };
};