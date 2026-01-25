import React from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageTemplate } from '@/messaging/types';

interface CommunicationSectionProps {
    sendThankYou: boolean;
    onSendThankYouChange: (value: boolean) => void;
    templates: MessageTemplate[];
    selectedTemplateId: string;
    onTemplateChange: (value: string) => void;
    channel: 'sms' | 'whatsapp' | 'both';
    onChannelChange: (value: 'sms' | 'whatsapp' | 'both') => void;
}

export const CommunicationSection: React.FC<CommunicationSectionProps> = ({
    sendThankYou,
    onSendThankYouChange,
    templates,
    selectedTemplateId,
    onTemplateChange,
    channel,
    onChannelChange
}) => {
    return (
        <div className="bg-card border border-border rounded-4xl p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Communication
            </h3>

            <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-10 h-6 rounded-full transition-all relative ${sendThankYou ? 'bg-primary' : 'bg-muted'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sendThankYou ? 'left-5' : 'left-1'}`} />
                    </div>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={sendThankYou}
                        onChange={() => onSendThankYouChange(!sendThankYou)}
                    />
                    <span className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">Send Thank You Message</span>
                </label>

                {sendThankYou && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Select Template</label>
                            <select
                                value={selectedTemplateId}
                                onChange={(e) => onTemplateChange(e.target.value)}
                                className="w-full h-10 px-3 rounded-xl bg-muted/30 border border-border text-xs font-bold"
                            >
                                <option value="">Choose a template...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Channel</label>
                            <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border">
                                {(['whatsapp', 'sms', 'both'] as const).map(ch => (
                                    <button
                                        key={ch}
                                        onClick={() => onChannelChange(ch)}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${channel === ch ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {ch}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
