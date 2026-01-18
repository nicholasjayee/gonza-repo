export const MessagingService = {
    async sendMessage(data: { to: string; content: string; channel: 'SMS' | 'WHATSAPP' }) {
        console.log(`Sending ${data.channel} to ${data.to}: ${data.content}`);
        return { success: true, messageId: Math.random().toString() };
    },
    async fetchLogs() {
        return [
            { id: '1', to: '+256700000000', status: 'Sent', channel: 'SMS' },
            { id: '2', to: '+256700000001', status: 'Delivered', channel: 'WHATSAPP' }
        ];
    }
};
