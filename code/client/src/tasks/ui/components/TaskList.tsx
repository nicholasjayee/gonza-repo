"use client";

import React from 'react';
import { format } from 'date-fns';
import { MoreVertical, CheckCircle2, Clock, AlertCircle, Calendar as CalendarIcon, User as UserIcon, Trash2, Edit2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@gonza/shared/prisma/db'; // Assuming types are available
import { updateTaskStatusAction, deleteTaskAction } from '@/tasks/api/controller';

interface TaskListProps {
    tasks: any[];
    onRefresh: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onRefresh }) => {

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        await updateTaskStatusAction(taskId, newStatus);
        onRefresh();
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        await deleteTaskAction(taskId);
        onRefresh();
    };

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center opacity-50">
                <CheckCircle2 className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">No tasks found</h3>
                <p className="text-sm">Create a new task to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto p-4">
            <table className="w-full text-left font-sans text-sm min-w-[800px]">
                <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest w-1/3">Task</th>
                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Due Date</th>
                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Priority</th>
                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Assignee</th>
                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Status</th>
                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                    {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4 align-top">
                                <p className="font-bold text-base text-foreground mb-1">{task.title}</p>
                                {task.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top">
                                {task.dueDate ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        <span className="font-medium">{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground/40 italic">No due date</span>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top">
                                <PriorityBadge priority={task.priority} />
                            </td>
                            <td className="px-6 py-4 align-top">
                                {task.assignedTo ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                            {task.assignedTo.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-xs">{task.assignedTo.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground/40 italic text-xs">Unassigned</span>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top">
                                <StatusSelect
                                    status={task.status}
                                    onChange={(s) => handleStatusChange(task.id, s)}
                                />
                            </td>
                            <td className="px-6 py-4 align-top text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                        title="Delete"
                                        onClick={() => handleDelete(task.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

function PriorityBadge({ priority }: { priority: string }) {
    const styles: any = {
        LOW: 'bg-slate-100 text-slate-600',
        NORMAL: 'bg-blue-50 text-blue-600',
        HIGH: 'bg-orange-50 text-orange-600',
        URGENT: 'bg-rose-50 text-rose-600 animate-pulse'
    };
    return (
        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${styles[priority] || styles.NORMAL}`}>
            {priority}
        </span>
    );
}

function StatusSelect({ status, onChange }: { status: string, onChange: (s: any) => void }) {
    const config: any = {
        TODO: { color: 'bg-slate-100 text-slate-600', label: 'To Do' },
        IN_PROGRESS: { color: 'bg-indigo-50 text-indigo-600', label: 'In Progress' },
        REVIEW: { color: 'bg-purple-50 text-purple-600', label: 'Review' },
        DONE: { color: 'bg-emerald-50 text-emerald-600', label: 'Done' },
        CANCELLED: { color: 'bg-rose-50 text-rose-600', label: 'Cancelled' }
    };

    return (
        <select
            value={status}
            onChange={(e) => onChange(e.target.value)}
            className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border-none outline-none cursor-pointer hover:opacity-80 transition-opacity ${config[status]?.color}`}
        >
            {Object.keys(config).map(key => (
                <option key={key} value={key}>{config[key].label}</option>
            ))}
        </select>
    );
}
