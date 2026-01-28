"use client";

import MessagingLayout from "@/messaging/ui/components/MessagingLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <MessagingLayout>{children}</MessagingLayout>;
}
