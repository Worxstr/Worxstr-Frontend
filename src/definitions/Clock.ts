export type ClockEvent = {
	id: number;
	action: number;
	time: string;
	timecard_id: number;
	employee_id: number;
}

export type Timecard = {
	approved: boolean;
	denied: boolean;
	employee_id: number;
	fees_payment: string;
	first_name: string;
	last_name: string;
	id: number;
	paid: boolean;
	pay_rate: number;
	payout_id: number;
	time_break: string;
	time_clocks: ClockEvent[];
	total_payment: string;
	total_time: string;
	transaction_id: number;
	wage_payment: string;
}

export enum ClockAction {
	ClockIn = 1,
	ClockOut = 2,
	StartBreak = 3,
	EndBreak = 4,
}