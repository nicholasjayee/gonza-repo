export const BranchService = {
    async fetchBranches() {
        return [
            { id: '1', name: 'Main Branch', location: 'Kampala' },
            { id: '2', name: 'West Branch', location: 'Mbarara' }
        ];
    },
    async fetchEmployees(branchId: string) {
        return [
            { id: '1', name: 'Employee A', role: 'Sales' },
            { id: '2', name: 'Employee B', role: 'Manager' }
        ];
    }
};
