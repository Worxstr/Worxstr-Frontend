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

// Take a list of roles as parameters
// and a user and determine if the user has one of those roles
export function userIs(user: User, ...roles: UserRole[]) {
	return roles.some((role) => user.roles.map((r) => r.id).includes(role))
}

export function currentUserIs(...roles: UserRole[]) {
	if (!store.state.authenticatedUser) return false
	return userIs(store.state.authenticatedUser, ...roles)
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