"use client";


import { useCallback } from 'react';
import { Task } from '@/components/types/task';
import { addDays, addWeeks, addMonths, format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { createRecurringInstancesAction, deleteRecurringInstancesAction } from '@/app/tasks/actions';

export const useRecurringTasks = () => {
  const createRecurringInstances = useCallback(async (task: Task) => {
    if (!task.is_recurring || !task.recurrence_type || !task.recurrence_end_date) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instances: any[] = [];
    let currentDate = parseISO(task.due_date);
    const endDate = parseISO(task.recurrence_end_date);
    let count = 0;

    // Start from the next occurrence, not the current one (which is the main task)
    // Actually the logic below starts checking and incrementing immediately
    // Let's keep the existing logic logic:
    // It seems to create instances starting from next date.
    
    // NOTE: The original logic had a loop that increments date first then pushes.

    while (currentDate <= endDate && count < 365) { // Safety limit
      let nextDate: Date;
      
      switch (task.recurrence_type) {
        case 'daily':
          nextDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          nextDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(currentDate, 1);
          break;
        default:
          return;
      }

      if (nextDate > endDate) break;

      instances.push({
        user_id: task.user_id,
        location_id: task.location_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: format(nextDate, 'yyyy-MM-dd'),
        category: task.category,
        completed: false,
        completed_at: null,
        reminder_enabled: task.reminder_enabled,
        reminder_time: task.reminder_time,
        is_recurring: false, // Instances are not recurring themselves
        recurrence_type: null,
        recurrence_end_date: null,
        parent_task_id: task.id,
        recurrence_count: count + 1,
      });

      currentDate = nextDate;
      count++;
    }

    if (instances.length > 0) {
      try {
        const result = await createRecurringInstancesAction(instances);

        if (!result.success) throw new Error(result.error);

        toast.success(`Created ${instances.length} recurring task instances`);
      } catch (error) {
        console.error('Error creating recurring task instances:', error);
        toast.error('Failed to create recurring task instances');
      }
    }
  }, []);

  const deleteRecurringInstances = useCallback(async (parentTaskId: string) => {
    try {
      const result = await deleteRecurringInstancesAction(parentTaskId);

      if (!result.success) throw new Error(result.error);
    } catch (error) {
      console.error('Error deleting recurring task instances:', error);
      toast.error('Failed to delete recurring task instances');
    }
  }, []);

  return {
    createRecurringInstances,
    deleteRecurringInstances,
  };
};
