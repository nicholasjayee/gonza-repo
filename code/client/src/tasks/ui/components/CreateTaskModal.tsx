"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, AlignLeft } from 'lucide-react';
import { createTaskAction, getBranchUsersAction } from '@/tasks/api/controller';
import { TaskPriority } from '@gonza/shared/prisma/db';

interface CreateTaskModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('NORMAL');
    const [assignedToId, setAssignedToId] = useState('');

    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadUsers() {
            const res = await getBranchUsersAction();
            if (res.success) {
                setUsers(res.data);
            }
        }
        loadUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const res = await createTaskAction({
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            priority,
            assignedToId: assignedToId || undefined
        });

        if (res.success) {
            onSuccess();
        } else {
            setError(res.error || "Failed to create task");
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-xl font-black italic tracking-tight">New Task</h3>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Task Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Monthly Stock Count"
                                className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl font-bold text-sm outline-none focus:border-primary transition-all placeholder:font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-2">
                                <AlignLeft className="w-3 h-3" /> Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add details..."
                                className="w-full h-24 p-4 bg-muted/30 border border-border rounded-xl font-medium text-sm outline-none focus:border-primary transition-all resize-none placeholder:font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Due Date
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl font-bold text-sm outline-none focus:border-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-2">
                                    <Flag className="w-3 h-3" /> Priority
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                    className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl font-bold text-sm outline-none focus:border-primary transition-all cursor-pointer"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-2">
                                <User className="w-3 h-3" /> Assign To
                            </label>
                            <select
                                value={assignedToId}
                                onChange={(e) => setAssignedToId(e.target.value)}
                                className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl font-bold text-sm outline-none focus:border-primary transition-all cursor-pointer"
                            >
                                <option value="">Unassigned</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-600">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
