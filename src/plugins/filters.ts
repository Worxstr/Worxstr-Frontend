import Vue from 'vue'
import dayjs from 'dayjs'
import { User } from '@/definitions/User'
import { Conversation } from '@/definitions/Messages'

Vue.filter('capitalize', (value: string) => {
	return value.charAt(0).toUpperCase() + value.slice(1);
})

Vue.filter('numberFormat', (num: number, precision: number) => {
	return (
		(!precision || precision == 0)
		? Math.round(num)
		: (Math.round(num * precision) / precision)
	).toLocaleString('en')
})

Vue.filter('date', (value: (string|number|Date), format: string) => {
	return dayjs(value).format(format || 'YYYY-MM-DD')
})

Vue.filter('time', (value: (string|number|Date), format: string) => {
	return dayjs(value).format(format || 'h:mm a')
})

// 1234567890 -> (123) 456-7890
Vue.filter('phone', (value: string) => {
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
export const groupNameList = (group: Conversation, authenticatedUser: User | null) => {
	return group.participants
		.filter(u =>
			u.id != authenticatedUser?.id
		)
		.map(u =>
			(group.participants.length == 2) ? Vue.filter('fullName')(u) : u.first_name
		)
		.join(', ')
}
Vue.filter('groupNameList', groupNameList)