<template lang="pug">
.d-flex.align-center.pt-1
	v-checkbox.mt-0(
		v-model='selectedDays'
		:value='daySelected.su'
		on-icon="mdi-alpha-s-circle",
		off-icon="mdi-alpha-s-circle-outline",
		value="su"
		@change='update'
	)
	v-checkbox.mt-0(
		v-model='selectedDays'
		:value='daySelected.m'
		on-icon="mdi-alpha-m-circle",
		off-icon="mdi-alpha-m-circle-outline",
		value="m"
		@change='update'
	)
	v-checkbox.mt-0(
		v-model='selectedDays'
		:value='daySelected.t'
		on-icon="mdi-alpha-t-circle",
		off-icon="mdi-alpha-t-circle-outline",
		value="t"
		@change='update'
	)
	v-checkbox.mt-0(
		v-model='selectedDays'
		:value='daySelected.w'
		on-icon="mdi-alpha-w-circle",
		off-icon="mdi-alpha-w-circle-outline",
		value="w"
		@change='update'
	)
	v-checkbox.mt-0(
		v-model='selectedDays'
		:value='daySelected.tr'
		on-icon="mdi-alpha-t-circle",
		off-icon="mdi-alpha-t-circle-outline",
		value="tr"
		@change='update'
	)
	v-checkbox.mt-0(
		v-model='selectedDays'
		:value='daySelected.f'
		on-icon="mdi-alpha-f-circle",
		off-icon="mdi-alpha-f-circle-outline",
		value="f"
		@change='update'
	)
	v-checkbox.mt-0(
		v-model='selectedDays'
		:value='daySelected.s'
		on-icon="mdi-alpha-s-circle",
		off-icon="mdi-alpha-s-circle-outline",
		value="s"
		@change='update'
	)
</template>

<script>
import { Vue, Component, Prop } from "vue-property-decorator"

const daysOfWeek = ['su','m','t','w','tr','f','s']

export default {
	name: 'WeekdaySelector',
	props: ['value'],
	mounted() {
		this.selectedDays = this.value
	},
	data: () => ({
		selectedDays: []
	}),
	methods: {
		update(val) {
			this.$emit('input', this.selectedDays)
		}
	},
	computed: {
		daySelected() {
			const data = {};
			daysOfWeek.map(day => {
				data[day] = this.value.includes(day)
			})
			console.log(data)
			return data
		}
	}
}

// @Component({
// 	props: ['value'],
// 	methods: {
// 		update(val) {
// 			console.log('update')
// 			this.$emit('input', val)
// 		}
// 	}
// })
// export default class WeekdaySelector extends Vue {
// 	// @Prop({ default: [] }) readonly value!: string[]
// }
</script>