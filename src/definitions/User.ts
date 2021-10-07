import usersStore from '@/store/users'

export type User = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	roles: Role[];
	contractor_info?: {
		[key: string]: any;
	};
	manager_info?: {
		[key: string]: any;
	};
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

export const userRoles = Object
	.keys(UserRole)
	.map((key: any) => ({ id: key, name: UserRole[key] }))
	.slice(0, Object.keys(UserRole).length / 2) // Get first half, just keys. Other half is indicies
	.map(r => ({
		id: r.id,
		name: r.name.replace(/([A-Z])/g, ' $1').split(' ').join('_').toLowerCase().substring(1)
	})) // Convert to snake case


export const Managers = [
	UserRole.ContractorManager,
	UserRole.OrganizationManager,
]

export function isAuthenticated() {
	return !!usersStore.state.authenticatedUser
}

// Take a list of roles as parameters
// and a user and determine if the user has one of those roles
export function userIs(user: User, ...roles: UserRole[]): boolean {
	if (!user.roles) return false
	return roles.some((role) => user.roles.map((r) => r.id).includes(role))
}

export function currentUserIs(...roles: UserRole[]): boolean {
	if (!usersStore.state.authenticatedUser) return false
	return userIs(usersStore.state.authenticatedUser, ...roles)
}

export function defaultRoute() {
	const user = usersStore.state.authenticatedUser
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