import { Metadata } from "next";
import MessagingPage from "@/messaging/ui/pages/MessagingPage";

export const metadata: Metadata = {
    title: 'Messaging Center | Gonza Client',
    description: 'Communicate with customers and team members from a unified inbox.',
};

export default function Page() {
    return <MessagingPage />;
}
