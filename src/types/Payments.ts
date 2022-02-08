import { ClockEvent } from './Clock'

type InvoiceItem = {
  id: number;
  invoice_id: number;
  amount: string;
  description: string;
}

type Invoice = {
  id: number;
  amount: string;
  description: string;
  approved: boolean;
  date_created: string;
  items: InvoiceItem[];
}

type BankTransfer = {
  id: number;
  amount: number;
  transaction_type: string;
  bank_name: string;
  status: string;
  status_updated: string;
}

export type Payment = {
  id: number;
  amount: string;
  fee: string;
  total: string;
  date_completed: string;
  receiver_dwolla_url: string;
  sender_dwolla_url: string;
  dwolla_fee_transaction_id: string;
  dwolla_payment_transaction_id: string;
  invoice?: Invoice;
  invoice_id: number;
  bank_transfer?: BankTransfer,
  bank_transfer_id: number;
}

// export type Timecard = {
//   approved: boolean;
//   denied: boolean;
//   contractor_id: number;
//   fees_payment: string;
//   first_name: string;
//   last_name: string;
//   id: number;
//   paid: boolean;
//   pay_rate: number;
//   payout_id: number;
//   time_break: string;
//   time_clocks: ClockEvent[];
//   total_payment: string;
//   total_time: string;
//   transaction_id: number;
//   wage_payment: string;
// }

type Links = {
  self: Link;
  [key: string]: Link;
}

type Link = {
	href: string;
	type: string;
	'resource-type': 'transfer' | 'account' | 'customer' | 'funding-source';
	'additional-information'?: {
		_links: Links;
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

export type FundingSource = {
  _links: Links;
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
}

// export type Transfer = {
//   _links: Links;
//   amount: {
//     currecny: string;
//     value: string;
//   }
//   clearing: {
//     source: string;
//   }
//   created: string;
//   id: string;
//   individualAchId: string;
//   status: string;
// }
