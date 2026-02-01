import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getBranchesAction, 
  createBranchAction, 
  updateBranchAction, 
  deleteBranchAction, 
  setDefaultBranchAction 
} from '@/branches/actions';

export interface BusinessLocation {
  id: string;
  name: string;
  location: string;
  phone?: string | null;
  email?: string | null;
  type: 'MAIN' | 'SUB';
  adminId: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useBusiness = (userId: string | undefined) => {
  const [businesses, setBusinesses] = useState<BusinessLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadBusinesses = useCallback(async () => {
    if (!userId) {
      setBusinesses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getBranchesAction();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to load branches");
      }

      interface SerializedBranch {
        id: string;
        name: string;
        location: string;
        phone: string | null;
        email: string | null;
        type: 'MAIN' | 'SUB';
        adminId: string;
        createdAt: string | Date;
        updatedAt: string | Date;
      }

      const formattedBusinesses = (result.data as SerializedBranch[]).map(branch => ({
        id: branch.id,
        name: branch.name,
        location: branch.location,
        phone: branch.phone,
        email: branch.email,
        type: branch.type,
        adminId: branch.adminId,
        isDefault: false, // We'll handle default state via User.branchId if needed elsewhere
        createdAt: new Date(branch.createdAt),
        updatedAt: new Date(branch.updatedAt)
      }));

      setBusinesses(formattedBusinesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load business locations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const createBusiness = async (name: string, setAsDefault: boolean = false): Promise<BusinessLocation | null> => {
    try {
      if (!userId) return null;

      const result = await createBranchAction({ 
        name, 
        location: "Default Location", // Placeholder as original didn't have it
        type: 'SUB'
      });

      if (!result.success || !result.data) {
        throw new Error(result.error);
      }

      interface SerializedBranch {
        id: string;
        name: string;
        location: string;
        phone: string | null;
        email: string | null;
        type: 'MAIN' | 'SUB';
        adminId: string;
        createdAt: string | Date;
        updatedAt: string | Date;
      }
      const branch = result.data as SerializedBranch;
      const newBusiness: BusinessLocation = {
        id: branch.id,
        name: branch.name,
        location: branch.location,
        phone: branch.phone,
        email: branch.email,
        type: branch.type,
        adminId: branch.adminId,
        isDefault: setAsDefault,
        createdAt: new Date(branch.createdAt),
        updatedAt: new Date(branch.updatedAt)
      };

      if (setAsDefault) {
        await setDefaultBranchAction(branch.id);
      }

      await loadBusinesses();
      
      toast({
        title: "Success",
        description: `Business location "${name}" created successfully.`
      });

      return newBusiness;
    } catch (error) {
      console.error('Error creating business:', error);
      toast({
        title: "Error",
        description: "Failed to create business location. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateBusiness = async (id: string, name: string): Promise<boolean> => {
    try {
      if (!userId) return false;

      const result = await updateBranchAction(id, { name });

      if (!result.success) {
        throw new Error(result.error);
      }

      await loadBusinesses();
      
      toast({
        title: "Success",
        description: "Business location updated successfully."
      });

      return true;
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: "Error",
        description: "Failed to update business location. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteBusiness = async (id: string): Promise<boolean> => {
    try {
      if (!userId) return false;

      const businessToDelete = businesses.find(b => b.id === id);
      if (!businessToDelete) {
        toast({
          title: "Error",
          description: "Business location not found.",
          variant: "destructive"
        });
        return false;
      }

      const result = await deleteBranchAction(id);

      if (!result.success) {
        throw new Error(result.error);
      }

      await loadBusinesses();
      
      toast({
        title: "Success",
        description: `Business location "${businessToDelete.name}" and all associated data have been deleted successfully.`
      });

      return true;
    } catch (error) {
      console.error('Error deleting business:', error);
      toast({
        title: "Error",
        description: "Failed to delete business location. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const setDefaultBusiness = async (id: string): Promise<boolean> => {
    try {
      if (!userId) return false;

      const result = await setDefaultBranchAction(id);

      if (!result.success) {
        throw new Error(result.error);
      }

      await loadBusinesses();
      
      const business = businesses.find(b => b.id === id);
      toast({
        title: "Success",
        description: `"${business?.name}" is now the default business location.`
      });

      return true;
    } catch (error) {
      console.error('Error setting default business:', error);
      toast({
        title: "Error",
        description: "Failed to set default business location. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    businesses,
    isLoading,
    loadBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    setDefaultBusiness
  };
};
