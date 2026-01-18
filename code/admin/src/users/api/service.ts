export const UserService = {
    async fetchUsers() {
        return [
            { id: '1', role: 'ADMIN', name: 'System Admin' },
            { id: '2', role: 'USER', name: 'Staff Member' }
        ];
    }
};
