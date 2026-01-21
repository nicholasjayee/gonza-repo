import { Metadata } from "next";
import UsersPage from "@/users/ui/pages/UsersPage";

export const metadata: Metadata = {
    title: 'User Management | Gonza Admin',
    description: 'Manage system users, roles, permissions, and access controls.',
};

export default function Page() {
    return <UsersPage />;
}
