
import React from 'react';
import { ProfileProvider } from "@/profiles/contexts/ProfileContext";

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </ProfileProvider>
  );
}
