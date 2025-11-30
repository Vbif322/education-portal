import { User } from "@/@types/user";

export function canManage(user: Partial<User> | undefined | null): user is User & { role: 'admin' | 'manager' } {
    if (!user || !user.role) {
        return false
    } else {
        return user.role === "manager" || user.role === "admin";
    }
}

export function isAdmin(user: Partial<User> | null | undefined): user is User & { role: 'admin' } {
    if (!user || !user.role) {
        return false
    } else {
        return user.role === "admin";
    }
}
