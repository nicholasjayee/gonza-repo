"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@gonza/shared/prisma/db";
import { authGuard } from "@gonza/shared/middleware/authGuard";
import { headers, cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getActiveBranch } from "@/branches/api/branchContext";
import { serialize } from "@/shared/utils/serialize";
import { ActivityFilters, ActivityHistoryItem } from "@/types/activity";

async function getAuth() {
  const headerList = await headers();
  const cookieStore = await cookies();

  const mockReq = {
    headers: headerList,
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
  } as unknown as NextRequest;

  return authGuard(mockReq, ["user", "admin", "superadmin"]);
}

export async function logActivityAction(data: {
  activityType: string;
  module: string;
  entityType: string;
  entityId?: string;
  entityName: string;
  description: string;
  metadata?: any;
  profileId?: string;
  profileName?: string;
}) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const { branchId } = await getActiveBranch();
    if (!branchId) throw new Error("No active branch found");

    const activity = await db.activityHistory.create({
      data: {
        userId: auth.user.id,
        locationId: branchId,
        activityType: data.activityType as any,
        module: data.module as any,
        entityType: data.entityType,
        entityId: data.entityId || null,
        entityName: data.entityName,
        description: data.description,
        metadata: data.metadata || null,
        profileId: data.profileId || null,
        profileName: data.profileName || null,
      }
    });

    return { success: true, data: serialize(activity) };
  } catch (error: any) {
    console.error("Error logging activity:", error);
    return { success: false, error: error.message || "Failed to log activity" };
  }
}

export async function getActivityHistoryAction(
  locationId: string,
  page: number = 1,
  pageSize: number = 20,
  filters?: ActivityFilters
) {
  const auth = await getAuth();
  if (!auth.authorized) return { success: false, error: "Unauthorized" };

  try {
    const skip = (page - 1) * pageSize;

    const where: any = {
      locationId: locationId,
      userId: auth.user.id,
    };

    if (filters) {
      if (filters.activityType !== 'ALL') {
        where.activityType = filters.activityType;
      }
      if (filters.module !== 'ALL') {
        where.module = filters.module;
      }
      if (filters.search) {
        where.OR = [
            { entityName: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
      if (filters.dateRange.from) {
        where.createdAt = { ...where.createdAt, gte: filters.dateRange.from };
      }
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt = { ...where.createdAt, lte: toDate };
      }
    }

    const [activities, count] = await Promise.all([
      db.activityHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip,
      }),
      db.activityHistory.count({ where }),
    ]);


    const mappedActivities: ActivityHistoryItem[] = activities.map((a: any) => ({
      id: a.id,
      user_id: a.userId,
      location_id: a.locationId,
      activity_type: a.activityType,
      module: a.module,
      entity_type: a.entityType,
      entity_id: a.entityId,
      entity_name: a.entityName,
      description: a.description,
      metadata: a.metadata,
      created_at: a.createdAt.toISOString(),
      profile_id: a.profileId,
      profile_name: a.profileName,
    }));

    return { success: true, data: { activities: mappedActivities, count } };
  } catch (error: any) {
    console.error("Error fetching activity history:", error);
    return { success: false, error: error.message || "Failed to fetch activity history" };
  }
}
