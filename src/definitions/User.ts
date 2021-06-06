import store from "@/store"

export type User = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	roles: Role[];
	[key: string]: any;
}

export type Role = {
	id: UserRole;
	name: string;
}

export enum UserRole {
	Employee = 1,
	EmployeeManager = 2,
	OrganizationManager = 3,
}

export const Manager = [
	UserRole.EmployeeManager,
	UserRole.OrganizationManager,
]

// Take a role and a user and determine if the user has that role
export function userIs(role: UserRole, user: User) {
	return user.roles.map((r) => r.id).includes(role)
}

export function defaultRoute() {
	const user = store.state.authenticatedUser
	if (!user || !user.roles) return 'schedule'

	switch (user?.roles[0]?.id) {
		case UserRole.Employee:
			return 'clock'
		case UserRole.EmployeeManager:
		case UserRole.OrganizationManager:
			return 'jobs'
		default:
			return 'schedule'
	}
}