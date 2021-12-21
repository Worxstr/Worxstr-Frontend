import { ClockState } from '@/store/clock'
import { ClockEvent } from './Clock'
import { User } from './Users'

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
	contractor_manager?: User;
	organization_manager?: User;
	shifts?: Shift[];
	contractors: User[];
	managers: {
		contractor_managers: User[];
		organization_managers: User[];
	};
}

export type Shift = {
	id: number;
	active: boolean;
	job_id: number;
	clock_state: ClockEvent;
	contractor: User;
	contractor_id: number;
	site_location: string;
	time_begin: string;
	time_end: string;
	timecard_id: number;
	timeclock_actions: ClockEvent[];
	tasks: Task[];
}

export type Task = {
	id: number;
	shift_id: number;
	title: string;
	description: string;
	complete: boolean;
	time_complete: string;
}