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
	Contractor = 1,
	ContractorManager = 2,
	OrganizationManager = 3,
}

export const Managers = [
	UserRole.ContractorManager,
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
		case UserRole.Contractor:
			return 'clock'
		case UserRole.ContractorManager:
		case UserRole.OrganizationManager:
			return 'jobs'
		default:
			return 'schedule'
	}
}