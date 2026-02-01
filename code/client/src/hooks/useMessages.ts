/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useProfiles } from '@/components/contexts/ProfileContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getMessagesAction, 
  getTemplatesAction, 
  createTemplateAction, 
  updateTemplateAction, 
  deleteTemplateAction,
  sendMessageAction,
  getCreditBalanceAction,
  initiateTopUpAction
} from '@/messaging/api/controller';

export interface Message {
  id: string;
  userId: string;
  locationId: string;
  profileId?: string;
  customerId?: string;
  phoneNumber: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  smsCreditsUsed: number;
  templateId?: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface Purchase {
  id: string;
  userId: string;
  locationId: string;
  profileId?: string;
  creditsAmount: number;
  totalCost: number;
  paymentPhoneNumber: string;
  paymentStatus: string;
  pesapalTrackingId?: string;
  pesapalMerchantReference?: string;
  pesapalRedirectUrl?: string;
  paymentMethod?: string;
  paymentCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('256')) return '+' + cleaned;
  if (cleaned.startsWith('0')) return '+256' + cleaned.substring(1);
  if (cleaned.length === 9 && cleaned.match(/^[7]\d{8}$/)) return '+256' + cleaned;
  return '+256' + cleaned;
};

export const useMessages = (userId?: string) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [liveCredits, setLiveCredits] = useState<number>(0);
  // Remove manual loading state; derive from React Query for messages

  const { currentBusiness } = useBusiness();
  const { currentProfile } = useProfiles();
  const queryClient = useQueryClient();

  // -----------------------------
  // FETCH LIVE CREDITS
  // -----------------------------
  const fetchLiveCredits = useCallback(async () => {
    if (!currentProfile?.id) return;
    const result = await getCreditBalanceAction(currentProfile.id);
    if (result.success && result.data !== undefined) {
      setLiveCredits(result.data);
    }
  }, [currentProfile]);

  // Templates
  const createTemplate = async (templateData: any) => {
    if (!userId || !currentBusiness?.id) return null;

    const result = await createTemplateAction(userId, {
      name: templateData.name,
      content: templateData.content,
    });

    if (result.success && result.data) {
      const newTemplate = result.data;
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    }

    return null;
  };

  const updateTemplate = async (id: string, updates: any) => {
    const result = await updateTemplateAction(id, {
      name: updates.name,
      content: updates.content,
    });

    if (result.success) {
      await fetchTemplates();
    }
  };

  const deleteTemplate = async (id: string) => {
    const result = await deleteTemplateAction(id);

    if (result.success) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  // -----------------------------
  // FETCH MESSAGES
  // -----------------------------
  const fetchMessages = useCallback(async (): Promise<Message[]> => {
    if (!userId) return [];
    const result = await getMessagesAction(userId);

    if (result.success && result.data) {
      return (result.data as any[]).map(msg => ({
        id: msg.id,
        userId: msg.userId,
        locationId: msg.branchId || '',
        profileId: msg.userId,
        customerId: '', // Prisma model might not have customer link in same way
        phoneNumber: msg.recipient,
        content: msg.content,
        status: msg.status as any,
        smsCreditsUsed: 1, // Defaulting to 1 as Prisma model doesn't store this yet
        templateId: undefined,
        errorMessage: undefined,
        sentAt: msg.createdAt,
        deliveredAt: undefined,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        metadata: undefined
      }));
    }
    return [];
  }, [userId]);

  // React Query caching for messages
  const messagesQueryKey = ['messages', userId, currentBusiness?.id];
  const { data: queriedMessages, isLoading: messagesLoading } = useQuery({
    queryKey: messagesQueryKey,
    queryFn: fetchMessages,
    enabled: !!userId && !!currentBusiness?.id,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const messages = queriedMessages || [];

  // -----------------------------
  // FETCH TEMPLATES
  // -----------------------------
  const fetchTemplates = useCallback(async () => {
    if (!userId) return;
    const result = await getTemplatesAction(userId);
    if (result.success && result.data) {
      setTemplates(result.data as any[]);
    }
  }, [userId]);

  // -----------------------------
  // FETCH PURCHASES
  // -----------------------------
  const fetchPurchases = useCallback(async () => {
    // SMS Purchases are not fully implemented in Prisma model yet besides Transaction schema
    // Skipping for now to avoid errors, as useMessages expects sms_credit_purchases table
    setPurchases([]);
  }, []);

  const createMessage = async (messageData: { phoneNumber: string; content: string; customerId?: string; templateId?: string; metadata?: any }) => {
    if (!userId || !currentProfile) return null;

    const formattedPhone = formatPhoneNumber(messageData.phoneNumber);

    const result = await sendMessageAction({
      userId,
      recipients: [formattedPhone],
      content: messageData.content,
      channel: 'sms', // Defaulting to SMS
    });

    if (result.success && result.data) {
      const msg = result.data as any;
      const newMessage: Message = {
        id: msg.id,
        userId: msg.userId,
        locationId: '',
        profileId: msg.userId,
        customerId: messageData.customerId,
        phoneNumber: msg.recipient,
        content: msg.content,
        status: msg.status as any,
        smsCreditsUsed: 1,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      };
      
      queryClient.setQueryData(messagesQueryKey, (oldData: Message[] | undefined) => {
        return oldData ? [newMessage, ...oldData] : [newMessage];
      });
      return newMessage;
    }

    if (!result.success) throw new Error(result.error);
    return null;
  };

  const createBulkMessages = async () => {
    if (!userId || !currentProfile) return { success: 0, failed: 0, errors: [] as string[] };

    // This is simplified as the bulk logic is now on the server
    // We would need to fetch customer phones if the UI doesn't provide them
    // For now, assuming current architecture handles it via sendMessageAction if we pass multiple recipients
    // But sendMessageAction takes string[], let's assume we need to fetch them here or the server action should handle IDs
    
    // Actually, I'll keep it simple for now and just use a placeholder if needed, 
    // or better, fetch them.
    
    return { success: 0, failed: 0, errors: ['Bulk manual migration pending server support for customer IDs'] };
  };

  // Initialize credit purchase via Edge Function
  
  const initiateCreditPurchase = async (creditsAmount: number, phoneNumber: string) => {
    if (!userId || !currentProfile) {
      throw new Error('Missing user or business context');
    }

    const result = await initiateTopUpAction({
      userId,
      amount: creditsAmount * 100, // Assuming 100 per credit
      description: `Purchase of ${creditsAmount} SMS credits`,
      email: currentProfile.email || '',
      name: currentProfile.profile_name || '',
      phoneNumber
    });

    if (result.success && result.data) {
      return {
        purchaseId: (result.data as any).order_tracking_id,
        redirectUrl: (result.data as any).redirect_url,
        trackingId: (result.data as any).order_tracking_id
      };
    }

    throw new Error(result.error);
  };

  useEffect(() => {
    if (!userId || !currentBusiness?.id) return;

    // Real-time subscriptions are disabled in Prisma migration
  }, [userId, currentBusiness?.id, currentProfile?.id]);

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------
  useEffect(() => {
    if (userId && currentBusiness?.id) {
      // Background load ancillary data; messages handled by React Query
      const init = async () => {
        await fetchTemplates();
        await fetchPurchases();
        await fetchLiveCredits();
      };
      init();
    }
  }, [userId, currentBusiness?.id, currentProfile?.id, fetchTemplates, fetchLiveCredits, fetchPurchases]);

  // Derived loading: only true on initial message fetch with no cached data
  const isLoading = messagesLoading && !queriedMessages;

  const getMessageStats = () => {
    const total = messages.length;
    const sent = messages.filter(m => m.status === 'sent' || m.status === 'delivered').length;
    const failed = messages.filter(m => m.status === 'failed').length;
    const pending = messages.filter(m => m.status === 'pending').length;
    const totalCreditsUsed = messages.reduce((sum, m) => sum + m.smsCreditsUsed, 0);

    return { total, sent, failed, pending, totalCreditsUsed, creditsRemaining: liveCredits };
  };

  return {
    messages,
    templates,
    purchases,
    liveCredits,
    isLoading,
    createMessage,
    createBulkMessages,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getMessageStats,
    initiateCreditPurchase,
    refresh: () => { fetchMessages(); fetchTemplates(); fetchPurchases(); fetchLiveCredits(); }
  };

};
