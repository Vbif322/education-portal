import { db } from "@/db/db";
import { adminActions, accessLogs } from "@/db/schema/index";

export class AuditService {
  /**
   * Логирование админских действий
   */
  async logAdminAction(params: {
    userId: string;
    userEmail: string;
    userRole: "manager" | "admin";
    actionType: string;
    resourceType: "course" | "module" | "lesson" | "user" | "subscription" | "skill" | "access";
    resourceId: string;
    targetUserId?: string;
    targetUserEmail?: string;
    changesBefore?: unknown;
    changesAfter?: unknown;
    userAgent?: string;
    status: "success" | "failure";
    errorMessage?: string;
  }) {
    try {
      await db.insert(adminActions).values({
        userId: params.userId,
        userEmail: params.userEmail,
        userRole: params.userRole,
        actionType: params.actionType,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        targetUserId: params.targetUserId || null,
        targetUserEmail: params.targetUserEmail || null,
        changesBefore: params.changesBefore ? JSON.stringify(params.changesBefore) : null,
        changesAfter: params.changesAfter ? JSON.stringify(params.changesAfter) : null,
        userAgent: params.userAgent || null,
        status: params.status,
        errorMessage: params.errorMessage || null,
      });

    } catch (error) {
      console.error("[AuditService] Failed to log admin action:", error);
      // Не бросаем ошибку - логирование не должно ломать основную логику
    }
  }

  /**
   * Логирование изменений доступа
   */
  async logAccessChange(params: {
    action: "grant" | "revoke";
    accessType: "course" | "lesson";
    userId: string;
    userEmail: string;
    resourceId: number;
    resourceName?: string;
    grantedBy: string;
    grantedByEmail: string;
    grantedByRole: "manager" | "admin";
    expiresAt?: Date | null;
    reason?: string;
  }) {
    try {
      await db.insert(accessLogs).values({
        action: params.action,
        accessType: params.accessType,
        userId: params.userId,
        userEmail: params.userEmail,
        resourceId: params.resourceId,
        resourceName: params.resourceName || null,
        grantedBy: params.grantedBy,
        grantedByEmail: params.grantedByEmail,
        grantedByRole: params.grantedByRole,
        expiresAt: params.expiresAt || null,
        reason: params.reason || null,
      });

    } catch (error) {
      console.error("[AuditService] Failed to log access change:", error);
      // Не бросаем ошибку - логирование не должно ломать основную логику
    }
  }
}

// Singleton экземпляр сервиса
export const auditService = new AuditService();
