import Vue from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { User } from '@/types/Users'
import { Conversation } from '@/types/Messages'
import { isUser, isDebit, Payment } from '@/types/Payments'

dayjs.extend(relativeTime)

const standardDateFormat = 'MMM D, YYYY'
const standardTimeFormat = 'h:mm a'

Vue.filter('capitalize', (value: string) => {
	if (!value) return ''
	return value.charAt(0).toUpperCase() + value.slice(1);
})

Vue.filter('numberFormat', (num: number, precision: number) => {
	return (
		(!precision || precision == 0)
		? Math.round(num)
		: (Math.round(num * precision) / precision)
	).toLocaleString('en')
})

export const date = (value: (string|number|Date), format?: string) => {
	return dayjs(value).format(format || standardDateFormat)
}
Vue.filter('date', date)

export const time = (value: (string|number|Date), format?: string) => {
	return dayjs(value).format(format || standardTimeFormat)
}
Vue.filter('time', time)

export const timeAgo = (value: (string|number|Date)) => {
	return dayjs(value).fromNow()
}
Vue.filter('timeAgo', timeAgo)

// Duration in human readable format, eg. 1 day, 2 hours, 3 minutes
export const duration = (valueMs: number, short = true) => {
	const msPerMinute = 60 * 1000
	const msPerHour = msPerMinute * 60
	const msPerDay = msPerHour * 24
	const msPerWeek = msPerDay * 7
	const string = []

	if (valueMs >= msPerWeek) {
		string.push(Math.round(valueMs / msPerWeek) + (short ? 'w' : ' week'))
		valueMs %= msPerWeek
	}

	if (valueMs >= msPerDay) {
		string.push(Math.round(valueMs / msPerDay) + (short ? 'd' : ' day'))
		valueMs %= msPerDay
	}

	if (valueMs >= msPerHour) {
		string.push(Math.round(valueMs / msPerHour) + (short ? 'h' : ' hour'))
		valueMs %= msPerHour
	}

	if (valueMs >= msPerMinute) {
		string.push(Math.round(valueMs / msPerMinute) + (short ? 'm' : ' minute'))
		valueMs %= msPerMinute
	}

	if (valueMs > 0) {
		string.push(Math.round(valueMs / 1000) + (short ? 's' : ' second'))
	}

	return string.join(', ')
}
Vue.filter('duration', duration)

Vue.filter('dateOrTime', (value: (string|number|Date), format?: string) => {
	if (new Date(value).getTime() < Date.now() - (1000 * 60 * 60 * 24)) {
		return dayjs(value).format(format || standardDateFormat)
	}
	return time(value)
})

export const currency = (value: string | number) => {
	if (!value && value != 0) return 'Invalid value'
	const parsed = typeof value === 'string' ? parseFloat(value) : value
	return '$' + (isNaN(parsed) ? '0.00' : parsed.toFixed(2))
}
Vue.filter('currency', currency)

// 1234567890 -> (123) 456-7890
Vue.filter('phone', (value: string) => {
	if (!value || !value.length) return ''
	return `(${value.substring(0,3)}) ${value.substring(3,6)}-${value.substring(6,10)}`
})

Vue.filter('distance', (value: number) => {
	if (value < 1000) {
		return value + ' m'
	}
	return (value / 1000).toFixed(1) + ' km'
})

Vue.filter('snakeToSpace', (value: string) => {
	return value.replaceAll('_', ' ')
})

Vue.filter('dashesToSpaces', (value: string) => {
	return value.replaceAll('-', ' ')
})

export const fullName = (user: User) => {
	if (!user) return 'Invalid user'
	return `${user.first_name} ${user.last_name}`
}
Vue.filter('fullName', fullName)

export const paymentRecipientName = (payment: Payment, shortName = false) => {
	if (!payment) return 'Invalid payment'

	if (payment.bank_transfer) {
		return payment.bank_transfer.bank_name
	}
	
	const account = isDebit(payment) ? payment.sender : payment.receiver

	if (!account) return 'Invalid account'

	if (isUser(account)) {
		return shortName ? account.first_name : `${account.first_name} ${account.last_name}`
	} else {
		return account.name
	}
}
Vue.filter('paymentRecipientName', paymentRecipientName)

// Create a string that lists users names from an array of users, filtering the authenticated user
// [{first: 'Bob', last: 'Vance'}, {first: 'Ada', last: 'Lovelace'}]								-> 'Ada Lovelace'
// [{first: 'Bob', last: 'Vance'}, {first: 'Ada', last: 'Lovelace', {first: 'Tim', last: 'Allen'}}] -> 'Bob, Tim'
export const groupNameList = (group: Conversation, me: User | null) => {
	if (!group.participants || !group.participants.length) return ''
	return group.participants
		.filter(u =>
			u.id != me?.id
		)
		.map(u =>
			(group.participants.length == 2) ? Vue.filter('fullName')(u) : u.first_name
		)
		.join(', ')
}
Vue.filter('groupNameList', groupNameList)