import { Metadata } from "next";
import TasksPage from "@/tasks/ui/pages/TasksPage";

export const metadata: Metadata = {
    title: 'Task Management | Gonza Client',
    description: 'Organize workflows, assign tasks, and track progress across your team.',
};

export default function Page() {
    return <TasksPage />;
}
