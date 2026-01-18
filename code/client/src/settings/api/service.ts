export const SettingService = {
    async fetchRoles() {
        return [
            { id: '1', name: 'Admin', permissions: ['ALL'] },
            { id: '2', name: 'Branch Manager', permissions: ['SALES', 'INVENTORY'] }
        ];
    },
    async updateConfig(key: string, value: any) {
        console.log(`Setting ${key} to ${value}`);
        return { key, value };
    }
};
