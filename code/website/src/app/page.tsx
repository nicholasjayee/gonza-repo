import { Metadata } from "next";
import HomePage from "@/showcase/ui/pages/HomePage";

export const metadata: Metadata = {
    title: 'Home | Gonza Systems',
    description: 'The ultimate business management platform.',
};

export default function Page() {
    return <HomePage />;
}
