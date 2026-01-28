"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, List, Plus, Filter, RefreshCw } from 'lucide-react';
import { getTasksAction } from '@/tasks/api/controller';
import { TaskList } from '../components/TaskList';
import { TaskCalendar } from '../components/TaskCalendar';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { Task } from '@prisma/client'; // or custom type if needed

export default function TasksPage() {
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadTasks = async () => {
        setLoading(true);
        const res = await getTasksAction();
        if (res.success) {
            setTasks(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight">Tasks & Schedule</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Manage assignments and deadlines across your branch</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-muted/50 p-1 rounded-2xl flex items-center border border-border">
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${view === 'calendar'
                                    ? 'bg-white shadow-sm text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Calendar
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${view === 'list'
                                    ? 'bg-white shadow-sm text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            List
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="h-11 px-6 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Task
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-card border border-border rounded-[2.5rem] p-1 shadow-sm min-h-[600px]">
                {loading ? (
                    <div className="flex items-center justify-center h-[600px]">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <>
                        {view === 'calendar' ? (
                            <TaskCalendar tasks={tasks} onRefresh={loadTasks} />
                        ) : (
                            <TaskList tasks={tasks} onRefresh={loadTasks} />
                        )}
                    </>
                )}
            </div>

            {showCreateModal && (
                <CreateTaskModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadTasks();
                    }}
                />
            )}
        </div>
    );
}
