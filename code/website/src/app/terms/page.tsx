import { Metadata } from "next";
import TermsPage from "@/showcase/ui/pages/TermsPage";

export const metadata: Metadata = {
    title: 'Terms of Service | Gonza Systems',
    description: 'The ultimate business management platform.',
};

export default function Page() {
    return <TermsPage />;
}
