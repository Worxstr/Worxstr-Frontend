import { User } from './User'

export type Job = {
	id: number;
	name: string;
	active: boolean;
	direct: boolean;
	radius: number;
	color: string;
	city: string;
	state: string;
	address: string;
	zip_code: string;
	country: string;
	consultant_name: string;
	consultant_code: string;
	consultant_email: string;
	consultant_phone: string;
	latitude: number;
	longitude: number;
	organization_id: number;
	organization_manager_id: number;
	contractor_manager_id: number;
	shifts: Shift[];
	contractors: User[];
	managers: User[];
}

export type Shift = {
	id: number;
	contractor: User;
	contractor_id: number;
	site_location: string;
	time_begin: string;
	time_end: string;
	timecard_id: number;
}