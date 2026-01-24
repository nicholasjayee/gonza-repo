import { Metadata } from "next";
import BranchSetupPage from "@/branches/ui/pages/BranchSetupPage";

export const metadata: Metadata = {
    title: 'Initialize Your Network | Gonza',
    description: 'Set up your main branch to begin operations.',
};

export default function Page() {
    return <BranchSetupPage />;
}
