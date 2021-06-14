<template lang="pug">
v-form.flex-grow-1.d-flex.flex-column(
  @submit.prevent="updateTimecard",
  v-model="isValid",
  style="width: 600px; max-width: 100%"
)
	v-text-field(
		outlined,
		filled,
		dense,
		label="Subject",
		v-model="subject",
		required
	)

	v-textarea(
		outlined,
		filled,
		dense,
		label="Message",
		v-model="message",
		required,
		hide-details
	)

	v-spacer

	v-card-actions
		v-spacer
		v-btn(text, @click="openEmailClient") Send message

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ContactForm extends Vue {
	
}
</script>