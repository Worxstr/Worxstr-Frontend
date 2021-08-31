import { ClockEvent } from './Clock'

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

export type FundingSource = {
  location: string;
  name: string;
}

type Link = {
	href: string;
	type: string;
	'resource-type': 'transfer' | 'account' | 'customer' | 'funding-source';
	'additional-information'?: {
		_links: {
			customer: Link;
			remove: Link;
			self: Link;
			'transfer-from-balance': Link;
			'transfer-receive': Link;
			'transfer-send': Link;
			'transfer-to-balance': Link;
		};
		bankAccountType: string;
		bankName: string;
		channels: string[];
		created: string;
		fingerprint: string;
		id: string;
		name: string;
		removed: boolean;
		status: string;
		type: string;
	};
}

export type Transfer = {
  _links: {
    destination: Link;
    self: Link;
    source: Link;
    'source-funding-source': Link;
  }
  amount: {
    currecny: string;
    value: string;
  }
  clearing: {
    source: string;
  }
  created: string;
  id: string;
  individualAchId: string;
  status: string;
}
