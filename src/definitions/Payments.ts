import { ClockEvent } from "./Clock"


export type FundingSource = {
  location: string;
  name: string;
}

export type Timecard = {
	approved: boolean;
	denied: boolean;
	contractor_id: number;
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