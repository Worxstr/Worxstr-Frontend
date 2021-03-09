import Vue from 'vue'
import dayjs from 'dayjs'

Vue.filter('capitalize', value => {
	return value.charAt(0).toUpperCase() + value.slice(1);
})

Vue.filter('date', (value, format) => {
	return dayjs(value).format(format || 'YYYY-MM-DD')
})

Vue.filter('time', (value, format) => {
	console.log(value)
	console.log(new Date(value))
	return dayjs(value).format(format || 'h:mm a')
})

Vue.filter('snakeToSpace', value => {
	return value.replaceAll('_', ' ')
})

Vue.filter('fullName', user => {
	if (!user) return 'Invalid user'
	return `${user.first_name} ${user.last_name}`
})