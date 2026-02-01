/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db, TaskPriority } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";
import { NextRequest } from "next/server";
import { CreateTaskData, UpdateTaskData } from "@/components/types/task";

async function getAuth() {
  const headerList = await headers();
  const cookieStore = await cookies();

  const mockReq = {
    headers: headerList,
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
  } as unknown as NextRequest;

  return authGuard(mockReq, ["user", "admin"]);
}

// ==========================
// 🏷️ CATEGORY ACTIONS
// ==========================

export async function getCategoriesAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const categories = await db.taskCategory.findMany({
      where: {
        userId: auth.user.id,
        branchId,
      },
      orderBy: { name: "asc" },
    });

    const mappedCategories = categories.map((c) => ({
      id: c.id,
      user_id: c.userId,
      location_id: c.branchId,
      name: c.name,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    }));

    return { success: true, data: serialize(mappedCategories) };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return { success: false, error: error.message };
  }
}

export async function createCategoryAction(name: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const category = await db.taskCategory.create({
      data: {
        userId: auth.user.id,
        branchId,
        name: name.trim(),
      },
    });

    const mappedCategory = {
      id: category.id,
      user_id: category.userId,
      location_id: category.branchId,
      name: category.name,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString(),
    };

    return { success: true, data: serialize(mappedCategory) };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCategoryAction(id: string, name: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const category = await db.taskCategory.update({
      where: { id, userId: auth.user.id },
      data: { name: name.trim() },
    });

    return { success: true, data: serialize(category) };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    await db.taskCategory.delete({
      where: { id, userId: auth.user.id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
}

// ==========================
// 📝 TASK ACTIONS
// ==========================

export async function getTasksAction() {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const tasks = await db.task.findMany({
      where: {
        createdById: auth.user.id,
        branchId,
      },
      include: {
        category: true,
      },
      orderBy: { dueDate: "asc" },
    });

    const mappedTasks = tasks.map((t) => ({
      id: t.id,
      user_id: t.createdById,
      location_id: t.branchId,
      title: t.title,
      description: t.description,
      priority: t.priority === "NORMAL" ? "Medium" : t.priority === "LOW" ? "Low" : "High",
      due_date: t.dueDate ? t.dueDate.toISOString() : "",
      category: t.category ? t.category.name : null,
      completed: t.completed,
      completed_at: t.completedAt ? t.completedAt.toISOString() : null,
      reminder_enabled: t.reminderEnabled,
      reminder_time: t.reminderTime ? t.reminderTime.toISOString() : null,
      is_recurring: t.isRecurring,
      recurrence_type: t.recurrenceType,
      recurrence_end_date: t.recurrenceEndDate ? t.recurrenceEndDate.toISOString() : null,
      recurrence_count: t.recurrenceCount || 0,
      parent_task_id: t.parentTaskId,
      created_at: t.createdAt.toISOString(),
      updated_at: t.updatedAt.toISOString(),
    }));

    return { success: true, data: serialize(mappedTasks) };
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: error.message };
  }
}

export async function createTaskAction(taskData: CreateTaskData) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    // Find category ID if category name provided
    let categoryId = null;
    if (taskData.category) {
      const category = await db.taskCategory.findFirst({
        where: { name: taskData.category, branchId },
      });
      if (category) categoryId = category.id;
    }

    const task = await db.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority === "Medium" ? TaskPriority.NORMAL : taskData.priority.toUpperCase() as TaskPriority,
        dueDate: taskData.due_date ? new Date(taskData.due_date) : undefined,
        categoryId,
        reminderEnabled: taskData.reminder_enabled || false,
        reminderTime: taskData.reminder_time ? new Date(taskData.reminder_time) : undefined,
        isRecurring: taskData.is_recurring || false,
        recurrenceType: taskData.recurrence_type,
        recurrenceEndDate: taskData.recurrence_end_date ? new Date(taskData.recurrence_end_date) : undefined,
        createdById: auth.user.id,
        branchId,
      },
      include: { category: true },
    });

    const mappedTask = {
      id: task.id,
      user_id: task.createdById,
      location_id: task.branchId,
      title: task.title,
      description: task.description,
      priority: task.priority === "NORMAL" ? "Medium" : task.priority === "LOW" ? "Low" : "High",
      due_date: task.dueDate ? task.dueDate.toISOString() : "",
      category: task.category ? task.category.name : null,
      completed: task.completed,
      completed_at: task.completedAt ? task.completedAt.toISOString() : null,
      reminder_enabled: task.reminderEnabled,
      reminder_time: task.reminderTime ? task.reminderTime.toISOString() : null,
      is_recurring: task.isRecurring,
      recurrence_type: task.recurrenceType,
      recurrence_end_date: task.recurrenceEndDate ? task.recurrenceEndDate.toISOString() : null,
      recurrence_count: task.recurrenceCount || 0,
      parent_task_id: task.parentTaskId,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
    };

    return { success: true, data: serialize(mappedTask) };
  } catch (error: any) {
    console.error("Error creating task:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTaskAction(id: string, updates: UpdateTaskData) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
     const { branchId } = await getActiveBranch();
    
    // Check if category needs update
    let categoryUpdate = {};
    if (updates.category) {
       const category = await db.taskCategory.findFirst({
         where: { name: updates.category, branchId },
       });
       if (category) categoryUpdate = { categoryId: category.id };
    }

    const task = await db.task.update({
      where: { id, createdById: auth.user.id },
      data: {
        title: updates.title,
        description: updates.description,
        priority: updates.priority ? (updates.priority === "Medium" ? TaskPriority.NORMAL : updates.priority.toUpperCase() as TaskPriority) : undefined,
        dueDate: updates.due_date ? new Date(updates.due_date) : undefined,
        ...categoryUpdate,
        completed: updates.completed,
        completedAt: updates.completed_at ? new Date(updates.completed_at) : (updates.completed === false ? null : undefined),
        reminderEnabled: updates.reminder_enabled,
        reminderTime: updates.reminder_time ? new Date(updates.reminder_time) : (updates.reminder_time === null ? null : undefined),
        isRecurring: updates.is_recurring,
        recurrenceType: updates.recurrence_type,
        recurrenceEndDate: updates.recurrence_end_date ? new Date(updates.recurrence_end_date) : undefined,
      },
      include: { category: true },
    });

    const mappedTask = {
      id: task.id,
      user_id: task.createdById,
      location_id: task.branchId,
      title: task.title,
      description: task.description,
      priority: task.priority === "NORMAL" ? "Medium" : task.priority === "LOW" ? "Low" : "High",
      due_date: task.dueDate ? task.dueDate.toISOString() : "",
      category: task.category ? task.category.name : null,
      completed: task.completed,
      completed_at: task.completedAt ? task.completedAt.toISOString() : null,
      reminder_enabled: task.reminderEnabled,
      reminder_time: task.reminderTime ? task.reminderTime.toISOString() : null,
      is_recurring: task.isRecurring,
      recurrence_type: task.recurrenceType,
      recurrence_end_date: task.recurrenceEndDate ? task.recurrenceEndDate.toISOString() : null,
      recurrence_count: task.recurrenceCount || 0,
      parent_task_id: task.parentTaskId,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
    };

    return { success: true, data: serialize(mappedTask) };
  } catch (error: any) {
    console.error("Error updating task:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTaskAction(id: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    await db.task.delete({
      where: { id, createdById: auth.user.id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateTasksAction(taskIds: string[], updates: UpdateTaskData) {
   const auth = await getAuth();
   if (!auth.authorized) throw new Error("Unauthorized");
   
   // Note: Bulk updates with varied fields in Prisma is tricky if logic is complex. 
   // For simple 'completed' toggle, it's fine.
   
   try {
     const updateData: any = {};
     if (updates.completed !== undefined) updateData.completed = updates.completed;
     if (updates.completed_at) updateData.completedAt = new Date(updates.completed_at);
     
     await db.task.updateMany({
       where: { 
         id: { in: taskIds },
         createdById: auth.user.id
       },
       data: updateData
     });
     
     return { success: true };
   } catch(error: any) {
     console.error("Error bulk updating tasks:", error);
     return { success: false, error: error.message };
   }
}


// Redefining to be cleaner with specific type for instances
export async function createRecurringInstancesAction(instances: any[]) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const categories = await db.taskCategory.findMany({
      where: { branchId },
    });
    const categoryMap = new Map(categories.map(c => [c.name, c.id]));

    await db.task.createMany({
      data: instances.map(t => ({
        title: t.title,
        description: t.description,
        priority: t.priority === "Medium" ? TaskPriority.NORMAL : t.priority.toUpperCase() as TaskPriority,
        dueDate: t.due_date ? new Date(t.due_date) : undefined,
        categoryId: t.category ? categoryMap.get(t.category) : null,
        reminderEnabled: t.reminder_enabled || false,
        reminderTime: t.reminder_time ? new Date(t.reminder_time) : undefined,
        isRecurring: false,
        recurrenceType: null,
        recurrenceEndDate: null,
        recurrenceCount: t.recurrence_count,
        parentTaskId: t.parent_task_id,
        createdById: auth.user.id,
        branchId,
        completed: false
      }))
    });

    return { success: true, count: instances.length };
  } catch (error: any) {
    console.error("Error creating recurring instances:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRecurringInstancesAction(parentTaskId: string) {
  const auth = await getAuth();
  if (!auth.authorized) throw new Error("Unauthorized");

  try {
    await db.task.deleteMany({
      where: {
        parentTaskId: parentTaskId,
        completed: false, 
        createdById: auth.user.id
      }
    });
    return { success: true };
  } catch (error: any) {
     console.error("Error deleting recurring instances:", error);
     return { success: false, error: error.message };
  }
}
