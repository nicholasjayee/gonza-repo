"use client";

import { useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { toast } from 'sonner';

export const useSaleNotifications = () => {
  useEffect(() => {
    // Supabase client is being removed. Real-time notifications paused.
    /*
    const subscription = supabase
      .channel('public:sales')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales' },
        (payload) => {
          const sale = payload.new;
          toast.success(`Notification New sale: ${sale.customer_name} - ${sale.receipt_number}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
    */
  }, []);
};
