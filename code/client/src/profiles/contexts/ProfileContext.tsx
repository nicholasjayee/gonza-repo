"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBusiness } from '@/inventory/contexts/BusinessContext';
import { toast } from 'sonner';
import { 
  getProfilesAction, 
  createProfileAction, 
  updateProfileAction, 
  deleteProfileAction,
  getCurrentUserAction
} from '@/app/profiles/actions';

// Updated to match User model in Prisma
export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string;
  isActive: boolean;
  branchId?: string | null;
  phoneNumber?: string; // Optional if we want to add it later or if mapped
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProfileContextType {
  profiles: BusinessProfile[];
  currentProfile: BusinessProfile | null;
  isLoading: boolean;
  setCurrentProfile: (profile: BusinessProfile | null) => void;
  loadProfiles: () => Promise<void>;
  createProfile: (data: { name: string; email: string; role: string; password?: string; phoneNumber?: string }) => Promise<BusinessProfile | null>;
  updateProfile: (id: string, data: Partial<BusinessProfile>) => Promise<boolean>;
  deleteProfile: (id: string) => Promise<boolean>;
  toggleProfileStatus: (id: string, isActive: boolean) => Promise<boolean>;
  userId: string | undefined;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentBusiness } = useBusiness();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
        const res = await getCurrentUserAction();
        if (res.success && res.user) {
            setUserId(res.user.id);
        }
    };
    fetchUser();
  }, []);

  const loadProfiles = React.useCallback(async () => {
    if (!currentBusiness?.id) return;

    setIsLoading(true);
    try {
      const res = await getProfilesAction();
      if (res.success && res.data) {
          setProfiles(res.data as unknown as BusinessProfile[]);
      } else {
         if (res.error) toast.error(res.error);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness?.id]);

  const createProfile = async (data: { name: string; email: string; role: string; password?: string; phoneNumber?: string }): Promise<BusinessProfile | null> => {
    if (!currentBusiness?.id) return null;

    try {
        const res = await createProfileAction(data);
        if (res.success && res.data) {
             const newProfile = res.data as unknown as BusinessProfile;
             setProfiles(prev => [...prev, newProfile]);
             
             if (!currentProfile) {
                handleSetCurrentProfile(newProfile);
             }
             toast.success(`Profile "${data.name}" created successfully`);
             return newProfile;
        } else {
            toast.error(res.error || 'Failed to create profile');
            return null;
        }
    } catch (error: unknown) {
      console.error('Error creating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      toast.error(errorMessage);
      return null;
    }
  };

  const updateProfile = async (id: string, data: Partial<BusinessProfile>): Promise<boolean> => {
    try {
      const res = await updateProfileAction(id, {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive
      });

      if (res.success && res.data) {
          setProfiles(prev => prev.map(profile => 
            profile.id === id ? { ...profile, ...data } : profile
          ));

          if (currentProfile?.id === id) {
            setCurrentProfile(prev => prev ? { ...prev, ...data } : null);
          }

          toast.success('Profile updated successfully');
          return true;
      } else {
          toast.error(res.error || 'Failed to update profile');
          return false;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  const deleteProfile = async (id: string): Promise<boolean> => {
    try {
      const res = await deleteProfileAction(id);
      if (res.success) {
          setProfiles(prev => prev.filter(profile => profile.id !== id));
          
          if (currentProfile?.id === id) {
            setCurrentProfile(null);
          }

          toast.success('Profile deleted successfully');
          return true;
      } else {
          toast.error(res.error || 'Failed to delete profile');
          return false;
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
      return false;
    }
  };

  const toggleProfileStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    return updateProfile(id, { isActive });
  };

  // Load profiles when business changes
  useEffect(() => {
    if (currentBusiness?.id) {
      loadProfiles();
      setCurrentProfile(null);
    } else {
      setProfiles([]);
      setCurrentProfile(null);
    }
  }, [currentBusiness?.id, loadProfiles]);

  // Save current profile to localStorage
  const handleSetCurrentProfile = React.useCallback((profile: BusinessProfile | null) => {
    setCurrentProfile(profile);
    if (currentBusiness?.id) {
      if (profile) {
        localStorage.setItem(`currentProfile_${currentBusiness.id}`, profile.id);
      } else {
        localStorage.removeItem(`currentProfile_${currentBusiness.id}`);
      }
    }
  }, [currentBusiness?.id]);

  // Load current profile from localStorage or auto-select first profile
  useEffect(() => {
    if (profiles.length > 0 && currentBusiness?.id) {
      const savedProfileId = localStorage.getItem(`currentProfile_${currentBusiness.id}`);
      if (savedProfileId) {
        const profile = profiles.find(p => p.id === savedProfileId);
        if (profile) {
          handleSetCurrentProfile(profile);
          return;
        }
      }
      
      // Auto-select first profile if none is saved and none is currently selected
      if (!currentProfile) {
        handleSetCurrentProfile(profiles[0]);
      }
    }
  }, [profiles, currentBusiness?.id, currentProfile, handleSetCurrentProfile]);

  return (
    <ProfileContext.Provider value={{
      profiles,
      currentProfile,
      isLoading,
      setCurrentProfile: handleSetCurrentProfile,
      loadProfiles,
      createProfile,
      updateProfile,
      deleteProfile,
      toggleProfileStatus,
      userId
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};