import { User } from "@/@types/user";

export function canManage(user: Partial<User> | undefined | null) {
    if (!user || !user.role) {
        return false
    } else {
        return user.role === "manager" || user.role === "admin";
    }
}

export function isAdmin(user:Partial<User> | null | undefined) {
    if (!user || !user.role) {
        return false
    } else {
        return  user.role === "admin";
    }
}
