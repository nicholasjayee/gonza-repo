export const TaskService = {
    async fetchTasks() {
        return [
            { id: '1', title: 'Restock Hardware', status: 'Pending', deadline: '2026-02-01' },
            { id: '2', title: 'Approve Requisitions', status: 'In Progress', deadline: '2026-01-25' }
        ];
    },
    async updateTaskStatus(id: string, status: string) {
        return { id, status };
    }
};
