"use client";
import React from "react";
import { BusinessProvider } from "@/inventory/contexts/BusinessContext";
import { QueryProvider } from "@/shared/components/providers/QueryProvider";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <BusinessProvider>{children}</BusinessProvider>
    </QueryProvider>
  );
}
