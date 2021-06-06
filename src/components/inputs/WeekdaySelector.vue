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

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"

const daysOfWeek = ['su','m','t','w','tr','f','s']

@Component
export default class WeekdaySelector extends Vue {
	selectedDays: string[] = []

	@Prop({ default: [] }) readonly value!: string[]

	mounted() {
		this.selectedDays = this.value
	}
	update() {
		this.$emit('input', this.selectedDays)
	}
	get daySelected() {
		const data: any = {};
		daysOfWeek.map((day: string) => {
			data[day] = this.value.includes(day)
		})
		return data
	}
}
</script>