import React from 'react';
import { ProfileCard } from './ProfileCard';
import { BusinessProfile } from '@/profiles/contexts/ProfileContext';

interface ProfileListProps {
  profiles: BusinessProfile[];
  onEditProfile: (profile: BusinessProfile) => void;
  onDeleteProfile: (profile: BusinessProfile) => void;
}

export const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  onEditProfile,
  onDeleteProfile
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onEdit={() => onEditProfile(profile)}
          onDelete={() => onDeleteProfile(profile)}
        />
      ))}
    </div>
  );
};