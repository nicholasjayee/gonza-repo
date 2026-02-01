/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/components/contexts/BusinessContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCustomersAction,
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction
} from '@/app/customers/actions';

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  birthday: Date | null;
  gender: string | null;
  location: string | null;
  categoryId: string | null;
  notes: string | null;
  tags: string[] | null;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export const useCustomers = (_initialPageSize: number = 50) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(_initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const { currentBusiness } = useBusiness();
  const { logActivity } = useActivityLogger();
  const queryClient = useQueryClient();

  const queryKey = ['customers', currentBusiness?.id];

  const loadCustomers = useCallback(async (): Promise<{ customers: Customer[], count: number }> => {
    if (!currentBusiness) {
      return { customers: [], count: 0 };
    }

    try {
      const result = await getCustomersAction();
      if (result.success && result.data) {
        // Based on Prisma model and error message
        interface RawCustomer {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          notes: string | null;
          branchId: string | null;
          adminId: string;
          createdAt: string;
          updatedAt: string;
          // Fields that seem to be missing in Prisma model but used in frontend
          birthday?: string | null;
          gender?: string | null;
          categoryId?: string | null;
          tags?: string[] | null;
          socialMedia?: any | null; 
        }
        const rawCustomers = result.data as unknown as RawCustomer[];
        const formattedCustomers: Customer[] = rawCustomers.map(customer => ({
          id: customer.id,
          fullName: customer.name,
          phoneNumber: customer.phone,
          email: customer.email,
          birthday: customer.birthday ? new Date(customer.birthday) : null,
          gender: customer.gender || null,
          location: customer.address || customer.city, // Map city/address to location
          categoryId: customer.categoryId || null,
          notes: customer.notes,
          tags: customer.tags || [],
          socialMedia: customer.socialMedia || null,
          createdAt: new Date(customer.createdAt),
          updatedAt: new Date(customer.updatedAt)
        }));

        return { customers: formattedCustomers, count: formattedCustomers.length };
      }
      throw new Error(result.error || 'Failed to fetch customers');
    } catch (error: any) {
      console.error('Error loading customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive"
      });
      return { customers: [], count: 0 };
    }
  }, [currentBusiness, toast]);

  const { data: queriedData, isLoading: isQueryLoading, refetch } = useQuery({
    queryKey,
    queryFn: loadCustomers,
    enabled: !!currentBusiness?.id,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    if (queriedData) {
      setCustomers(queriedData.customers);
      setTotalCount(queriedData.count);
    }
  }, [queriedData]);

  const isLoading = isQueryLoading && !queriedData;

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentBusiness) {
      toast({ title: "Error", description: "No business selected", variant: "destructive" });
      return null;
    }

    try {
      const result = await createCustomerAction({
        fullName: customerData.fullName,
        phoneNumber: customerData.phoneNumber,
        email: customerData.email,
        birthday: customerData.birthday || null,
        gender: customerData.gender,
        address: customerData.location,
        categoryId: customerData.categoryId,
        notes: customerData.notes,
        tags: customerData.tags,
        socialMedia: customerData.socialMedia
      });
      if (result.success && result.data) {
        interface RawCustomerData {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          notes: string | null;
          createdAt: string;
          updatedAt: string;
          // Potential additional fields
          birthday?: string | null;
          gender?: string | null;
          categoryId?: string | null;
          tags?: string[] | null;
          socialMedia?: any | null;
        }
        const data = result.data as unknown as RawCustomerData;
        
        queryClient.invalidateQueries({ queryKey });
        
        await logActivity({
          activityType: 'CREATE',
          module: 'CUSTOMERS',
          entityType: 'customer',
          entityId: data.id,
          entityName: customerData.fullName,
          description: `Created customer "${customerData.fullName}"`,
          metadata: {
            phoneNumber: customerData.phoneNumber,
            email: customerData.email,
            location: customerData.location
          }
        });
        
        toast({ title: "Success", description: "Customer created successfully" });
        return data;
      }
      throw new Error(result.error || 'Failed to create customer');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';
      console.error('Error creating customer:', error);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return null;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const result = await updateCustomerAction(id, updates);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        
        const customer = customers.find(c => c.id === id);
        if (customer) {
          await logActivity({
            activityType: 'UPDATE',
            module: 'CUSTOMERS',
            entityType: 'customer',
            entityId: id,
            entityName: customer.fullName,
            description: `Updated customer "${customer.fullName}"`,
            metadata: { updates }
          });
        }
        
        toast({ title: "Success", description: "Customer updated successfully" });
        return true;
      }
      throw new Error(result.error || 'Failed to update customer');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update customer';
      console.error('Error updating customer:', error);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const customer = customers.find(c => c.id === id);
      const result = await deleteCustomerAction(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
        
        if (customer) {
          await logActivity({
            activityType: 'DELETE',
            module: 'CUSTOMERS',
            entityType: 'customer',
            entityId: id,
            entityName: customer.fullName,
            description: `Deleted customer "${customer.fullName}"`,
            metadata: {
              phoneNumber: customer.phoneNumber,
              email: customer.email
            }
          });
        }
        
        toast({ title: "Success", description: "Customer deleted successfully" });
        return true;
      }
      throw new Error(result.error || 'Failed to delete customer');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete customer';
      console.error('Error deleting customer:', error);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return false;
    }
  };

  return {
    customers,
    isLoading,
    createCustomer,
    addCustomer: createCustomer,
    updateCustomer,
    deleteCustomer,
    loadCustomers: refetch,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount
  };
};
