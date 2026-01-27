import { Metadata } from "next";
import PolicyPage from "@/showcase/ui/pages/PolicyPage";

export const metadata: Metadata = {
    title: 'Privacy Policy | Gonza Systems',
    description: 'The ultimate business management platform.',
};

export default function Page() {
    return <PolicyPage />;
}
