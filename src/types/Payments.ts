import { ClockEvent } from './Jobs'
import { Organization } from './Organizations'
import { Shift } from './Jobs'
import { User } from './Users'
import usersStore from '@/store/users'

type Timecard = {
  id: number
  contractor_id: number
  first_name: string
  last_name: string
  time_break: string
  total_time: string
  wage_payment: string
  fees_payment: string
  total_payment: string
  denied: boolean
  paid: boolean
  shift_id?: number
  shift?: Shift
}

type InvoiceItem = {
  id: number
  invoice_id: number
  amount: string
  description: string
}

type Invoice = {
  id: number
  amount: string
  description: string
  approved: boolean
  date_created: string
  items: InvoiceItem[]
  timecard_id?: number
  timecard?: Timecard
}

type BankTransfer = {
  id: number
  amount: number
  transaction_type: string
  bank_name: string
  status: string
  status_updated: string
}

export type Payment = {
  id: number
  amount: string
  fee: string
  total: string
  date_completed: string
  receiver_dwolla_url: string
  receiver: User | Organization
  sender_dwolla_url: string
  sender: User | Organization
  dwolla_fee_transaction_id: string
  dwolla_payment_transaction_id: string
  invoice?: Invoice
  invoice_id: number
  bank_transfer?: BankTransfer
  bank_transfer_id: number
}

type Links = {
  self: Link
  [key: string]: Link
}

type Link = {
	href: string
	type: string
	'resource-type': 'transfer' | 'account' | 'customer' | 'funding-source'
	'additional-information'?: {
		_links: Links
		bankAccountType: string
		bankName: string
		channels: string[]
		created: string
		fingerprint: string
		id: string
		name: string
		removed: boolean
		status: string
		type: string
	}
}

export type FundingSource = {
  _links: Links
  bankAccountType: string
  bankName: string
  channels: string[]
  created: string
  fingerprint: string
  id: string
  name: string
  removed: boolean
  status: string
  type: string
}

// Determine if a payment recipient is an organization or a user
export function isUser(account: User | Organization): account is User {
  return (account as User).first_name !== undefined
}
  
// Determine if payment is inbound (debit) or outbound (credit), e.g. "From" or "To"
export function isDebit(payment: Payment) {
  if (isUser(payment.receiver)) {
    // Receiver is a user
    return payment.receiver.id === usersStore.getters.me(usersStore.state)?.id

  } else {
    // Receiver is an organization
    return true
  }
}