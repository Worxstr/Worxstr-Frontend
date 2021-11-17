import Vue from 'vue'
import dayjs from 'dayjs'

import { User } from '@/types/Users'
import { Conversation } from '@/types/Messages'

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
	return dayjs(value).format(format || 'YYYY-MM-DD')
}
Vue.filter('date', date)

export const time = (value: (string|number|Date), format?: string) => {
	return dayjs(value).format(format || 'h:mm a')
}
Vue.filter('time', time)

Vue.filter('dateOrTime', (value: (string|number|Date)) => {
	if (new Date(value).getTime() < Date.now() - (1000 * 60 * 60 * 24)) {
		return date(value)
	}
	return time(value)
})

Vue.filter('currency', (value: string) => {
	const parsed = parseFloat(value)
	return '$' + (isNaN(parsed) ? '0.00' : parsed.toFixed(2))
})

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

export const fullName = (user: User) => {
	if (!user) return 'Invalid user'
	return `${user.first_name} ${user.last_name}`
}
Vue.filter('fullName', fullName)

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