"use client";

import React, { useState } from "react";
import { ProfileContent } from "@/profiles/components/ProfileContent";
import { ProfileHeader } from "@/profiles/components/ProfileHeader";
import { NewProfileDialog } from "@/profiles/components/NewProfileDialog";
import { EditProfileDialog } from "@/profiles/components/EditProfileDialog";
import { DeleteProfileDialog } from "@/profiles/components/DeleteProfileDialog";
import { useProfiles, BusinessProfile } from "@/profiles/contexts/ProfileContext";
import { useBusiness } from "@/inventory/contexts/BusinessContext";

const Profiles = () => {
  const { currentBusiness } = useBusiness();
  const { profiles, isLoading } = useProfiles();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BusinessProfile | null>(
    null,
  );
  const [deletingProfile, setDeletingProfile] =
    useState<BusinessProfile | null>(null);

  if (!currentBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">
            No Business Selected
          </h2>
          <p className="text-muted-foreground">
            Please select a business to manage profiles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <ProfileHeader
        profilesCount={profiles.length}
        onNewProfile={() => setShowNewDialog(true)}
      />

      <ProfileContent
        profiles={profiles}
        isLoading={isLoading}
        onEditProfile={setEditingProfile}
        onDeleteProfile={setDeletingProfile}
      />

      <NewProfileDialog open={showNewDialog} onOpenChange={setShowNewDialog} />

      <EditProfileDialog
        profile={editingProfile}
        open={!!editingProfile}
        onOpenChange={(open) => !open && setEditingProfile(null)}
      />

      <DeleteProfileDialog
        profile={deletingProfile}
        open={!!deletingProfile}
        onOpenChange={(open) => !open && setDeletingProfile(null)}
      />
    </div>
  );
};

export default Profiles;
