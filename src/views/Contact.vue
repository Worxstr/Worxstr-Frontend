<template lang="pug">
v-container.d-flex.flex-column.justify-center.align-center.pa-16
	p.text-h4.font-weight-bold.mb-15 Contact us

	v-form.flex-grow-1.d-flex.flex-column(@submit.prevent="updateTimecard", v-model="isValid" style='width: 600px; max-width: 100%')
				
		v-text-field(
			outlined,
			dense,
			label="Your name",
			v-model="name",
			:rules="f",
			required
		)
		v-text-field(
			outlined,
			dense,
			label="Your email",
			v-model="name",
			:rules="f",
			required
		)
		v-textarea(
			outlined,
			dense,
			label="Message",
			v-model="name",
			:rules="f",
			required
		)

		v-spacer
		
		v-card-actions
			v-spacer
			v-btn(text, @click="updateTimecard") Send message
</template>

<script>
export default {
	name: "contact",
	metaInfo: {
		title: "Contact us",
	},
};
</script>