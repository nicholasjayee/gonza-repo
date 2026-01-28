"use client";

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Task } from '@prisma/client';

interface TaskCalendarProps {
    tasks: any[];
    onRefresh: () => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const getTasksForDay = (day: Date) => {
        return tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-black italic tracking-tighter text-foreground">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-muted/50 hover:bg-muted rounded-xl transition-colors">
                        Today
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-4">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 bg-muted/10 p-2 rounded-3xl border border-border/50">
                {days.map((day, dayIdx) => {
                    const dayTasks = getTasksForDay(day);
                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[120px] bg-card rounded-2xl p-2 border transition-all hover:shadow-md relative group ${!isSameMonth(day, monthStart)
                                    ? "bg-muted/30 text-muted-foreground border-transparent"
                                    : "border-border/50 text-foreground"
                                } ${isSameDay(day, new Date()) ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold">{format(day, dateFormat)}</span>
                                {dayTasks.length > 0 && (
                                    <span className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-full text-[10px] font-black">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`text-[9px] p-1.5 rounded-lg truncate font-bold border-l-2 cursor-pointer hover:opacity-80 transition-opacity ${task.status === 'DONE' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 decoration-slice line-through opacity-70' :
                                                task.priority === 'URGENT' ? 'bg-rose-500/10 border-rose-500 text-rose-700' :
                                                    'bg-blue-500/10 border-blue-500 text-blue-700'
                                            }`}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
