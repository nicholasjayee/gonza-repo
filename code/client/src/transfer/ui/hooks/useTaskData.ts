"use client";

import { useState, useEffect } from 'react';

export function useTaskData() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tasks').then(res => res.json()).then(setTasks).finally(() => setLoading(false));
    }, []);

    return { tasks, loading };
}
