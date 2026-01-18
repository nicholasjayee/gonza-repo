export const Permissions = {
    ADMIN: 'admin',
    USER: 'user',
    MANAGER: 'manager',
};

export const canAccess = (userRole: string, requiredRole: string) => {
    const roles = [Permissions.USER, Permissions.MANAGER, Permissions.ADMIN];
    return roles.indexOf(userRole) >= roles.indexOf(requiredRole);
};
