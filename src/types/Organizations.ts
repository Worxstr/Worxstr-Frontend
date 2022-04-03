type SubscriptionTier = {
  id: number
  business_ach_fee: string
  business_same_day_fee: string
  contractor_ach_fee: string
  annual: boolean
  monthly_rate: string
  num_contractors: number
  tier_code: string
  transfer_fee: string
}

export type Organization = {
	id: number
  name: string
  dwolla_customer_url: string
  dwolla_customer_status: string
  minimum_wage: number
  creation_date: string
  next_payment_date: string
  subscription_tier_id: number
  subscription_tier: SubscriptionTier
}
