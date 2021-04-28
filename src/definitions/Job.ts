import { User } from "./User"

export type Job = {
	active: boolean;
	address: string;
	city: string;
	consultant_name: string;
	consultant_code: string;
	consultant_email: string;
	consultant_phone: string;
	country: string;
	direct: boolean;
	employee_manager_id: number;
	id: number;
	latitude: number;
	longitude: number;
	name: string;
	organization_id: number;
	organization_manager: number;
	state: string;
	shifts: Shift[];
	zip_code: string;
}

export type Shift = {
	id: number;
	employee: User;
	employee_id: number;
	site_location: string;
	time_begin: string;
	time_end: string;
	timecard_id: number;
}