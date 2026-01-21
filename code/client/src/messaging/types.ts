export type MessageChannel = 'sms' | 'whatsapp' | 'both';
export type MessageStatus = 'pending' | 'sent' | 'failed' | 'delivered';

export interface Message {
    id: string;
    content: string;
    recipient: string;
    channel: MessageChannel;
    status: MessageStatus;
    mediaUrl?: string;
    userId: string;
    campaignId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Campaign {
    id: string;
    name?: string;
    userId: string;
    createdAt: Date;
}

export interface WhatsAppSession {
    id: string;
    userId: string;
    status: 'connected' | 'connecting' | 'disconnected';
    instanceName?: string;
    qrCode?: string;
    pairingCode?: string;
    linkedPhoneNumber?: string;
    updatedAt: Date;
}
