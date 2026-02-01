/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getRequisitionsAction, 
  createRequisitionAction, 
  updateRequisitionAction, 
  deleteRequisitionAction 
} from '@/app/requisitions/actions';

export interface Requisition {
  id: string;
  userId: string;
  locationId: string;
  requisitionNumber: string;
  title: string;
  items: RequisitionItem[];
  notes: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface RequisitionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  urgentItem?: boolean;
}

// Map Prisma status to Hook status
const mapStatus = (status: string): 'draft' | 'submitted' | 'approved' | 'completed' => {
    switch (status) {
        case 'APPROVED': return 'approved';
        case 'FULFILLED': return 'completed';
        case 'PENDING': return 'submitted'; // or draft?
        default: return 'draft';
    }
};

export const useRequisitions = (userId: string | undefined, locationId: string | undefined) => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadRequisitions = useCallback(async () => {
    if (!userId || !locationId) {
      setRequisitions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getRequisitionsAction();

      if (result.success && result.data) {
        const formattedRequisitions: Requisition[] = (result.data as any[]).map(item => ({
            id: item.id,
            userId: item.userId,
            locationId: item.branchId, // Map branchId to locationId
            requisitionNumber: item.requisitionNumber,
            title: item.title,
            items: item.items.map((i: any) => ({
                id: i.id,
                productId: i.sku || 'unknown', // Map sku to productId if possible, or keep as is? Schema has sku and productName. No productId relation?
                productName: i.productName,
                quantity: i.quantity,
                urgentItem: false // Not in schema
            })),
            notes: item.notes,
            status: mapStatus(item.status),
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
        }));
        setRequisitions(formattedRequisitions);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error loading requisitions:', error);
      toast({
        title: "Error",
        description: "Failed to load requisitions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, locationId, toast]);

  useEffect(() => {
    loadRequisitions();
  }, [loadRequisitions]);

  const createRequisition = async (
    title: string,
    items: RequisitionItem[],
    notes?: string
  ): Promise<Requisition | null> => {
    if (!userId || !locationId) return null;

    try {
      const result = await createRequisitionAction({
          title,
          items: items.map(i => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              sku: i.productId // assuming productId is sku for now
          })),
          notes,
          status: 'draft'
      });

      if (result.success && result.data) {
        const data = result.data as any;
        const newRequisition: Requisition = {
            id: data.id,
            userId: data.userId,
            locationId: data.branchId,
            requisitionNumber: data.requisitionNumber,
            title: data.title,
            items: data.items.map((i: any) => ({
                id: i.id,
                productId: i.sku || 'unknown',
                productName: i.productName,
                quantity: i.quantity,
                urgentItem: false
            })),
            notes: data.notes,
            status: mapStatus(data.status),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
        };
        
        setRequisitions(prev => [newRequisition, ...prev]);
        
        toast({
            title: "Requisition created",
            description: `Requisition ${newRequisition.requisitionNumber} has been created successfully.`
        });

        return newRequisition;
      }
      throw new Error(result.error);
    } catch (error) {
      console.error('Error creating requisition:', error);
      toast({
        title: "Error",
        description: "Failed to create requisition. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateRequisition = async (
    id: string,
    updates: Partial<{
      title: string;
      items: RequisitionItem[];
      notes: string;
      status: 'draft' | 'submitted' | 'approved' | 'completed';
    }>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const result = await updateRequisitionAction(id, {
          title: updates.title,
          notes: updates.notes,
          status: updates.status,
          items: updates.items ? updates.items.map(i => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              sku: i.productId
          })) : undefined
      });

      if (result.success && result.data) {
        const data = result.data as any;
        const updatedRequisition: Requisition = {
            id: data.id,
            userId: data.userId,
            locationId: data.branchId,
            requisitionNumber: data.requisitionNumber,
            title: data.title,
            items: data.items.map((i: any) => ({
                id: i.id,
                productId: i.sku || 'unknown',
                productName: i.productName,
                quantity: i.quantity,
                urgentItem: false
            })),
            notes: data.notes,
            status: mapStatus(data.status),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
        };
        
        setRequisitions(prev => prev.map(req => req.id === id ? updatedRequisition : req));
        
        toast({
            title: "Requisition updated",
            description: "Requisition has been updated successfully."
        });

        return true;
      }
      throw new Error(result.error);
    } catch (error) {
      console.error('Error updating requisition:', error);
      toast({
        title: "Error",
        description: "Failed to update requisition. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteRequisition = async (id: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const result = await deleteRequisitionAction(id);

      if (result.success) {
        setRequisitions(prev => prev.filter(req => req.id !== id));
        
        toast({
            title: "Requisition deleted",
            description: "Requisition has been deleted successfully."
        });
        return true;
      }
      throw new Error(result.error);
    } catch (error) {
      console.error('Error deleting requisition:', error);
      toast({
        title: "Error",
        description: "Failed to delete requisition. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    requisitions,
    isLoading,
    loadRequisitions,
    createRequisition,
    updateRequisition,
    deleteRequisition
  };
};