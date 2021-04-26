import Vue from 'vue'
import dayjs from 'dayjs'

Vue.filter('capitalize', value => {
	return value.charAt(0).toUpperCase() + value.slice(1);
})

Vue.filter('date', (value, format) => {
	return dayjs(value).format(format || 'YYYY-MM-DD')
})

Vue.filter('time', (value, format) => {
	return dayjs(value).format(format || 'h:mm a')
})

// 1234567890 -> (123) 456-7890
Vue.filter('phone', value => {
	return `(${value.substring(0,3)}) ${value.substring(3,6)}-${value.substring(6,10)}`
})

Vue.filter('snakeToSpace', value => {
	return value.replaceAll('_', ' ')
})

Vue.filter('fullName', user => {
	if (!user) return 'Invalid user'
	return `${user.first_name} ${user.last_name}`
})

// Create a string that lists users names from an array of users, filtering the authenticated user
// [{first: 'Bob', last: 'Vance'}, {first: 'Ada', last: 'Lovelace'}]								-> 'Ada Lovelace'
// [{first: 'Bob', last: 'Vance'}, {first: 'Ada', last: 'Lovelace', {first: 'Tim', last: 'Allen'}}] -> 'Bob, Tim'
Vue.filter('groupNameList', (group, authenticatedUser) => {
	return group.participants
		.filter(u =>
			u.id != authenticatedUser.id
		)
		.map(u =>
			group.participants.length == 2 ? Vue.filter('fullName')(u) : u.first_name
		)
		.join(', ')
})