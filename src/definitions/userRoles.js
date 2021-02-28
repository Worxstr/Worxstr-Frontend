export const EMPLOYEE = 1
export const EMPLOYEE_MANAGER = 2
export const ORGANIZATION_MANAGER = 3

// Take a role and a user and determine if the user has that role
export function userIs(role, user) {
    return user.roles.map((r) => r.id).includes(role)
}